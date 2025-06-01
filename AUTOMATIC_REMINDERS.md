# Sistema de Lembretes Automáticos

Este documento explica como funciona o sistema de lembretes automáticos implementado na aplicação de agendamentos.

## 📋 Visão Geral

O sistema envia automaticamente mensagens de lembrete via WhatsApp para clientes 1 hora antes do horário agendado, utilizando cron jobs para verificação periódica.

## 🔧 Componentes do Sistema

### 1. API de Lembretes (`/api/reminders`)
- **Endpoint:** `GET /api/reminders`
- **Função:** Verifica agendamentos e envia lembretes quando necessário
- **Lógica:** 
  - Busca agendamentos confirmados para hoje
  - Identifica agendamentos que precisam de lembrete (1 hora antes)
  - Envia mensagem via WhatsApp
  - Marca lembrete como enviado para evitar duplicatas

### 2. Gerenciador de Cron Jobs (`/lib/cronJobs.ts`)
- **Função:** Gerencia tarefas agendadas
- **Configuração:** Executa verificação a cada 5 minutos
- **Recursos:**
  - Iniciar/parar jobs individuais
  - Controle de estado (habilitado/desabilitado)
  - Logs de execução

### 3. API de Controle (`/api/cron`)
- **Endpoints:**
  - `GET /api/cron` - Status dos cron jobs
  - `POST /api/cron` - Controlar cron jobs
- **Ações disponíveis:**
  - `start` - Iniciar job específico
  - `stop` - Parar job específico
  - `enable` - Habilitar job
  - `disable` - Desabilitar job
  - `start-all` - Iniciar todos os jobs
  - `stop-all` - Parar todos os jobs

### 4. Interface no Dashboard
- **Localização:** Seção "Lembretes Automáticos" no dashboard
- **Recursos:**
  - Visualizar status dos cron jobs
  - Controlar jobs (iniciar/parar)
  - Ver última execução
  - Indicadores visuais de status

## 📱 Template de Lembrete

O template usado para lembretes urgentes inclui:
- Saudação personalizada com nome do cliente
- Horário do agendamento
- Informações do local
- Valor do serviço
- Dados de contato da barbearia

```
🕐 *Seu agendamento é em 1 hora!*

Oi [Nome]! Seu horário é às [Horário] hoje.

📍 *Local:* Rua das Flores, 123
💰 *Valor:* R$ [Valor]

Te esperamos!

_Barbearia Premium_
📞 (11) 99999-9999
```

## ⚙️ Configuração

### Variáveis de Ambiente Necessárias
```env
# WhatsApp/Twilio
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# Base URL da aplicação
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

### Frequência de Verificação
- **Padrão:** A cada 5 minutos
- **Configurável:** Pode ser alterado em `/lib/cronJobs.ts`
- **Recomendação:** Não usar intervalos menores que 1 minuto para evitar sobrecarga

## 🚀 Como Usar

### 1. Ativação Automática
O sistema inicia automaticamente quando a aplicação é carregada.

### 2. Controle Manual
No dashboard, você pode:
- Ver status dos jobs
- Iniciar/parar lembretes
- Verificar última execução
- Controlar todos os jobs de uma vez

### 3. Monitoramento
- Logs no console do servidor
- Status visual no dashboard
- Timestamps de execução

## 🔍 Troubleshooting

### Lembretes não estão sendo enviados
1. Verificar se o cron job está ativo no dashboard
2. Conferir variáveis de ambiente do Twilio
3. Verificar logs no console
4. Testar manualmente: `GET /api/reminders`

### Cron jobs não aparecem no dashboard
1. Verificar se a API `/api/cron` está funcionando
2. Recarregar a página
3. Verificar console do navegador para erros

### Lembretes duplicados
- O sistema previne duplicatas marcando `reminderSent: true`
- Se ocorrer, verificar se o campo está sendo salvo corretamente

## 📈 Melhorias Futuras

1. **Múltiplos Lembretes**
   - 24 horas antes
   - 2 horas antes
   - 30 minutos antes

2. **Personalização**
   - Templates customizáveis
   - Horários configuráveis
   - Preferências do cliente

3. **Analytics**
   - Taxa de abertura
   - Efetividade dos lembretes
   - Redução de no-shows

4. **Integração com Banco de Dados**
   - Substituir localStorage
   - Melhor persistência
   - Sincronização entre instâncias

## 🔒 Segurança

- Tokens de cancelamento únicos
- Validação de horários
- Rate limiting nas APIs
- Logs de auditoria

## 📞 Suporte

Para dúvidas ou problemas:
1. Verificar logs do sistema
2. Testar APIs manualmente
3. Consultar documentação do Twilio
4. Verificar configurações de ambiente