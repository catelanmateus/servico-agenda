'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, User, Briefcase, Fingerprint, Shield, Scissors } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../components/AuthProvider'

interface BiometricCredential {
  id: string
  type: string
}

const LoginPage = () => {
  const router = useRouter()
  const { login } = useAuth()
  const [step, setStep] = useState<'userType' | 'credentials'>('userType')
  const [userType, setUserType] = useState<'client' | 'professional' | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [biometricSupported, setBiometricSupported] = useState(false)
  const [biometricCredentials, setBiometricCredentials] = useState<BiometricCredential[]>([])
  const [showPasswordField, setShowPasswordField] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    checkBiometricSupport()
  }, [])

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

  const handleBiometricLogin = async () => {
    if (!email) {
      setError('Por favor, insira seu email primeiro')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      // Simular autenticação biométrica
      const credential = await navigator.credentials.get({
        publicKey: {
          challenge: new Uint8Array(32),
          allowCredentials: [],
          userVerification: 'required',
          timeout: 60000
        }
      })

      if (credential) {
        // Processar login com sucesso
        console.log('Login biométrico realizado!')
        // Redirecionar baseado no tipo de usuário
        if (userType === 'professional') {
          router.push('/dashboard')
        } else {
          router.push('/')
        }
      }
    } catch (error) {
      console.error('Falha na autenticação biométrica:', error)
      setError('Falha na autenticação biométrica. Tente usar sua senha.')
      setShowPasswordField(true)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      setError('Por favor, preencha todos os campos')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const success = await login(email, password)
      
      if (success) {
        // Redirecionar baseado no tipo de usuário
        if (userType === 'professional') {
          router.push('/dashboard')
        } else {
          router.push('/')
        }
      } else {
        setError('Email ou senha incorretos')
      }
    } catch (error) {
      setError('Erro ao fazer login. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const getBiometricText = () => {
    const userAgent = navigator.userAgent
    if (/iPhone|iPad|iPod/i.test(userAgent)) {
      return 'Entrar com Face ID'
    } else if (/Android/i.test(userAgent)) {
      return 'Entrar com Impressão Digital'
    }
    return 'Entrar com Biometria'
  }

  const getBiometricIcon = () => {
    const userAgent = navigator.userAgent
    if (/iPhone|iPad|iPod/i.test(userAgent)) {
      return '🔒'
    }
    return <Fingerprint className="w-5 h-5" />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Scissors className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              ServiçoAgenda
            </h1>
            <p className="text-gray-600">
              {step === 'userType' ? 'Como você quer acessar?' : 'Entre na sua conta'}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {step === 'userType' && (
              <motion.div
                key="userType"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <button
                  onClick={() => {
                    setUserType('client')
                    setStep('credentials')
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
                    setUserType('professional')
                    setStep('credentials')
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

                <div className="text-center mt-6">
                  <p className="text-sm text-gray-600">
                    Não tem uma conta?{' '}
                    <Link href="/register" className="text-green-600 hover:text-green-700 font-medium">
                      Cadastre-se
                    </Link>
                  </p>
                </div>
              </motion.div>
            )}

            {step === 'credentials' && (
              <motion.div
                key="credentials"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                {/* Voltar */}
                <button
                  onClick={() => setStep('userType')}
                  className="mb-6 text-sm text-gray-600 hover:text-gray-800 flex items-center"
                >
                  ← Voltar
                </button>

                {/* Tipo de usuário selecionado */}
                <div className="mb-6 p-3 bg-gray-50 rounded-lg flex items-center space-x-3">
                  {userType === 'client' ? (
                    <User className="w-5 h-5 text-blue-600" />
                  ) : (
                    <Briefcase className="w-5 h-5 text-green-600" />
                  )}
                  <span className="text-sm font-medium text-gray-700">
                    Entrando como {userType === 'client' ? 'Cliente' : 'Profissional'}
                  </span>
                </div>

                <form onSubmit={handlePasswordLogin} className="space-y-4">
                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="seu@email.com"
                      required
                    />
                  </div>

                  {/* Autenticação Biométrica ou Senha */}
                  {biometricSupported && !showPasswordField ? (
                    <div className="space-y-3">
                      <button
                        type="button"
                        onClick={handleBiometricLogin}
                        disabled={isLoading || !email}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 rounded-lg flex items-center justify-center gap-2 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            {getBiometricIcon()}
                            {getBiometricText()}
                          </>
                        )}
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => setShowPasswordField(true)}
                        className="w-full text-gray-600 text-sm hover:text-gray-800 underline"
                      >
                        Usar senha tradicional
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Senha
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent pr-10"
                            placeholder="Sua senha"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      >
                        {isLoading ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          'Entrar'
                        )}
                      </button>

                      {biometricSupported && (
                        <button
                          type="button"
                          onClick={() => setShowPasswordField(false)}
                          className="w-full text-blue-600 text-sm hover:text-blue-700 underline flex items-center justify-center gap-1"
                        >
                          <Shield className="w-4 h-4" />
                          Usar {getBiometricText().toLowerCase()}
                        </button>
                      )}
                    </div>
                  )}

                  {/* Error Message */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
                    >
                      {error}
                    </motion.div>
                  )}

                  {/* Links */}
                  <div className="text-center space-y-2">
                    <Link
                      href="/forgot-password"
                      className="block text-sm text-gray-600 hover:text-gray-800"
                    >
                      Esqueceu sua senha?
                    </Link>
                    <p className="text-sm text-gray-600">
                      Não tem uma conta?{' '}
                      <Link href="/register" className="text-green-600 hover:text-green-700 font-medium">
                        Cadastre-se
                      </Link>
                    </p>
                  </div>
                </form>
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

export default LoginPage