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
  cancelToken?: string
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

❌ *Precisa cancelar?*
${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/cancel/${data.cancelToken}

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

🔄 *Quer reagendar?*
Clique aqui para agendar novamente:
${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}?phone=${encodeURIComponent(data.phone)}

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