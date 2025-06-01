'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, Clock, User, Calendar, Scissors } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Appointment {
  id: string
  serviceId: string
  service: string
  date: string
  time: string
  name: string
  phone: string
  status: string
  cancelToken: string
}

export default function CancelPage() {
  const params = useParams()
  const router = useRouter()
  const [appointment, setAppointment] = useState<Appointment | null>(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)
  const [cancelled, setCancelled] = useState(false)
  const [error, setError] = useState('')

  const token = params.token as string

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const response = await fetch(`/api/appointments/cancel/${token}`)
        const data = await response.json()
        
        if (response.ok) {
          setAppointment(data.appointment)
        } else {
          setError(data.error || 'Agendamento não encontrado')
        }
      } catch (err) {
        setError('Erro ao carregar agendamento')
      } finally {
        setLoading(false)
      }
    }

    if (token) {
      fetchAppointment()
    }
  }, [token])

  const handleCancel = async () => {
    setCancelling(true)
    try {
      const response = await fetch(`/api/appointments/cancel/${token}`, {
        method: 'DELETE'
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setCancelled(true)
      } else {
        setError(data.error || 'Erro ao cancelar agendamento')
      }
    } catch (err) {
      setError('Erro ao cancelar agendamento')
    } finally {
      setCancelling(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Ops!</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="btn-primary w-full"
          >
            Voltar ao Início
          </button>
        </div>
      </div>
    )
  }

  if (cancelled) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center"
        >
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Cancelado com Sucesso!</h1>
          <p className="text-gray-600 mb-6">
            Seu agendamento foi cancelado. Você receberá uma confirmação no WhatsApp.
          </p>
          <button
            onClick={() => router.push('/')}
            className="btn-primary w-full"
          >
            Fazer Novo Agendamento
          </button>
        </motion.div>
      </div>
    )
  }

  if (!appointment) {
    return null
  }

  const appointmentDate = new Date(appointment.date)
  const formattedDate = format(appointmentDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full"
      >
        <div className="text-center mb-6">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Cancelar Agendamento</h1>
          <p className="text-gray-600">
            Tem certeza que deseja cancelar este agendamento?
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-gray-900 mb-3">Detalhes do Agendamento:</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-gray-400" />
              <span>{appointment.name}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Scissors className="w-4 h-4 text-gray-400" />
              <span>{appointment.service}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span>{appointment.time}</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleCancel}
            disabled={cancelling}
            className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelling ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Cancelando...</span>
              </div>
            ) : (
              'Sim, Cancelar Agendamento'
            )}
          </button>
          
          <button
            onClick={() => router.push('/')}
            className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            Não, Manter Agendamento
          </button>
        </div>
      </motion.div>
    </div>
  )
}