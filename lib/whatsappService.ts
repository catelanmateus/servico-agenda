import twilio from 'twilio'
import { whatsappTemplates } from '../utils/whatsappTemplates'

interface AppointmentData {
  service: {
    icon: string
    name: string
    price: number
  }
  date: Date
  time: string
  clientName: string
  phone: string
}

class WhatsAppService {
  private client: twilio.Twilio | null = null
  private isConfigured = false

  constructor() {
    this.initializeClient()
  }

  private initializeClient() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN

    if (accountSid && authToken) {
      this.client = twilio(accountSid, authToken)
      this.isConfigured = true
      console.log('✅ WhatsApp Service configurado com sucesso')
    } else {
      console.warn('⚠️ WhatsApp Service não configurado - variáveis de ambiente ausentes')
      console.warn('Adicione TWILIO_ACCOUNT_SID e TWILIO_AUTH_TOKEN no .env.local')
    }
  }

  private formatPhoneNumber(phone: string): string {
    // Remove todos os caracteres não numéricos
    const cleanPhone = phone.replace(/\D/g, '')
    
    // Se não começar com 55 (código do Brasil), adiciona
    if (!cleanPhone.startsWith('55')) {
      return `whatsapp:+55${cleanPhone}`
    }
    
    return `whatsapp:+${cleanPhone}`
  }

  async sendMessage(to: string, message: string): Promise<boolean> {
    if (!this.isConfigured || !this.client) {
      console.log('📱 Simulando envio de WhatsApp (serviço não configurado):')
      console.log(`Para: ${to}`)
      console.log(`Mensagem:\n${message}`)
      return true
    }

    try {
      const result = await this.client.messages.create({
        from: process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886',
        to: this.formatPhoneNumber(to),
        body: message
      })

      console.log(`✅ WhatsApp enviado com sucesso! SID: ${result.sid}`)
      return true
    } catch (error) {
      console.error('❌ Erro ao enviar WhatsApp:', error)
      return false
    }
  }

  // Métodos específicos para cada tipo de mensagem
  async sendAppointmentConfirmation(data: AppointmentData): Promise<boolean> {
    const message = whatsappTemplates.appointmentConfirmation(data)
    return this.sendMessage(data.phone, message)
  }

  async sendAppointmentReminder(data: AppointmentData): Promise<boolean> {
    const message = whatsappTemplates.appointmentReminder(data)
    return this.sendMessage(data.phone, message)
  }

  async sendAppointmentReminderUrgent(data: AppointmentData): Promise<boolean> {
    const message = whatsappTemplates.appointmentReminderUrgent(data)
    return this.sendMessage(data.phone, message)
  }

  async sendAppointmentCancellation(data: AppointmentData): Promise<boolean> {
    const message = whatsappTemplates.appointmentCancellation(data)
    return this.sendMessage(data.phone, message)
  }

  async sendAppointmentSummary(data: AppointmentData): Promise<boolean> {
    const message = whatsappTemplates.appointmentSummary(data)
    return this.sendMessage(data.phone, message)
  }

  // Método para testar a configuração
  isReady(): boolean {
    return this.isConfigured
  }

  getStatus(): string {
    if (this.isConfigured) {
      return '✅ Configurado e pronto para uso'
    } else {
      return '⚠️ Não configurado - adicione as variáveis de ambiente'
    }
  }
}

// Instância singleton
const whatsappService = new WhatsAppService()

export default whatsappService
export { WhatsAppService }