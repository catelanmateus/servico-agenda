import { useState, useCallback } from 'react'

interface Appointment {
  id: string
  service: string
  date: string
  time: string
  name: string
  phone: string
  barberId: string
  status: 'confirmed' | 'cancelled' | 'completed'
  createdAt: string
  cancelToken?: string
}

interface TimeSlot {
  time: string
  available: boolean
}

interface CreateAppointmentData {
  service: string
  date: string
  time: string
  name: string
  phone: string
  barberId?: string
}

interface TempReservation {
  token: string
  expiresAt: string
}

export function useAppointments() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Buscar horários disponíveis
  const getAvailableTimes = useCallback(async (date: string, barberId: string = '1', serviceId?: string, totalDuration?: number): Promise<TimeSlot[]> => {
    setLoading(true)
    setError(null)
    
    try {
      let url = `/api/appointments?date=${date}&barberId=${barberId}`
      if (serviceId) {
        url += `&serviceId=${serviceId}`
      }
      if (totalDuration) {
        url += `&totalDuration=${totalDuration}`
      }
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error('Erro ao buscar horários disponíveis')
      }
      
      const data = await response.json()
      return data.availableTimes
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Criar reserva temporária
  const createTempReservation = useCallback(async (date: string, time: string, barberId: string = '1'): Promise<TempReservation> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ date, time, barberId }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao reservar horário')
      }
      
      const data = await response.json()
      return {
        token: data.token,
        expiresAt: data.expiresAt
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Criar agendamento definitivo
  const createAppointment = useCallback(async (appointmentData: CreateAppointmentData): Promise<Appointment> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appointmentData),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao criar agendamento')
      }
      
      const data = await response.json()
      return data.appointment
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Cancelar reserva temporária
  const cancelTempReservation = useCallback(async (token: string): Promise<void> => {
    try {
      await fetch(`/api/reservations?token=${token}`, {
        method: 'DELETE',
      })
    } catch (err) {
      console.error('Erro ao cancelar reserva temporária:', err)
    }
  }, [])

  // Buscar todos os agendamentos
  const getAppointments = useCallback(async (): Promise<Appointment[]> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/appointments')
      
      if (!response.ok) {
        throw new Error('Erro ao buscar agendamentos')
      }
      
      const data = await response.json()
      return data.appointments
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Atualizar status do agendamento
  const updateAppointmentStatus = useCallback(async (id: string, status: 'confirmed' | 'cancelled' | 'completed'): Promise<Appointment> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/appointments', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, status }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao atualizar agendamento')
      }
      
      const data = await response.json()
      return data.appointment
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Cancelar agendamento
  const cancelAppointment = useCallback(async (id: string): Promise<void> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/appointments?id=${id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao cancelar agendamento')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    error,
    getAvailableTimes,
    createTempReservation,
    createAppointment,
    cancelTempReservation,
    getAppointments,
    updateAppointmentStatus,
    cancelAppointment,
  }
}