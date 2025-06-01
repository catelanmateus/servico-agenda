'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, Clock, User, Settings, Plus, Edit, Trash2, DollarSign } from 'lucide-react'
import { useAuth } from '../../components/AuthProvider'
import Navigation from '../../components/Navigation'

interface Service {
  id: string
  name: string
  price: number
  duration: number
  createdBy: string
}

interface Appointment {
  id: string
  clientName: string
  clientPhone: string
  date: string
  time: string
  services: Service[]
  status: 'confirmed' | 'cancelled' | 'completed'
}

export default function DashboardPage() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [services, setServices] = useState<Service[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [showServiceForm, setShowServiceForm] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [serviceForm, setServiceForm] = useState({
    name: '',
    price: '',
    duration: ''
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Verificar se o usuário é profissional
    if (!user) {
      router.push('/login')
      return
    }
    
    if (user.role !== 'professional') {
      router.push('/')
      return
    }

    loadServices()
    loadAppointments()
  }, [user, router])

  const loadServices = () => {
    // Carregar serviços do localStorage (em produção seria uma API)
    const savedServices = localStorage.getItem(`services_${user?.id}`)
    if (savedServices) {
      setServices(JSON.parse(savedServices))
    } else {
      // Serviços padrão
      const defaultServices = [
        { id: '1', name: 'Corte', price: 25, duration: 30, createdBy: user?.id || '' },
        { id: '2', name: 'Barba', price: 15, duration: 15, createdBy: user?.id || '' },
        { id: '3', name: 'Corte + Barba', price: 35, duration: 45, createdBy: user?.id || '' }
      ]
      setServices(defaultServices)
      localStorage.setItem(`services_${user?.id}`, JSON.stringify(defaultServices))
    }
  }

  const loadAppointments = () => {
    // Carregar agendamentos do localStorage (em produção seria uma API)
    const savedAppointments = localStorage.getItem('appointments')
    if (savedAppointments) {
      const allAppointments = JSON.parse(savedAppointments)
      // Filtrar apenas agendamentos deste profissional
      const myAppointments = allAppointments.filter((apt: any) => 
        apt.professionalId === user?.id
      )
      setAppointments(myAppointments)
    }
  }

  const handleServiceSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!serviceForm.name || !serviceForm.price || !serviceForm.duration) {
      alert('Por favor, preencha todos os campos')
      return
    }

    const newService: Service = {
      id: editingService?.id || Date.now().toString(),
      name: serviceForm.name,
      price: parseFloat(serviceForm.price),
      duration: parseInt(serviceForm.duration),
      createdBy: user?.id || ''
    }

    let updatedServices
    if (editingService) {
      updatedServices = services.map(s => s.id === editingService.id ? newService : s)
    } else {
      updatedServices = [...services, newService]
    }

    setServices(updatedServices)
    localStorage.setItem(`services_${user?.id}`, JSON.stringify(updatedServices))
    
    // Reset form
    setServiceForm({ name: '', price: '', duration: '' })
    setEditingService(null)
    setShowServiceForm(false)
  }

  const handleEditService = (service: Service) => {
    setEditingService(service)
    setServiceForm({
      name: service.name,
      price: service.price.toString(),
      duration: service.duration.toString()
    })
    setShowServiceForm(true)
  }

  const handleDeleteService = (serviceId: string) => {
    if (confirm('Tem certeza que deseja excluir este serviço?')) {
      const updatedServices = services.filter(s => s.id !== serviceId)
      setServices(updatedServices)
      localStorage.setItem(`services_${user?.id}`, JSON.stringify(updatedServices))
    }
  }

  const getTodayAppointments = () => {
    const today = new Date().toISOString().split('T')[0]
    return appointments.filter(apt => apt.date === today)
  }

  const getUpcomingAppointments = () => {
    const today = new Date().toISOString().split('T')[0]
    return appointments.filter(apt => apt.date > today).slice(0, 5)
  }

  if (!user || user.role !== 'professional') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Acesso Restrito</h2>
          <p className="text-gray-600">Esta página é apenas para profissionais.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Bem-vindo, {user.name}! Gerencie seus serviços e agendamentos.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Hoje</p>
                <p className="text-2xl font-bold text-gray-900">{getTodayAppointments().length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Próximos</p>
                <p className="text-2xl font-bold text-gray-900">{getUpcomingAppointments().length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <DollarSign className="w-8 h-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Serviços</p>
                <p className="text-2xl font-bold text-gray-900">{services.length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Services Management */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Meus Serviços</h2>
                <button
                  onClick={() => {
                    setEditingService(null)
                    setServiceForm({ name: '', price: '', duration: '' })
                    setShowServiceForm(true)
                  }}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Novo Serviço
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {services.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Nenhum serviço cadastrado</p>
              ) : (
                <div className="space-y-4">
                  {services.map(service => (
                    <div key={service.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h3 className="font-medium text-gray-900">{service.name}</h3>
                        <p className="text-sm text-gray-600">
                          R$ {service.price.toFixed(2)} • {service.duration} min
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditService(service)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteService(service.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Appointments */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Agendamentos de Hoje</h2>
            </div>
            
            <div className="p-6">
              {getTodayAppointments().length === 0 ? (
                <p className="text-gray-500 text-center py-8">Nenhum agendamento para hoje</p>
              ) : (
                <div className="space-y-4">
                  {getTodayAppointments().map(appointment => (
                    <div key={appointment.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-900">{appointment.clientName}</h3>
                          <p className="text-sm text-gray-600">{appointment.clientPhone}</p>
                          <p className="text-sm text-gray-600">{appointment.time}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {appointment.status === 'confirmed' ? 'Confirmado' :
                           appointment.status === 'cancelled' ? 'Cancelado' : 'Concluído'}
                        </span>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm text-gray-600">
                          Serviços: {appointment.services.map(s => s.name).join(', ')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Service Form Modal */}
      {showServiceForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingService ? 'Editar Serviço' : 'Novo Serviço'}
            </h3>
            
            <form onSubmit={handleServiceSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Serviço
                </label>
                <input
                  type="text"
                  value={serviceForm.name}
                  onChange={(e) => setServiceForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Ex: Corte Masculino"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preço (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={serviceForm.price}
                  onChange={(e) => setServiceForm(prev => ({ ...prev, price: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="25.00"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duração (minutos)
                </label>
                <select
                  value={serviceForm.duration}
                  onChange={(e) => setServiceForm(prev => ({ ...prev, duration: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  <option value="">Selecione a duração</option>
                  <option value="15">15 minutos</option>
                  <option value="30">30 minutos</option>
                  <option value="45">45 minutos</option>
                  <option value="60">60 minutos</option>
                  <option value="90">90 minutos</option>
                </select>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowServiceForm(false)
                    setEditingService(null)
                    setServiceForm({ name: '', price: '', duration: '' })
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {editingService ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}