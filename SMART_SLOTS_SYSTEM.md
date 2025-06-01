# 🎯 Sistema Smart Slots - Documentação

## 📋 **O que foi implementado:**

O sistema **Smart Slots** substitui os horários fixos de 1 hora por horários dinâmicos baseados na duração real de cada serviço.

## 🔧 **Como funciona:**

### **1. Lógica de Slots por Serviço:**

**🔸 Serviços Rápidos (10min):**
- Barba, Depilação Nariz na Cera
- Slots a cada 20min (10min serviço + 10min buffer)
- Horários: 09:00, 09:20, 09:40, 10:00, 10:20...

**🔸 Serviços Médios (20min):**
- Hidratação, Relaxamento Capilar
- Slots a cada 30min (20min serviço + 10min buffer)
- Horários: 09:00, 09:30, 10:00, 10:30, 11:00...

**🔸 Serviços Longos (30min):**
- Corte, Corte + Sobrancelha, Limpeza de Pele
- Slots a cada 45min (30min serviço + 15min buffer)
- Horários: 09:00, 09:45, 10:30, 11:15, 14:00...

**🔸 Serviços Completos (45min):**
- Corte + Barba, Corte + Barba + Sobrancelha
- Slots a cada 60min (45min serviço + 15min buffer)
- Horários: 09:00, 10:00, 11:00, 14:00, 15:00...

### **2. Horários de Funcionamento:**
- **Manhã:** 09:00 às 12:00
- **Tarde:** 14:00 às 18:00

## 📁 **Arquivos Modificados:**

### **1. `/app/api/appointments/route.ts`**
- ✅ Adicionada função `generateSmartSlots()`
- ✅ Adicionadas funções auxiliares `timeToMinutes()` e `minutesToTime()`
- ✅ Modificado GET endpoint para aceitar `serviceId`
- ✅ Implementada lógica de fallback para compatibilidade

### **2. `/hooks/useAppointments.ts`**
- ✅ Modificada função `getAvailableTimes()` para aceitar `serviceId`
- ✅ Adicionado parâmetro opcional na URL da API

### **3. `/app/page.tsx`**
- ✅ Modificada função `loadAvailableTimes()` para enviar `serviceId`
- ✅ Atualizado `useEffect` para recarregar horários quando serviço mudar

## 🎯 **Vantagens do Sistema:**

- ✅ **Zero desperdício** de tempo
- ✅ **Mais agendamentos** por dia
- ✅ **UX intuitiva** - cliente vê apenas horários viáveis
- ✅ **Flexibilidade** real baseada no serviço
- ✅ **Compatibilidade** - funciona com sistema antigo

## 🔄 **Como Reverter (se necessário):**

### **Opção 1: Reverter via Git**
```bash
git log --oneline
git revert <commit-hash-do-smart-slots>
```

### **Opção 2: Reverter Manualmente**

**1. Em `/app/api/appointments/route.ts`:**
- Remover funções `generateSmartSlots()`, `timeToMinutes()`, `minutesToTime()`
- Restaurar GET endpoint original:
```typescript
const allTimes = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00']
```

**2. Em `/hooks/useAppointments.ts`:**
- Remover parâmetro `serviceId` da função `getAvailableTimes()`
- Restaurar URL original: `/api/appointments?date=${date}&barberId=${barberId}`

**3. Em `/app/page.tsx`:**
- Restaurar `loadAvailableTimes()` original
- Restaurar `useEffect` original: `[booking.date]`

## 🧪 **Como Testar:**

1. **Acesse:** http://localhost:3000
2. **Escolha um serviço** (Barba, Corte ou Combo)
3. **Selecione uma data**
4. **Observe os horários** - devem ser diferentes para cada serviço
5. **Compare:**
   - Barba: mais horários (slots de 30min)
   - Corte: horários intermediários (slots de 45min)
   - Combo: horários espaçados (slots de 60min)

## 📊 **Exemplo Prático:**

**Data: Hoje**

**Barba (10min) - Slots de 20min:**
- 09:00, 09:20, 09:40, 10:00, 10:20, 10:40, 11:00, 11:20, 11:40
- 14:00, 14:20, 14:40, 15:00, 15:20, 15:40, 16:00, 16:20, 16:40, 17:00, 17:20, 17:40

**Hidratação (20min) - Slots de 30min:**
- 09:00, 09:30, 10:00, 10:30, 11:00, 11:30
- 14:00, 14:30, 15:00, 15:30, 16:00, 16:30, 17:00, 17:30

**Corte (30min) - Slots de 45min:**
- 09:00, 09:45, 10:30, 11:15
- 14:00, 14:45, 15:30, 16:15, 17:00

**Corte + Barba (45min) - Slots de 60min:**
- 09:00, 10:00, 11:00
- 14:00, 15:00, 16:00, 17:00

---

**🚀 Sistema implementado com sucesso!**
**📞 Qualquer dúvida, é só avisar para ajustar ou reverter.**