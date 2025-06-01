import { NextRequest, NextResponse } from 'next/server'
import { format, parseISO, subHours, isAfter, isBefore, addMinutes } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import whatsappService from '../../../lib/whatsappService'
import whatsappTemplates from '../../../utils/whatsappTemplates'

// Simulação de banco de dados
let appointments: any[] = []

// GET - Verificar e enviar lembretes
export async function GET(request: NextRequest) {
  try {
    const now = new Date()
    const oneHourFromNow = addMinutes(now, 60)
    const fiveMinutesFromNow = addMinutes(now, 5) // Janela de 5 minutos para envio
    
    console.log('🔍 Verificando lembretes...', {
      agora: format(now, 'dd/MM/yyyy HH:mm'),
      umaHora: format(oneHourFromNow, 'dd/MM/yyyy HH:mm')
    })

    // Buscar agendamentos que precisam de lembrete
    const appointmentsNeedingReminder = appointments.filter(appointment => {
      if (appointment.status !== 'confirmed') return false
      if (appointment.reminderSent) return false
      
      // Combinar data e hora do agendamento
      const appointmentDateTime = new Date(`${appointment.date}T${appointment.time}:00`)
      const reminderTime = subHours(appointmentDateTime, 1)
      
      // Verificar se está na janela de envio (entre agora e 5 minutos à frente)
      return isAfter(reminderTime, now) && isBefore(reminderTime, fiveMinutesFromNow)
    })

    console.log(`📋 Encontrados ${appointmentsNeedingReminder.length} agendamentos para lembrete`)

    const results = []
    
    for (const appointment of appointmentsNeedingReminder) {
      try {
        // Buscar informações do serviço
        const services = [
          { id: 'corte', name: 'Corte', price: 25, duration: 30, icon: '✂️' },
          { id: 'barba', name: 'Barba', price: 15, duration: 20, icon: '🧔' },
          { id: 'combo', name: 'Corte + Barba', price: 35, duration: 45, icon: '✂️🧔' },
        ]
        
        const service = services.find(s => s.id === appointment.serviceId)
        
        if (service) {
          // Enviar lembrete por WhatsApp
          await whatsappService.sendAppointmentReminderUrgent({
            service: {
              icon: service.icon,
              name: service.name,
              price: service.price
            },
            date: new Date(appointment.date),
            time: appointment.time,
            clientName: appointment.name,
            phone: appointment.phone
          })
          
          // Marcar como enviado
          const appointmentIndex = appointments.findIndex(apt => apt.id === appointment.id)
          if (appointmentIndex !== -1) {
            appointments[appointmentIndex].reminderSent = true
            appointments[appointmentIndex].reminderSentAt = new Date().toISOString()
          }
          
          // Em ambiente servidor, simular salvamento
          console.log(`✅ Lembrete enviado e marcado para agendamento ${appointment.id}`)
          
          results.push({
            appointmentId: appointment.id,
            clientName: appointment.name,
            phone: appointment.phone,
            time: appointment.time,
            status: 'sent'
          })
          
          console.log(`✅ Lembrete enviado para ${appointment.name} (${appointment.phone})`)
        }
      } catch (error) {
        console.error(`❌ Erro ao enviar lembrete para ${appointment.name}:`, error)
        results.push({
          appointmentId: appointment.id,
          clientName: appointment.name,
          phone: appointment.phone,
          time: appointment.time,
          status: 'error',
          error: error instanceof Error ? error.message : String(error)
        })
      }
    }

    return NextResponse.json({
      message: `Verificação de lembretes concluída`,
      timestamp: new Date().toISOString(),
      totalChecked: appointments.length,
      remindersSent: results.filter(r => r.status === 'sent').length,
      errors: results.filter(r => r.status === 'error').length,
      results
    })

  } catch (error) {
    console.error('❌ Erro no sistema de lembretes:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

// POST - Configurar lembrete manual (para testes)
export async function POST(request: NextRequest) {
  try {
    const { appointmentId, testMode = false } = await request.json()
    
    if (!appointmentId) {
      return NextResponse.json(
        { error: 'ID do agendamento é obrigatório' },
        { status: 400 }
      )
    }

    const appointment = appointments.find(apt => apt.id === appointmentId)
    
    if (!appointment) {
      return NextResponse.json(
        { error: 'Agendamento não encontrado' },
        { status: 404 }
      )
    }

    if (appointment.status !== 'confirmed') {
      return NextResponse.json(
        { error: 'Agendamento não está confirmado' },
        { status: 400 }
      )
    }

    // Buscar informações do serviço
    const services = [
      { id: 'corte', name: 'Corte', price: 25, duration: 30, icon: '✂️' },
      { id: 'barba', name: 'Barba', price: 15, duration: 20, icon: '🧔' },
      { id: 'combo', name: 'Corte + Barba', price: 35, duration: 45, icon: '✂️🧔' },
    ]
    
    const service = services.find(s => s.id === appointment.serviceId)
    
    if (!service) {
      return NextResponse.json(
        { error: 'Serviço não encontrado' },
        { status: 404 }
      )
    }

    // Enviar lembrete
    await whatsappService.sendAppointmentReminderUrgent({
      service: {
        icon: service.icon,
        name: service.name,
        price: service.price
      },
      date: new Date(appointment.date),
      time: appointment.time,
      clientName: appointment.name,
      phone: appointment.phone
    })
    
    // Marcar como enviado (apenas se não for teste)
    if (!testMode) {
      const appointmentIndex = appointments.findIndex(apt => apt.id === appointmentId)
      if (appointmentIndex !== -1) {
        appointments[appointmentIndex].reminderSent = true
        appointments[appointmentIndex].reminderSentAt = new Date().toISOString()
      }
    }

    return NextResponse.json({
      message: 'Lembrete enviado com sucesso',
      appointmentId,
      clientName: appointment.name,
      phone: appointment.phone,
      testMode
    })

  } catch (error) {
    console.error('❌ Erro ao enviar lembrete manual:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}