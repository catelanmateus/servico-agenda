'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Clock, User, Phone, DollarSign, Settings, Plus, Check, X, MessageCircle } from 'lucide-react'
import { format, addDays, isSameDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useAppointments } from '../../hooks/useAppointments'

interface Appointment {
  id: string
  name: string
  phone: string
  service: string
  time: string
  date: string
  barberId: string
  status: 'confirmed' | 'cancelled' | 'completed'
  createdAt: string
}

interface DashboardAppointment {
  id: string
  clientName: string
  clientPhone: string
  service: string
  serviceIcon: string
  time: string
  price: number
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  date: Date
}

interface DayStats {
  appointments: number
  revenue: number
  completed: number
}

const getServiceDetails = (serviceName: string) => {
  const services: { [key: string]: { icon: string; price: number } } = {
    'Corte Masculino': { icon: '✂️', price: 25 },
    'Barba': { icon: '🧔', price: 15 },
    'Corte + Barba': { icon: '✂️🧔', price: 35 }
  }
  return services[serviceName] || { icon: '✂️', price: 25 }
}

const transformAppointment = (apt: Appointment): DashboardAppointment => {
  const serviceDetails = getServiceDetails(apt.service)
  return {
    id: apt.id,
    clientName: apt.name,
    clientPhone: apt.phone,
    service: apt.service,
    serviceIcon: serviceDetails.icon,
    time: apt.time,
    price: serviceDetails.price,
    status: apt.status === 'confirmed' ? 'confirmed' : apt.status === 'completed' ? 'completed' : 'cancelled',
    date: new Date(apt.date)
  }
}

const getNextDays = (count: number = 7): Date[] => {
  const days: Date[] = []
  for (let i = 0; i < count; i++) {
    days.push(addDays(new Date(), i))
  }
  return days
}

