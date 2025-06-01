'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, User, Briefcase, Fingerprint, Shield, Check, ArrowRight, Scissors } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../components/AuthProvider'

interface FormData {
  userType: 'client' | 'professional' | null
  name: string
  email: string
  phone: string
  password: string
  confirmPassword: string
  businessName?: string
  acceptTerms: boolean
}

const RegisterPage = () => {
  const router = useRouter()
  const { register } = useAuth()
  const [step, setStep] = useState<'userType' | 'basicInfo' | 'security' | 'success'>('userType')
  const [formData, setFormData] = useState<FormData>({
    userType: null,
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    businessName: '',
    acceptTerms: false
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [biometricSupported, setBiometricSupported] = useState(false)
  const [biometricEnabled, setBiometricEnabled] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    checkBiometricSupport()
  }, [])

  const getStepNumber = (currentStep: string): number => {
    switch (currentStep) {
      case 'userType': return 1
      case 'basicInfo': return 2
      case 'security': return 3
      default: return 1
    }
  }

  const checkBiometricSupport = async () => {
    try {
      if (window.PublicKeyCredential) {
        const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
        setBiometricSupported(available)
      }
    } catch (error) {
      console.log('Biometric not supported:', error)
      setBiometricSupported(false)
    }
  }

  const validateStep = (currentStep: string): boolean => {
    const newErrors: Record<string, string> = {}

    if (currentStep === 'basicInfo') {
      if (!formData.name.trim()) newErrors.name = 'Nome é obrigatório'
      if (!formData.email.trim()) newErrors.email = 'Email é obrigatório'
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Email inválido'
      }
      if (!formData.phone.trim()) newErrors.phone = 'Telefone é obrigatório'
      if (formData.userType === 'professional' && !formData.businessName?.trim()) {
        newErrors.businessName = 'Nome do negócio é obrigatório para profissionais'
      }
    }

    if (currentStep === 'security') {
      if (formData.password.length < 6) {
        newErrors.password = 'Senha deve ter pelo menos 6 caracteres'
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Senhas não coincidem'
      }
      if (!formData.acceptTerms) {
        newErrors.acceptTerms = 'Você deve aceitar os termos de uso'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(step)) {
      if (step === 'userType') {
        setStep('basicInfo')
      } else if (step === 'basicInfo') {
        setStep('security')
      } else if (step === 'security') {
        setStep('success')
      }
    }
  }

  const handleBiometricSetup = async () => {
    setIsLoading(true)
    try {
      const credential = await navigator.credentials.create({
        publicKey: {
          challenge: new Uint8Array(32),
          rp: {
            name: "ServiçoAgenda",
            id: window.location.hostname,
          },
          user: {
            id: new TextEncoder().encode(formData.email),
            name: formData.email,
            displayName: formData.name,
          },
          pubKeyCredParams: [{ alg: -7, type: "public-key" }],
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "required"
          },
          timeout: 60000,
          attestation: "direct"
        }
      })
      
      if (credential) {
        setBiometricEnabled(true)
        console.log('Biometric credential created successfully')
      }
    } catch (error) {
      console.error('Error setting up biometric:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!validateStep('security')) return

    setIsLoading(true)
    try {
      const userData = {
        email: formData.email,
        password: formData.password,
        name: formData.name,
        role: formData.userType as 'client' | 'professional',
        phone: formData.phone,
        businessName: formData.businessName
      }

      const success = await register(userData)
      
      if (success) {
        setStep('success')
        // Redirecionar após 2 segundos
        setTimeout(() => {
          if (formData.userType === 'professional') {
            router.push('/dashboard')
          } else {
            router.push('/')
          }
        }, 2000)
      } else {
        setErrors({ email: 'Este email já está em uso' })
      }
    } catch (error) {
      console.error('Error creating account:', error)
      setErrors({ general: 'Erro ao criar conta. Tente novamente.' })
    } finally {
      setIsLoading(false)
    }
  }

  const getBiometricText = () => {
    const userAgent = navigator.userAgent
    if (/iPhone|iPad|iPod/i.test(userAgent)) {
      return 'Face ID'
    } else if (/Android/i.test(userAgent)) {
      return 'Impressão Digital'
    }
    return 'Biometria'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          {/* Progress Bar */}
          {step !== 'success' && (
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600">Passo {getStepNumber(step)} de 3</span>
                <span className="text-sm text-gray-500">{Math.round((getStepNumber(step) / 3) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(getStepNumber(step) / 3) * 100}%` }}
                />
              </div>
            </div>
          )}

          <AnimatePresence mode="wait">
            {/* Step 1: User Type Selection */}
            {step === 'userType' && (
              <motion.div
                key="userType"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Criar Conta
                  </h1>
                  <p className="text-gray-600">
                    Como você quer usar o ServiçoAgenda?
                  </p>
                </div>

                <div className="space-y-4">
                  <button
                    onClick={() => {
                      setFormData({ ...formData, userType: 'client' })
                      setStep('basicInfo')
                    }}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all duration-200 text-left group"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                        <User className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Cliente</h3>
                        <p className="text-sm text-gray-600">Quero agendar serviços</p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setFormData({ ...formData, userType: 'professional' })
                      setStep('basicInfo')
                    }}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all duration-200 text-left group"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                        <Briefcase className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Profissional</h3>
                        <p className="text-sm text-gray-600">Quero gerenciar minha agenda</p>
                      </div>
                    </div>
                  </button>
                </div>

                <div className="text-center mt-6">
                  <p className="text-sm text-gray-600">
                    Já tem uma conta?{' '}
                    <Link href="/login" className="text-green-600 hover:text-green-700 font-medium">
                      Faça login
                    </Link>
                  </p>
                </div>
              </motion.div>
            )}

            {/* Step 2: Basic Information */}
            {step === 'basicInfo' && (
              <motion.div
                key="basicInfo"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    Informações Básicas
                  </h2>
                  <p className="text-gray-600">
                    Conte-nos um pouco sobre você
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome completo
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                        errors.name ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Seu nome completo"
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                        errors.email ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="seu@email.com"
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Telefone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                        errors.phone ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="(11) 99999-9999"
                    />
                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                  </div>

                  {formData.userType === 'professional' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nome do seu negócio
                      </label>
                      <input
                        type="text"
                        value={formData.businessName}
                        onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                          errors.businessName ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Barbearia do João"
                      />
                      {errors.businessName && <p className="text-red-500 text-sm mt-1">{errors.businessName}</p>}
                    </div>
                  )}
                </div>

                <div className="flex space-x-3 mt-6">
                  <button
                    onClick={() => setStep('userType')}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Voltar
                  </button>
                  <button
                    onClick={handleNext}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                  >
                    Continuar
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Security Setup */}
            {step === 'security' && (
              <motion.div
                key="security"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    Configurar Segurança
                  </h2>
                  <p className="text-gray-600">
                    Proteja sua conta com senha e biometria
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Senha
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent pr-10 ${
                          errors.password ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Mínimo 6 caracteres"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirmar senha
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent pr-10 ${
                          errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Digite a senha novamente"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
                  </div>

                  {/* Biometric Setup */}
                  {biometricSupported && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="font-medium text-blue-900 mb-1">
                            Configurar {getBiometricText()}
                          </h4>
                          <p className="text-sm text-blue-700 mb-3">
                            Faça login mais rápido e seguro usando {getBiometricText().toLowerCase()}
                          </p>
                          {!biometricEnabled ? (
                            <button
                              onClick={handleBiometricSetup}
                              disabled={isLoading}
                              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                            >
                              {isLoading ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <Fingerprint className="w-4 h-4" />
                              )}
                              Configurar {getBiometricText()}
                            </button>
                          ) : (
                            <div className="flex items-center gap-2 text-green-700">
                              <Check className="w-4 h-4" />
                              <span className="text-sm font-medium">
                                {getBiometricText()} configurado com sucesso!
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Terms */}
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={formData.acceptTerms}
                      onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
                      className="mt-1 w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <label htmlFor="terms" className="text-sm text-gray-700">
                      Eu aceito os{' '}
                      <Link href="/terms" className="text-green-600 hover:text-green-700">
                        termos de uso
                      </Link>{' '}
                      e{' '}
                      <Link href="/privacy" className="text-green-600 hover:text-green-700">
                        política de privacidade
                      </Link>
                    </label>
                  </div>
                  {errors.acceptTerms && <p className="text-red-500 text-sm">{errors.acceptTerms}</p>}
                </div>

                <div className="flex space-x-3 mt-6">
                  <button
                    onClick={() => setStep('basicInfo')}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Voltar
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      'Criar Conta'
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Success */}
            {step === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Conta criada com sucesso!
                </h2>
                <p className="text-gray-600 mb-6">
                  Bem-vindo ao ServiçoAgenda! Sua conta foi criada e você já pode começar a usar.
                </p>
                <Link
                  href="/login"
                  className="inline-block w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Fazer Login
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            © 2024 ServiçoAgenda. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage