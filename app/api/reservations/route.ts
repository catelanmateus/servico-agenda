import { NextRequest, NextResponse } from 'next/server'
import { format } from 'date-fns'

// Simulação de reservas temporárias em memória
let tempReservations: any[] = []

// Limpar reservas expiradas
function cleanExpiredReservations() {
  const now = new Date().getTime()
  tempReservations = tempReservations.filter(reservation => {
    const expiresAt = new Date(reservation.expiresAt).getTime()
    return expiresAt > now
  })
}

// POST - Criar reserva temporária
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { date, time, barberId = '1' } = body

    if (!date || !time) {
      return NextResponse.json(
        { error: 'Data e horário são obrigatórios' },
        { status: 400 }
      )
    }

    // Limpar reservas expiradas
    cleanExpiredReservations()

    // Verificar se já existe reserva para este horário
    const existingReservation = tempReservations.find(res => 
      format(new Date(res.date), 'yyyy-MM-dd') === format(new Date(date), 'yyyy-MM-dd') &&
      res.time === time &&
      res.barberId === barberId
    )

    if (existingReservation) {
      return NextResponse.json(
        { error: 'Este horário já está sendo reservado por outro cliente' },
        { status: 409 }
      )
    }

    // Criar nova reserva temporária (válida por 15 minutos)
    const reservation = {
      id: Date.now().toString(),
      date,
      time,
      barberId,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutos
      token: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }

    tempReservations.push(reservation)

    return NextResponse.json({
      message: 'Horário reservado temporariamente',
      token: reservation.token,
      expiresAt: reservation.expiresAt
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao criar reserva temporária' },
      { status: 500 }
    )
  }
}

// GET - Verificar status da reserva
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { error: 'Token é obrigatório' },
        { status: 400 }
      )
    }

    // Limpar reservas expiradas
    cleanExpiredReservations()

    const reservation = tempReservations.find(res => res.token === token)

    if (!reservation) {
      return NextResponse.json(
        { error: 'Reserva não encontrada ou expirada' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      reservation,
      valid: true
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao verificar reserva' },
      { status: 500 }
    )
  }
}

// DELETE - Cancelar reserva temporária
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { error: 'Token é obrigatório' },
        { status: 400 }
      )
    }

    const reservationIndex = tempReservations.findIndex(res => res.token === token)
    
    if (reservationIndex === -1) {
      return NextResponse.json(
        { error: 'Reserva não encontrada' },
        { status: 404 }
      )
    }

    tempReservations.splice(reservationIndex, 1)

    return NextResponse.json({
      message: 'Reserva cancelada com sucesso'
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao cancelar reserva' },
      { status: 500 }
    )
  }
}

// Exportar função para uso interno
export function isTimeReserved(date: string, time: string, barberId: string = '1'): boolean {
  cleanExpiredReservations()
  return tempReservations.some(res => 
    format(new Date(res.date), 'yyyy-MM-dd') === format(new Date(date), 'yyyy-MM-dd') &&
    res.time === time &&
    res.barberId === barberId
  )
}