export default function DashboardPage() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [appointments, setAppointments] = useState<DashboardAppointment[]>([])
  const [availableDays] = useState(getNextDays())
  const [showAddSlot, setShowAddSlot] = useState(false)
  const [newSlotTime, setNewSlotTime] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const {
    loading: apiLoading,
    error: apiError,
    getAppointments,
    updateAppointmentStatus,
    cancelAppointment
  } = useAppointments()

  useEffect(() => {
    loadAppointments()
  }, [])

  const loadAppointments = async () => {
    try {
      setIsLoading(true)
      const apiAppointments = await getAppointments()
      const transformedAppointments = apiAppointments.map(transformAppointment)
      setAppointments(transformedAppointments)
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const todayAppointments = appointments.filter(apt => 
    isSameDay(apt.date, selectedDate)
  )

  const dayStats: DayStats = {
    appointments: todayAppointments.length,
    revenue: todayAppointments.reduce((sum, apt) => sum + apt.price, 0),
    completed: todayAppointments.filter(apt => apt.status === 'completed').length
  }

  const monthlyRevenue = appointments
    .filter(apt => apt.date.getMonth() === new Date().getMonth())
    .reduce((sum, apt) => sum + apt.price, 0)

  const handleStatusChange = async (appointmentId: string, newStatus: DashboardAppointment['status']) => {
    try {
      setIsLoading(true)
      const apiStatus = newStatus === 'pending' ? 'confirmed' : newStatus
      await updateAppointmentStatus(appointmentId, apiStatus)
      
      setAppointments(prev => 
        prev.map(apt => 
          apt.id === appointmentId ? { ...apt, status: newStatus } : apt
        )
      )
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      alert('Erro ao atualizar status do agendamento')
    } finally {
      setIsLoading(false)
    }
  }

  const handleWhatsApp = (phone: string, name: string, service: string, time: string) => {
    const message = `Olá ${name}! Confirmando seu agendamento para ${service} hoje às ${time}. Nos vemos em breve! 😊`
    const whatsappUrl = `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  const addTimeSlot = () => {
    if (newSlotTime) {
      // In a real app, this would create an available time slot
      console.log('Adding time slot:', newSlotTime)
      setNewSlotTime('')
      setShowAddSlot(false)
    }
  }

  const getStatusColor = (status: Appointment['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200'
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusText = (status: Appointment['status']) => {
    switch (status) {
      case 'pending': return 'Pendente'
      case 'confirmed': return 'Confirmado'
      case 'completed': return 'Concluído'
      case 'cancelled': return 'Cancelado'
      default: return status
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">Barbearia Silva</p>
            </div>
            <button className="p-2 text-gray-600 hover:text-gray-900 transition-colors">
              <Settings size={24} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Hoje</p>
                <p className="text-2xl font-bold text-gray-900">{dayStats.appointments}</p>
                <p className="text-sm text-gray-500">agendamentos</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Hoje</p>
                <p className="text-2xl font-bold text-green-600">R$ {dayStats.revenue}</p>
                <p className="text-sm text-gray-500">faturamento</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Este mês</p>
                <p className="text-2xl font-bold text-purple-600">R$ {monthlyRevenue}</p>
                <p className="text-sm text-gray-500">total</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Date Selector */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Selecionar Data</h3>
          <div className="grid grid-cols-7 gap-2">
            {availableDays.map((date, index) => {
              const isToday = isSameDay(date, new Date())
              const isSelected = isSameDay(date, selectedDate)
              const dayAppointments = appointments.filter(apt => isSameDay(apt.date, date)).length
              
              return (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedDate(date)}
                  className={`p-3 rounded-lg text-center transition-all ${
                    isSelected 
                      ? 'bg-primary-500 text-white shadow-md' 
                      : 'bg-white border border-gray-200 hover:border-primary-300'
                  }`}
                >
                  <div className="text-xs font-medium">
                    {isToday ? 'HOJE' : format(date, 'EEE', { locale: ptBR }).toUpperCase()}
                  </div>
                  <div className="text-lg font-bold">
                    {format(date, 'd')}
                  </div>
                  {dayAppointments > 0 && (
                    <div className={`text-xs ${
                      isSelected ? 'text-primary-100' : 'text-primary-600'
                    }`}>
                      {dayAppointments} agend.
                    </div>
                  )}
                </motion.button>
              )
            })}
          </div>
        </div>

        {/* Appointments */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              {format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
            </h3>
            <button
              onClick={() => setShowAddSlot(true)}
              className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 transition-colors"
            >
              <Plus size={16} />
              <span>Bloquear horário</span>
            </button>
          </div>

          {todayAppointments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Nenhum agendamento para este dia</p>
            </div>
          ) : (
            <div className="space-y-4">
              {todayAppointments
                .sort((a, b) => a.time.localeCompare(b.time))
                .map((appointment) => (
                <motion.div
                  key={appointment.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                        <span className="text-lg">{appointment.serviceIcon}</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{appointment.clientName}</h4>
                        <p className="text-sm text-gray-600">{appointment.service}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-gray-900">{appointment.time}</div>
                      <div className="text-sm text-green-600 font-medium">R$ {appointment.price}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                        getStatusColor(appointment.status)
                      }`}>
                        {getStatusText(appointment.status)}
                      </span>
                      <span className="text-sm text-gray-500">{appointment.clientPhone}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {appointment.status === 'pending' && (
                        <button
                          onClick={() => handleStatusChange(appointment.id, 'confirmed')}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Confirmar"
                        >
                          <Check size={16} />
                        </button>
                      )}
                      
                      {appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
                        <button
                          onClick={() => handleStatusChange(appointment.id, 'cancelled')}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Cancelar"
                        >
                          <X size={16} />
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleWhatsApp(
                          appointment.clientPhone,
                          appointment.clientName,
                          appointment.service,
                          appointment.time
                        )}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Enviar WhatsApp"
                      >
                        <MessageCircle size={16} />
                      </button>
                      
                      {appointment.status === 'confirmed' && (
                        <button
                          onClick={() => handleStatusChange(appointment.id, 'completed')}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Concluir
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Time Slot Modal */}
      {showAddSlot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-md"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Bloquear Horário</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Horário
                </label>
                <input
                  type="time"
                  value={newSlotTime}
                  onChange={(e) => setNewSlotTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowAddSlot(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  onClick={addTimeSlot}
                  className="flex-1 btn-primary"
                >
                  Bloquear
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}