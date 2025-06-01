import { NextRequest, NextResponse } from 'next/server'
import { format } from 'date-fns'
import whatsappService from '../../../lib/whatsappService'

// Simulação de banco de dados em memória (substituir por banco real)
let appointments: any[] = []
let tempReservations: any[] = []

// GET - Buscar agendamentos disponíveis
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date')
  const barberId = searchParams.get('barberId') || '1'

  try {
    if (date) {
      // Retorna horários disponíveis para uma data específica
      const dateObj = new Date(date)
      const bookedTimes = appointments
        .filter(apt => 
          format(new Date(apt.date), 'yyyy-MM-dd') === format(dateObj, 'yyyy-MM-dd') &&
          apt.barberId === barberId
        )
        .map(apt => apt.time)

      // Horários padrão da barbearia
      const allTimes = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00']
      
      const availableTimes = allTimes.map(time => ({
        time,
        available: !bookedTimes.includes(time)
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
    const { service, date, time, name, phone, barberId = '1' } = body

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
    const newAppointment = {
      id: Date.now().toString(),
      service,
      date,
      time,
      name,
      phone,
      barberId,
      status: 'confirmed',
      createdAt: new Date().toISOString()
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