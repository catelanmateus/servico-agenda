import { NextRequest, NextResponse } from 'next/server'
import whatsappService from '../../../../../lib/whatsappService'

// Simulação de banco de dados
let appointments: any[] = []

// GET - Buscar agendamento por token
export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params

    if (!token) {
      return NextResponse.json(
        { error: 'Token é obrigatório' },
        { status: 400 }
      )
    }

    // Buscar agendamento pelo token
    const appointment = appointments.find(apt => apt.cancelToken === token)

    if (!appointment) {
      return NextResponse.json(
        { error: 'Agendamento não encontrado ou token inválido' },
        { status: 404 }
      )
    }

    // Verificar se já foi cancelado
    if (appointment.status === 'cancelled') {
      return NextResponse.json(
        { error: 'Este agendamento já foi cancelado' },
        { status: 400 }
      )
    }

    // Buscar informações do serviço
    const services = [
      { id: 'corte', name: 'Corte', price: 25, duration: 30, icon: '' },
      { id: 'barba', name: 'Barba', price: 15, duration: 20, icon: '' },
      { id: 'combo', name: 'Corte + Barba', price: 35, duration: 45, icon: '' },
    ]

    const service = services.find(s => s.id === appointment.serviceId)

    const appointmentWithService = {
      ...appointment,
      service: service?.name || 'Serviço não encontrado'
    }

    return NextResponse.json({
      appointment: appointmentWithService
    })

  } catch (error) {
    console.error('Erro ao buscar agendamento:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Cancelar agendamento por token
export async function DELETE(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params

    if (!token) {
      return NextResponse.json(
        { error: 'Token é obrigatório' },
        { status: 400 }
      )
    }

    // Buscar agendamento pelo token
    const appointmentIndex = appointments.findIndex(apt => apt.cancelToken === token)

    if (appointmentIndex === -1) {
      return NextResponse.json(
        { error: 'Agendamento não encontrado ou token inválido' },
        { status: 404 }
      )
    }

    const appointment = appointments[appointmentIndex]

    // Verificar se já foi cancelado
    if (appointment.status === 'cancelled') {
      return NextResponse.json(
        { error: 'Este agendamento já foi cancelado' },
        { status: 400 }
      )
    }

    // Cancelar o agendamento
    appointments[appointmentIndex].status = 'cancelled'
    appointments[appointmentIndex].cancelledAt = new Date().toISOString()

    // Buscar informações do serviço para o WhatsApp
    const services = [
      { id: 'corte', name: 'Corte', price: 25, duration: 30, icon: '' },
      { id: 'barba', name: 'Barba', price: 15, duration: 20, icon: '' },
      { id: 'combo', name: 'Corte + Barba', price: 35, duration: 45, icon: '' },
    ]

    const service = services.find(s => s.id === appointment.serviceId)

    // Enviar notificação de cancelamento por WhatsApp
    try {
      if (service) {
        await whatsappService.sendAppointmentCancellation({
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
        console.log('✅ WhatsApp de cancelamento enviado')
      }
    } catch (whatsappError) {
      console.error('❌ Erro ao enviar WhatsApp de cancelamento:', whatsappError)
      // Não falha o cancelamento se o WhatsApp falhar
    }

    return NextResponse.json({
      message: 'Agendamento cancelado com sucesso!',
      appointment: appointments[appointmentIndex]
    })

  } catch (error) {
    console.error('Erro ao cancelar agendamento:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}