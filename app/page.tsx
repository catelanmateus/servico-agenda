'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Clock, User, Phone, MessageCircle, CheckCircle, AlertCircle, Scissors, MapPin, Star, Check } from 'lucide-react'
import { useAuth } from '../components/AuthProvider'
import Navigation from '../components/Navigation'
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
  services?: Service[]
  date?: Date
  time?: string
  name?: string
  phone?: string
}

const services: Service[] = [
  { id: 'barba', name: 'Barba', price: 15, duration: 15, icon: '' },
  { id: 'corte', name: 'Corte', price: 25, duration: 30, icon: '' },
  { id: 'depilacao-nariz', name: 'Depilação Nariz na Cera', price: 10, duration: 15, icon: '' },
  { id: 'hidratacao', name: 'Hidratação', price: 20, duration: 30, icon: '' },
  { id: 'limpeza-pele', name: 'Limpeza de Pele', price: 25, duration: 30, icon: '' },
  { id: 'relaxamento-capilar', name: 'Relaxamento Capilar', price: 30, duration: 30, icon: '' },
  { id: 'sobrancelha', name: 'Sobrancelha', price: 10, duration: 15, icon: '' },
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
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const [step, setStep] = useState(1)
  const [booking, setBooking] = useState<BookingData>({ services: [] })
  const [availableDays] = useState(getNextDays())
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [showSuccess, setShowSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [tempReservationToken, setTempReservationToken] = useState<string | null>(null)

  
  // Redirecionar para login se não estiver autenticado
  useEffect(() => {
    if (!user) {
      window.location.href = '/login'
    }
  }, [user])
  
  // Debug log
  console.log('Current booking state:', booking)
  console.log('Current step:', step)
  
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
  }, [booking.date, booking.services])

  const loadAvailableTimes = async () => {
    if (!booking.date || !booking.services?.length) return
    
    try {
      setIsLoading(true)
      const dateStr = format(booking.date, 'yyyy-MM-dd')
      // Calcular duração total dos serviços selecionados
      const totalDuration = booking.services.reduce((total, service) => total + service.duration, 0)
      const times = await getAvailableTimes(dateStr, '1', undefined, totalDuration)
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
    // Get phone from URL parameter
    const phoneFromUrl = searchParams.get('phone')
    
    // Load progress from localStorage
    const saved = localStorage.getItem('booking-progress')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (parsed.date) parsed.date = new Date(parsed.date)
        
        // Use phone from URL if available, otherwise use saved phone
        if (phoneFromUrl) {
          parsed.phone = phoneFromUrl
        }
        
        // Garantir que services seja sempre um array
        if (!parsed.services) {
          parsed.services = parsed.service ? [parsed.service] : []
        }
        
        setBooking(parsed)
        
        // Determine current step based on saved data
        if (parsed.date && parsed.time) setStep(3)
        else if (parsed.services?.length > 0) setStep(2)
      } catch (e) {
        console.log('Error loading saved progress')
      }
    }
  }, [])

  const handleServiceSelect = (service: Service) => {
    setBooking(prev => {
      const currentServices = prev.services || []
      const isSelected = currentServices.some(s => s.id === service.id)
      
      let newServices
      if (isSelected) {
        // Remove o serviço se já estiver selecionado
        newServices = currentServices.filter(s => s.id !== service.id)
      } else {
        // Adiciona o serviço se não estiver selecionado
        newServices = [...currentServices, service]
      }
      
      return {
        ...prev,
        services: newServices
      }
    })
  }
  
  const handleContinueToDate = () => {
    if (booking.services && booking.services.length > 0) {
      setTimeout(() => setStep(2), 300)
    }
  }
  
  // Calcular preço e duração total
  const getTotalPrice = () => {
    return booking.services?.reduce((total, service) => total + service.price, 0) || 0
  }
  
  const getTotalDuration = () => {
    return booking.services?.reduce((total, service) => total + service.duration, 0) || 0
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
    
    if (!booking.services?.length || !booking.date || !booking.time) {
      alert('Por favor, complete todos os passos do agendamento')
      return
    }

    if (!user) {
      alert('Você precisa estar logado para fazer um agendamento')
      return
    }
    
    setIsLoading(true)
    
    try {
      const appointmentData = {
        service: booking.services.map(s => s.name).join(', '),
        date: format(booking.date, 'yyyy-MM-dd'),
        time: booking.time,
        name: user.name || user.email,
        phone: user.phone || '',
        totalDuration: getTotalDuration(),
        totalPrice: getTotalPrice()
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
      {[1, 2].map((stepNumber) => (
        <div key={stepNumber} className="flex items-center">
          <div className={`progress-step ${
            step > stepNumber ? 'completed' : 
            step === stepNumber ? 'active' : 'inactive'
          }`}>
            {step > stepNumber ? <Check size={16} /> : stepNumber}
          </div>
          {stepNumber < 2 && (
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Agendamento Confirmado!</h2>
          <p className="text-gray-600 mb-6">
            Você receberá uma confirmação no WhatsApp em alguns minutos.
          </p>
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
      <Navigation />
      
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-md mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">🏪 Barbearia Catelan</h1>
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
                  Que serviços você quer?
                </h2>
              </div>

              <div className="space-y-3">
                {services.map((service) => {
                  const isSelected = booking.services?.some(s => s.id === service.id) || false
                  return (
                    <motion.div
                      key={service.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleServiceSelect(service)}
                      className={`service-card ${
                        isSelected ? 'selected' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                            isSelected ? 'bg-primary-500 border-primary-500' : 'border-gray-300'
                          }`}>
                            {isSelected && (
                              <Check size={12} className="text-white" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{service.name}</h3>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-primary-600">
                            R$ {service.price}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
              
              {booking.services && booking.services.length > 0 && (
                <div className="mt-4 p-3 bg-primary-50 rounded-lg">
                  <p className="text-sm text-primary-700">
                    {booking.services.length} serviço{booking.services.length > 1 ? 's' : ''} selecionado{booking.services.length > 1 ? 's' : ''}
                  </p>
                  <p className="text-sm font-medium text-primary-800">
                    Total: {getTotalDuration()} min • R$ {getTotalPrice()}
                  </p>
                </div>
              )}
              
              {booking.services && booking.services.length > 0 && (
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleContinueToDate}
                  className="btn-primary w-full mt-4"
                >
                  Continuar
                </motion.button>
              )}
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
              </div>

              {/* Date Selection */}
              <div className="space-y-4 border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900">Escolha o dia:</h3>
                <div className="grid grid-cols-4 gap-2">
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
                          {format(date, 'EEEE', { locale: ptBR }).replace('-feira', '').toUpperCase()}
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
                  className="space-y-4 border border-gray-200 rounded-lg p-4"
                >
                  <h3 className="font-medium text-gray-900">Escolha o horário:</h3>
                  
                  {/* Morning Slots */}
                  {timeSlots.filter(slot => {
                    const hour = parseInt(slot.time.split(':')[0])
                    return hour < 12 && slot.available
                  }).length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-gray-800">Manhã</h4>
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                         {timeSlots
                           .filter(slot => {
                             const hour = parseInt(slot.time.split(':')[0])
                             return hour < 12 && slot.available
                           })
                          .map((slot) => (
                            <motion.button
                              key={slot.time}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleTimeSelect(slot.time)}
                              className={`time-slot ${
                                booking.time === slot.time ? 'selected' : ''
                              }`}
                            >
                              {slot.time}
                            </motion.button>
                          ))
                        }
                      </div>
                    </div>
                  )}

                  {/* Afternoon Slots */}
                  {timeSlots.filter(slot => {
                    const hour = parseInt(slot.time.split(':')[0])
                    return hour >= 12 && slot.available
                  }).length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-gray-800">Tarde</h4>
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                         {timeSlots
                           .filter(slot => {
                             const hour = parseInt(slot.time.split(':')[0])
                             return hour >= 12 && slot.available
                           })
                          .map((slot) => (
                            <motion.button
                              key={slot.time}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleTimeSelect(slot.time)}
                              className={`time-slot ${
                                booking.time === slot.time ? 'selected' : ''
                              }`}
                            >
                              {slot.time}
                            </motion.button>
                          ))
                        }
                      </div>
                    </div>
                  )}
                  
                  {timeSlots.filter(s => s.available).length <= 3 && timeSlots.filter(s => s.available).length > 0 && (
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
                  Confirmar Agendamento
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">

                <div className="border border-gray-200 rounded-lg p-4 space-y-3">
                  <h4 className="font-medium text-gray-900 text-lg">Resumo do agendamento:</h4>
                  
                  <div className="space-y-2">
                    <div>
                      <span className="font-medium text-gray-900">Serviços:</span>
                      <div className="mt-1 space-y-1">
                        {booking.services?.map((service, index) => (
                          <div key={service.id} className="flex justify-between items-center">
                            <span className="text-gray-700">• {service.name}</span>
                            <span className="font-medium text-gray-900">R$ {service.price}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-900">Valor Total:</span>
                      <span className="font-bold text-lg text-primary-600">R$ {getTotalPrice()}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-900">Duração:</span>
                      <span className="text-gray-700">{getTotalDuration()} minutos</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-900">Data:</span>
                      <span className="text-gray-700">{booking.date && format(booking.date, "EEEE, dd 'de' MMMM", { locale: ptBR })}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-900">Horário:</span>
                      <span className="text-gray-700">{booking.time}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-900">Endereço:</span>
                      <span className="text-gray-700">Rua das Flores, 123</span>
                    </div>
                  </div>
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
                    <span>Confirmar Agendamento</span>
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
            onClick={() => {
              // Se estiver voltando da etapa 3 para 2, limpar horário e cancelar reserva temporária
              if (step === 3) {
                setBooking(prev => ({ ...prev, time: undefined }))
                if (tempReservationToken) {
                  cancelTempReservation(tempReservationToken)
                  setTempReservationToken(null)
                }
              }
              setStep(step - 1)
            }}
            className="mt-6 w-full btn-secondary"
          >
            Voltar
          </motion.button>
        )}
      </div>
    </div>
  )
}