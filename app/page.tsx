'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Clock, User, Phone, Scissors, Check } from 'lucide-react'
import { format, addDays, isSameDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useAppointments } from '../hooks/useAppointments'

interface Service {
  id: string
  name: string
  price: number
  duration: number
  icon: string
}

interface TimeSlot {
  time: string
  available: boolean
}

interface BookingData {
  service?: Service
  date?: Date
  time?: string
  name?: string
  phone?: string
}

const services: Service[] = [
  { id: 'corte', name: 'Corte', price: 25, duration: 30, icon: '' },
  { id: 'barba', name: 'Barba', price: 15, duration: 20, icon: '' },
  { id: 'combo', name: 'Corte + Barba', price: 35, duration: 45, icon: '' },
]

// Função removida - agora usamos a API

const getNextDays = (count: number = 7): Date[] => {
  const days: Date[] = []
  for (let i = 0; i < count; i++) {
    days.push(addDays(new Date(), i))
  }
  return days
}

export default function HomePage() {
  const [step, setStep] = useState(1)
  const [booking, setBooking] = useState<BookingData>({})
  const [availableDays] = useState(getNextDays())
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [tempReservationToken, setTempReservationToken] = useState<string | null>(null)
  
  const {
    loading: apiLoading,
    error: apiError,
    getAvailableTimes,
    createTempReservation,
    createAppointment,
    cancelTempReservation
  } = useAppointments()

  useEffect(() => {
    if (booking.date) {
      loadAvailableTimes()
    }
  }, [booking.date])

  const loadAvailableTimes = async () => {
    if (!booking.date) return
    
    try {
      setIsLoading(true)
      const dateStr = format(booking.date, 'yyyy-MM-dd')
      const times = await getAvailableTimes(dateStr)
      setTimeSlots(times)
    } catch (error) {
      console.error('Erro ao carregar horários:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Save progress to localStorage
    localStorage.setItem('booking-progress', JSON.stringify(booking))
  }, [booking])

  useEffect(() => {
    // Load progress from localStorage
    const saved = localStorage.getItem('booking-progress')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (parsed.date) parsed.date = new Date(parsed.date)
        setBooking(parsed)
        
        // Determine current step based on saved data
        if (parsed.name && parsed.phone) setStep(4)
        else if (parsed.date && parsed.time) setStep(3)
        else if (parsed.service) setStep(2)
      } catch (e) {
        console.log('Error loading saved progress')
      }
    }
  }, [])

  const handleServiceSelect = (service: Service) => {
    setBooking(prev => ({ ...prev, service }))
    setTimeout(() => setStep(2), 300)
  }

  const handleDateSelect = (date: Date) => {
    setBooking(prev => ({ ...prev, date }))
  }

  const handleTimeSelect = async (time: string) => {
    if (!booking.date) return
    
    try {
      setIsLoading(true)
      const dateStr = format(booking.date, 'yyyy-MM-dd')
      
      // Criar reserva temporária
      const reservation = await createTempReservation(dateStr, time)
      setTempReservationToken(reservation.token)
      
      setBooking(prev => ({ ...prev, time }))
      setTimeout(() => setStep(3), 300)
    } catch (error) {
      alert('Este horário não está mais disponível. Por favor, escolha outro.')
      // Recarregar horários disponíveis
      loadAvailableTimes()
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!booking.service || !booking.date || !booking.time || !booking.name || !booking.phone) {
      alert('Por favor, preencha todos os campos')
      return
    }
    
    setIsLoading(true)
    
    try {
      const appointmentData = {
        service: booking.service.name,
        date: format(booking.date, 'yyyy-MM-dd'),
        time: booking.time,
        name: booking.name,
        phone: booking.phone
      }
      
      await createAppointment(appointmentData)
      
      // Cancelar reserva temporária (já foi confirmada)
      if (tempReservationToken) {
        await cancelTempReservation(tempReservationToken)
        setTempReservationToken(null)
      }
      
      setShowSuccess(true)
      localStorage.removeItem('booking-progress')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao criar agendamento'
      alert(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }
  
  // Cancelar reserva temporária se o usuário sair da página
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (tempReservationToken) {
        cancelTempReservation(tempReservationToken)
      }
    }
    
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      if (tempReservationToken) {
        cancelTempReservation(tempReservationToken)
      }
    }
  }, [tempReservationToken, cancelTempReservation])

  const ProgressIndicator = () => (
    <div className="flex items-center justify-center space-x-4 mb-8">
      {[1, 2, 3].map((stepNumber) => (
        <div key={stepNumber} className="flex items-center">
          <div className={`progress-step ${
            step > stepNumber ? 'completed' : 
            step === stepNumber ? 'active' : 'inactive'
          }`}>
            {step > stepNumber ? <Check size={16} /> : stepNumber}
          </div>
          {stepNumber < 3 && (
            <div className={`w-8 h-0.5 mx-2 ${
              step > stepNumber ? 'bg-primary-500' : 'bg-gray-200'
            }`} />
          )}
        </div>
      ))}
    </div>
  )

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="card max-w-md w-full text-center"
        >
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-primary-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Agendamento Confirmado!</h2>
          <p className="text-gray-600 mb-6">
            Você receberá uma confirmação no WhatsApp em alguns minutos.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Serviço:</span>
              <span className="font-medium">{booking.service?.icon} {booking.service?.name}</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Data:</span>
              <span className="font-medium">
                {booking.date && format(booking.date, "EEEE, dd 'de' MMMM", { locale: ptBR })}
              </span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Horário:</span>
              <span className="font-medium">{booking.time}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Valor:</span>
              <span className="font-medium text-primary-600">R$ {booking.service?.price}</span>
            </div>
          </div>
          <button
            onClick={() => {
              setShowSuccess(false)
              setStep(1)
              setBooking({})
            }}
            className="btn-primary w-full"
          >
            Fazer Novo Agendamento
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-md mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">🏪 Barbearia Silva</h1>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4">
        <ProgressIndicator />

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Que serviço você quer?
                </h2>
                <p className="text-gray-600">Escolha o serviço desejado</p>
              </div>

              <div className="space-y-3">
                {services.map((service) => (
                  <motion.div
                    key={service.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleServiceSelect(service)}
                    className={`service-card ${
                      booking.service?.id === service.id ? 'selected' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div>
                          <h3 className="font-medium text-gray-900">{service.name}</h3>
                          <p className="text-sm text-gray-500">{service.duration} minutos</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-primary-600">
                          R$ {service.price}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Quando você quer vir?
                </h2>
                <p className="text-gray-600">Escolha o melhor dia e horário</p>
              </div>

              {/* Date Selection */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Escolha o dia:</h3>
                <div className="grid grid-cols-3 gap-2">
                  {availableDays.slice(0, 7).map((date, index) => {
                    const isToday = isSameDay(date, new Date())
                    const isTomorrow = isSameDay(date, addDays(new Date(), 1))
                    const isSelected = booking.date && isSameDay(date, booking.date)
                    
                    return (
                      <motion.button
                        key={index}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleDateSelect(date)}
                        className={`time-slot text-left ${
                          isSelected ? 'selected' : ''
                        }`}
                      >
                        <div className="font-medium">
                          {format(date, 'EEEE', { locale: ptBR }).toUpperCase()}
                        </div>
                        <div className="text-xs opacity-75">
                          {format(date, 'dd/MM', { locale: ptBR })}
                        </div>
                      </motion.button>
                    )
                  })}
                </div>
              </div>

              {/* Time Selection */}
              {booking.date && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-4"
                >
                  <h3 className="font-medium text-gray-900">Escolha o horário:</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {timeSlots.map((slot) => (
                      <motion.button
                        key={slot.time}
                        whileHover={slot.available ? { scale: 1.05 } : {}}
                        whileTap={slot.available ? { scale: 0.95 } : {}}
                        onClick={() => slot.available && handleTimeSelect(slot.time)}
                        disabled={!slot.available}
                        className={`time-slot ${
                          booking.time === slot.time ? 'selected' : 
                          !slot.available ? 'unavailable' : ''
                        }`}
                      >
                        {slot.time}
                      </motion.button>
                    ))}
                  </div>
                  {timeSlots.filter(s => !s.available).length > timeSlots.length * 0.7 && (
                    <div className="text-center text-sm text-orange-600 bg-orange-50 p-3 rounded-lg">
                      ⏰ Restam poucos horários disponíveis hoje!
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Quase pronto!
                </h2>
                <p className="text-gray-600">Só preciso de algumas informações</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    📱 Seu WhatsApp
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="(11) 99999-9999"
                    value={booking.phone || ''}
                    onChange={(e) => setBooking(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    👤 Seu nome
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="João Silva"
                    value={booking.name || ''}
                    onChange={(e) => setBooking(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />
                </div>

                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <h4 className="font-medium text-gray-900">Resumo do agendamento:</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>Serviço: {booking.service?.name}</div>
                    <div>Data: {booking.date && format(booking.date, "dd 'de' MMMM", { locale: ptBR })}</div>
                    <div>Horário: {booking.time}</div>
                    <div>Local: Rua das Flores, 123</div>
                    <div className="font-medium text-primary-600">Valor: R$ {booking.service?.price}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <input type="checkbox" required className="rounded" />
                  <span>Confirmar agendamento por WhatsApp</span>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary w-full flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  ) : (
                    <>
                      <span>🎉</span>
                      <span>Confirmar Agendamento</span>
                    </>
                  )}
                </motion.button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Back Button */}
        {step > 1 && !showSuccess && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setStep(step - 1)}
            className="mt-6 w-full btn-secondary"
          >
            ← Voltar
          </motion.button>
        )}
      </div>
    </div>
  )
}