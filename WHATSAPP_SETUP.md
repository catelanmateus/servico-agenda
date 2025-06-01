# 📱 Configuração do WhatsApp Business

Este guia explica como configurar o envio automático de mensagens WhatsApp para confirmação de agendamentos.

## 🚀 Configuração Rápida

### 1. Criar Conta no Twilio

1. Acesse [console.twilio.com](https://console.twilio.com/)
2. Crie uma conta gratuita
3. Verifique seu número de telefone
4. Obtenha suas credenciais:
   - **Account SID**
   - **Auth Token**

### 2. Configurar WhatsApp Business

1. No console do Twilio, vá para **Messaging** > **Try it out** > **Send a WhatsApp message**
2. Siga o processo de configuração do WhatsApp Sandbox
3. Anote o número do WhatsApp fornecido (ex: `whatsapp:+14155238886`)

### 3. Configurar Variáveis de Ambiente

1. Copie o arquivo `.env.example` para `.env.local`:
```bash
cp .env.example .env.local
```

2. Edite o `.env.local` com suas credenciais:
```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

### 4. Instalar Dependências

```bash
npm install
```

### 5. Testar a Configuração

Reinicie o servidor de desenvolvimento:
```bash
npm run dev
```

Faça um agendamento de teste e verifique o console para confirmar o envio.

## 📋 Formato das Mensagens

### Confirmação de Agendamento
```
🎉 Agendamento Confirmado!

Olá João! Seu agendamento foi confirmado com sucesso.

📋 Resumo do agendamento:
Serviço: ✂️ Corte Masculino
Data: 31 de maio
Horário: 15:00
Local: Rua das Flores, 123
Valor: R$ 25

✅ Estamos te esperando!

Barbearia Premium
📞 (11) 99999-9999
```

### Lembrete (1 dia antes)
```
⏰ Lembrete de Agendamento

Oi João! Lembrete do seu agendamento para amanhã.

📋 Resumo do agendamento:
Serviço: ✂️ Corte Masculino
Data: 31 de maio
Horário: 15:00
Local: Rua das Flores, 123
Valor: R$ 25

Te esperamos! 😊

Barbearia Premium
📞 (11) 99999-9999
```

## 🔧 Personalização

### Modificar Templates

Edite o arquivo `utils/whatsappTemplates.ts` para personalizar as mensagens:

```typescript
export const whatsappTemplates = {
  appointmentConfirmation: (data: AppointmentData) => {
    // Personalize sua mensagem aqui
    return `Sua mensagem personalizada...`
  }
}
```

### Adicionar Novos Tipos de Mensagem

1. Adicione o template em `utils/whatsappTemplates.ts`
2. Adicione o método em `lib/whatsappService.ts`
3. Use onde necessário na aplicação

## 💰 Custos

### Twilio WhatsApp Business (Brasil)
- **Mensagens de notificação**: ~R$ 0,05 por mensagem
- **Mensagens de conversa**: ~R$ 0,10 por mensagem
- **Conta gratuita**: $15 de crédito inicial

### Estimativa Mensal
- 100 agendamentos/mês = ~R$ 5,00
- 500 agendamentos/mês = ~R$ 25,00
- 1000 agendamentos/mês = ~R$ 50,00

## 🛠️ Troubleshooting

### Mensagens não estão sendo enviadas

1. **Verifique as variáveis de ambiente**:
   ```bash
   echo $TWILIO_ACCOUNT_SID
   echo $TWILIO_AUTH_TOKEN
   ```

2. **Verifique o console do servidor**:
   - ✅ = Configurado corretamente
   - ⚠️ = Variáveis ausentes (modo simulação)
   - ❌ = Erro no envio

3. **Teste manual**:
   ```javascript
   // No console do navegador (F12)
   fetch('/api/test-whatsapp', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ phone: '11999999999' })
   })
   ```

### Números de telefone

- **Formato aceito**: `(11) 99999-9999`, `11999999999`, `+5511999999999`
- **Conversão automática**: O sistema adiciona `+55` se necessário
- **WhatsApp Sandbox**: Números precisam estar registrados no sandbox

### Modo de Produção

1. **Aprovar templates** no console do Twilio
2. **Configurar webhook** para respostas
3. **Solicitar número dedicado** (opcional)
4. **Implementar opt-out** (obrigatório)

## 🔐 Segurança

- ✅ Credenciais em variáveis de ambiente
- ✅ Validação de números de telefone
- ✅ Rate limiting (implementar se necessário)
- ✅ Logs de auditoria
- ✅ Fallback em caso de falha

## 📈 Próximos Passos

1. **Implementar lembretes automáticos**
2. **Adicionar webhook para respostas**
3. **Integrar com calendário**
4. **Adicionar métricas de entrega**
5. **Implementar chatbot básico**

## 🆘 Suporte

- **Documentação Twilio**: [twilio.com/docs/whatsapp](https://www.twilio.com/docs/whatsapp)
- **Console Twilio**: [console.twilio.com](https://console.twilio.com/)
- **Status da API**: [status.twilio.com](https://status.twilio.com/)

---

**Desenvolvido para Barbearia Premium** 💈