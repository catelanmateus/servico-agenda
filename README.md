# 🏪 Sistema de Agendamento para Barbearia

Um sistema completo de agendamento online para barbearias, desenvolvido com Next.js 14, TypeScript e Tailwind CSS.

## ✨ Funcionalidades

### Para Clientes
- ✅ Agendamento online em 3 passos simples
- ✅ Seleção de serviços (Corte, Barba, Combo)
- ✅ Escolha de data e horário disponível
- ✅ Sistema de reserva temporária (15 minutos)
- ✅ Confirmação via WhatsApp
- ✅ Interface responsiva e moderna

### Para Barbeiros (Dashboard)
- ✅ Visualização de agendamentos por data
- ✅ Controle de status dos agendamentos
- ✅ Estatísticas diárias e mensais
- ✅ Integração com WhatsApp
- ✅ Gerenciamento de horários

### Backend (API)
- ✅ API REST completa
- ✅ Sistema de reservas temporárias
- ✅ Prevenção de conflitos de agendamento
- ✅ Validações de segurança
- ✅ Gerenciamento de status

## 🚀 Tecnologias Utilizadas

- **Frontend**: Next.js 14 (App Router)
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS
- **Animações**: Framer Motion
- **Ícones**: Lucide React
- **Datas**: Date-fns
- **Backend**: Next.js API Routes

## 📦 Instalação

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn

### Passos

1. **Clone o repositório**
```bash
git clone <url-do-repositorio>
cd ServicoAgenda
```

2. **Instale as dependências**
```bash
npm install
# ou
yarn install
```

3. **Execute o projeto**
```bash
npm run dev
# ou
yarn dev
```

4. **Acesse o sistema**
- Cliente: http://localhost:3000
- Dashboard: http://localhost:3000/dashboard

## 🔧 Configuração

### Estrutura do Projeto
```
ServicoAgenda/
├── app/
│   ├── api/
│   │   ├── appointments/     # API de agendamentos
│   │   └── reservations/     # API de reservas temporárias
│   ├── dashboard/           # Dashboard do barbeiro
│   ├── globals.css         # Estilos globais
│   ├── layout.tsx          # Layout principal
│   └── page.tsx            # Página de agendamento
├── hooks/
│   └── useAppointments.ts  # Hook para API calls
└── ...
```

### APIs Disponíveis

#### Agendamentos (`/api/appointments`)
- `GET` - Buscar agendamentos e horários disponíveis
- `POST` - Criar novo agendamento
- `PUT` - Atualizar status do agendamento
- `DELETE` - Cancelar agendamento

#### Reservas Temporárias (`/api/reservations`)
- `POST` - Criar reserva temporária (15 min)
- `GET` - Verificar status da reserva
- `DELETE` - Cancelar reserva

## 🎯 Como Usar

### Para Clientes
1. Acesse o site
2. Escolha o serviço desejado
3. Selecione data e horário
4. Preencha seus dados
5. Confirme o agendamento

### Para Barbeiros
1. Acesse `/dashboard`
2. Visualize agendamentos do dia
3. Atualize status conforme necessário
4. Use integração WhatsApp para contato

## 🔒 Segurança

- ✅ Validação de dados no frontend e backend
- ✅ Prevenção de conflitos de agendamento
- ✅ Sistema de reservas temporárias
- ✅ Sanitização de inputs
- ✅ Tratamento de erros

## 📱 Responsividade

O sistema é totalmente responsivo e funciona perfeitamente em:
- 📱 Smartphones
- 📱 Tablets
- 💻 Desktops

## 🚀 Deploy

### Vercel (Recomendado)
1. Conecte seu repositório ao Vercel
2. Configure as variáveis de ambiente
3. Deploy automático

### Outras Plataformas
- Railway
- Render
- Netlify
- AWS
- Google Cloud

## 🔮 Próximos Passos

### Banco de Dados
- [ ] Integração com PostgreSQL/MySQL
- [ ] Supabase para backend completo
- [ ] Prisma ORM

### Funcionalidades Avançadas
- [ ] Sistema de pagamentos
- [ ] Notificações push
- [ ] Múltiplos barbeiros
- [ ] Relatórios avançados
- [ ] App mobile

### Integrações
- [ ] WhatsApp Business API
- [ ] Google Calendar
- [ ] Sistema de avaliações
- [ ] Programa de fidelidade

## 💰 Monetização

### Planos Sugeridos
- **Básico**: R$ 29/mês - 1 barbeiro, 100 agendamentos
- **Profissional**: R$ 59/mês - 3 barbeiros, 500 agendamentos
- **Premium**: R$ 99/mês - Ilimitado + relatórios

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

## 📞 Suporte

Para dúvidas ou suporte:
- 📧 Email: suporte@barbearia.com
- 📱 WhatsApp: (11) 99999-9999
- 🌐 Site: www.barbearia.com

---

**Desenvolvido com ❤️ para barbeiros modernos**