import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

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

export const whatsappTemplates = {
  // Template de confirmação de agendamento
  appointmentConfirmation: (data: AppointmentData) => {
    const formattedDate = format(data.date, "dd 'de' MMMM", { locale: ptBR })
    
    return `🎉 *Agendamento Confirmado!*

Olá ${data.clientName}! Seu agendamento foi confirmado com sucesso.

📋 *Resumo do agendamento:*
Serviço: ${data.service.icon} ${data.service.name}
Data: ${formattedDate}
Horário: ${data.time}
Local: Rua das Flores, 123
Valor: R$ ${data.service.price}

✅ Estamos te esperando!

_Barbearia Premium_
📞 (11) 99999-9999`
  },

  // Template de lembrete (1 dia antes)
  appointmentReminder: (data: AppointmentData) => {
    const formattedDate = format(data.date, "dd 'de' MMMM", { locale: ptBR })
    
    return `⏰ *Lembrete de Agendamento*

Oi ${data.clientName}! Lembrete do seu agendamento para amanhã.

📋 *Resumo do agendamento:*
Serviço: ${data.service.icon} ${data.service.name}
Data: ${formattedDate}
Horário: ${data.time}
Local: Rua das Flores, 123
Valor: R$ ${data.service.price}

Te esperamos! 😊

_Barbearia Premium_
📞 (11) 99999-9999`
  },

  // Template de lembrete (1 hora antes)
  appointmentReminderUrgent: (data: AppointmentData) => {
    return `🕐 *Seu agendamento é em 1 hora!*

Oi ${data.clientName}! Seu horário é às ${data.time} hoje.

📍 *Local:* Rua das Flores, 123
💰 *Valor:* R$ ${data.service.price}

Te esperamos!

_Barbearia Premium_
📞 (11) 99999-9999`
  },

  // Template de cancelamento
  appointmentCancellation: (data: AppointmentData) => {
    const formattedDate = format(data.date, "dd 'de' MMMM", { locale: ptBR })
    
    return `❌ *Agendamento Cancelado*

Olá ${data.clientName}, seu agendamento foi cancelado:

📋 *Detalhes:*
Serviço: ${data.service.icon} ${data.service.name}
Data: ${formattedDate}
Horário: ${data.time}

Para reagendar, acesse nosso site ou entre em contato.

_Barbearia Premium_
📞 (11) 99999-9999`
  },

  // Template simples apenas com o resumo (como solicitado)
  appointmentSummary: (data: AppointmentData) => {
    const formattedDate = format(data.date, "dd 'de' MMMM", { locale: ptBR })
    
    return `📋 *Resumo do agendamento:*
Serviço: ${data.service.icon} ${data.service.name}
Data: ${formattedDate}
Horário: ${data.time}
Local: Rua das Flores, 123
Valor: R$ ${data.service.price}`
  }
}

export default whatsappTemplates