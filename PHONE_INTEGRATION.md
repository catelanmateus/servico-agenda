# 📱 Integração Automática de Telefone

## Como Funciona

O sistema agora suporta a passagem automática do número de telefone via URL, eliminando a necessidade do cliente digitar novamente o número que ele já usou para entrar em contato.

## Fluxo Recomendado

### 1. Cliente entra em contato via WhatsApp
- Cliente manda mensagem para a barbearia
- Você já tem o número dele no WhatsApp

### 2. Envie o link personalizado
Quando enviar o link do agendamento, inclua o número:
```
https://seusite.com?phone=5511999999999
```

### 3. Experiência do cliente
- ✅ Campo de telefone já preenchido
- ✅ Campo somente leitura (não pode alterar)
- ✅ Indicação visual "Número confirmado via WhatsApp"
- ✅ Cliente só precisa escolher serviço, data/hora e nome

## Exemplos de URLs

```bash
# Formato básico
https://seusite.com?phone=5511999999999

# Com código do país
https://seusite.com?phone=%2B5511999999999

# Desenvolvimento local
http://localhost:3000?phone=5511999999999
```

## Benefícios

- 🚀 **Experiência mais rápida**: Cliente não precisa digitar o telefone
- ✅ **Menos erros**: Evita digitação incorreta do número
- 🔒 **Mais seguro**: Confirma que é o mesmo número do WhatsApp
- 📱 **Integração perfeita**: Funciona direto do chat do WhatsApp

## Mensagens Automáticas

Quando o cliente cancelar um agendamento, ele receberá automaticamente:
- ❌ Confirmação do cancelamento
- 🔄 Link para reagendar com telefone já preenchido
- 📞 Informações de contato da barbearia

## Implementação Técnica

O sistema usa:
- `useSearchParams()` do Next.js para capturar o parâmetro `phone`
- Campo de input em modo `readOnly` quando telefone vem da URL
- `encodeURIComponent()` para codificar o número na URL
- Validação automática do formato do telefone

---

**Resultado**: Cliente agenda em 3 cliques em vez de preencher formulário completo! 🎯