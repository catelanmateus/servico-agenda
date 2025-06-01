import { NextRequest, NextResponse } from 'next/server'
import { format } from 'date-fns'
import whatsappService from '../../../lib/whatsappService'

// Simulação de banco de dados em memória (substituir por banco real)
let appointments: any[] = []
let tempReservations: any[] = []

// Função para gerar slots inteligentes baseados na duração do serviço
function generateSmartSlots(serviceDuration: number, date: string, barberId: string) {
  // Horários de funcionamento
  const workingHours = {
    morning: { start: '09:00', end: '12:00' },
    afternoon: { start: '14:00', end: '18:00' }
  }

  // Intervalo fixo de 15 minutos para todos os horários
  const slotInterval = 15

  const slots: string[] = []

  // Gerar slots para manhã
  let currentTime = timeToMinutes(workingHours.morning.start)
  const morningEnd = timeToMinutes(workingHours.morning.end)
  
  while (currentTime + serviceDuration <= morningEnd) {
    slots.push(minutesToTime(currentTime))
    currentTime += slotInterval
  }

  // Gerar slots para tarde
  currentTime = timeToMinutes(workingHours.afternoon.start)
  const afternoonEnd = timeToMinutes(workingHours.afternoon.end)
  
  while (currentTime + serviceDuration <= afternoonEnd) {
    slots.push(minutesToTime(currentTime))
    currentTime += slotInterval
  }

  return slots
}

// Funções auxiliares para conversão de tempo
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
}

// GET - Buscar agendamentos disponíveis
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date')
  const serviceId = searchParams.get('serviceId')
  const totalDuration = searchParams.get('totalDuration')
  const barberId = searchParams.get('barberId') || '1'

  try {
    if (date) {
      // Retorna horários disponíveis para uma data específica
      const dateObj = new Date(date)
      const existingAppointments = appointments
        .filter(apt => 
          format(new Date(apt.date), 'yyyy-MM-dd') === format(dateObj, 'yyyy-MM-dd') &&
          apt.barberId === barberId
        )

      let allTimes: string[]
      let serviceDuration: number

      if (totalDuration) {
        // Usar duração total dos serviços múltiplos
        serviceDuration = parseInt(totalDuration)
        allTimes = generateSmartSlots(serviceDuration, date, barberId)
      } else if (serviceId) {
        // Sistema Smart Slots - gerar horários baseados no serviço único
        const services = [
          { id: 'corte', duration: 30 },
          { id: 'corte-sobrancelha', duration: 30 },
          { id: 'corte-barba', duration: 45 },
          { id: 'corte-barba-sobrancelha', duration: 45 },
          { id: 'barba', duration: 15 },
          { id: 'hidratacao', duration: 30 },
          { id: 'limpeza-pele', duration: 30 },
          { id: 'relaxamento-capilar', duration: 30 },
          { id: 'depilacao-nariz', duration: 15 },
          { id: 'sobrancelha', duration: 15 }
        ]
        
        const service = services.find(s => s.id === serviceId)
        serviceDuration = service ? service.duration : 30
        
        allTimes = generateSmartSlots(serviceDuration, date, barberId)
      } else {
        // Fallback para horários padrão (compatibilidade)
        allTimes = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00']
        serviceDuration = 30
      }
      
      // Função para verificar se um horário conflita com agendamentos existentes
      const isTimeAvailable = (timeSlot: string, duration: number) => {
        const slotStart = timeToMinutes(timeSlot)
        const slotEnd = slotStart + duration
        
        return !existingAppointments.some(apt => {
          const aptStart = timeToMinutes(apt.time)
          const aptEnd = aptStart + (apt.totalDuration || 30)
          
          // Verifica se há sobreposição
          return (slotStart < aptEnd && slotEnd > aptStart)
        })
      }
      
      const availableTimes = allTimes.map(time => ({
        time,
        available: isTimeAvailable(time, serviceDuration)
      }))

      return NextResponse.json({ availableTimes })
    }

    // Retorna todos os agendamentos
    return NextResponse.json({ appointments })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao buscar agendamentos' },
      { status: 500 }
    )
  }
}

// POST - Criar novo agendamento
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { service, date, time, name, phone, barberId = '1', totalDuration } = body

    // Validações
    if (!service || !date || !time || !name || !phone) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se o horário ainda está disponível
    const existingAppointment = appointments.find(apt => 
      format(new Date(apt.date), 'yyyy-MM-dd') === format(new Date(date), 'yyyy-MM-dd') &&
      apt.time === time &&
      apt.barberId === barberId
    )

    if (existingAppointment) {
      return NextResponse.json(
        { error: 'Este horário já foi agendado' },
        { status: 409 }
      )
    }

    // Criar novo agendamento
    // Gerar token único para cancelamento
    const cancelToken = Date.now().toString() + Math.random().toString(36).substr(2, 9)
    
    const newAppointment = {
      id: Date.now().toString(),
      service,
      date,
      time,
      name,
      phone,
      barberId,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      cancelToken,
      reminderSent: false,
      reminderSentAt: null,
      totalDuration: totalDuration || 30
    }

    appointments.push(newAppointment)

    // Enviar confirmação por WhatsApp
    try {
      await whatsappService.sendAppointmentConfirmation({
        service: {
          icon: service.icon,
          name: service.name,
          price: service.price
        },
        date: new Date(date),
        time,
        clientName: name,
        phone
      })
      console.log('✅ WhatsApp de confirmação enviado')
    } catch (whatsappError) {
      console.error('❌ Erro ao enviar WhatsApp:', whatsappError)
      // Não falha o agendamento se o WhatsApp falhar
    }

    return NextResponse.json(
      { 
        message: 'Agendamento criado com sucesso!',
        appointment: newAppointment
      },
      { status: 201 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao criar agendamento' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar agendamento
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, status } = body

    const appointmentIndex = appointments.findIndex(apt => apt.id === id)
    
    if (appointmentIndex === -1) {
      return NextResponse.json(
        { error: 'Agendamento não encontrado' },
        { status: 404 }
      )
    }

    appointments[appointmentIndex] = {
      ...appointments[appointmentIndex],
      status,
      updatedAt: new Date().toISOString()
    }

    return NextResponse.json({
      message: 'Agendamento atualizado com sucesso!',
      appointment: appointments[appointmentIndex]
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao atualizar agendamento' },
      { status: 500 }
    )
  }
}

// DELETE - Cancelar agendamento
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID do agendamento é obrigatório' },
        { status: 400 }
      )
    }

    const appointmentIndex = appointments.findIndex(apt => apt.id === id)
    
    if (appointmentIndex === -1) {
      return NextResponse.json(
        { error: 'Agendamento não encontrado' },
        { status: 404 }
      )
    }

    appointments.splice(appointmentIndex, 1)

    return NextResponse.json({
      message: 'Agendamento cancelado com sucesso!'
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao cancelar agendamento' },
      { status: 500 }
    )
  }
}