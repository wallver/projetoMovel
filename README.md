# 📱 Bill Reminder - Sistema de Gerenciamento de Contas com OCR

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React Native](https://img.shields.io/badge/React%20Native-0.81-blue.svg)
![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)

Sistema inteligente para gerenciamento de contas domésticas com reconhecimento automático de dados usando OCR e lembretes inteligentes.

## 🌟 Funcionalidades Principais

### 📸 Captura e Processamento
- **Captura de imagem** da conta via câmera ou galeria
- **OCR automático** para extrair:
  - 💰 Valor da conta
  - 📅 Data de vencimento
  - 🏢 Tipo de conta (luz, água, gás, etc.)
  - 🔢 Código de barras
- **Edição manual** de qualquer dado

### 🔔 Lembretes Inteligentes
- Lembretes automáticos:
  - ⏰ **3 dias antes** do vencimento
  - 📢 **1 dia antes** do vencimento
  - 🚨 **No dia** do vencimento
- Notificações push no celular
- Histórico completo de notificações

### 📊 Dashboard e Gerenciamento
- Lista organizada de todas as contas
- Filtros por status (pendente, paga, vencida)
- Estatísticas em tempo real
- Marcar contas como pagas
- Visualizar imagem original da conta

## 🚀 Começando

### Pré-requisitos

- Node.js 18+
- PostgreSQL 14+
- Expo CLI
- Conta no Firebase
- Celular com Expo Go instalado

### Instalação Rápida

```bash
# Clone o repositório
git clone <url-do-repo>
cd projetoMovel

# Configure o backend
cd backend
npm install
cp .env.example .env
# Edite o .env com suas credenciais
npx prisma migrate dev
npm run dev

# Configure o frontend (em outro terminal)
cd frontend
npm install
cp env.example .env
# Edite o .env com suas credenciais
npm start
```

Para instruções detalhadas, consulte [SETUP_COMPLETO.md](./documentacao/SETUP_COMPLETO.md)

## 📁 Estrutura do Projeto

```
projetoMovel/
├── backend/                    # API Node.js + Express
│   ├── src/
│   │   ├── config/            # Configurações (DB, Firebase)
│   │   ├── controllers/       # Controladores da API
│   │   ├── services/          # Serviços (OCR, Notificações, Lembretes)
│   │   ├── routes/            # Rotas da API
│   │   ├── middlewares/       # Middlewares (autenticação)
│   │   ├── jobs/              # Cron jobs
│   │   └── server.ts          # Servidor principal
│   ├── prisma/
│   │   └── schema.prisma      # Schema do banco de dados
│   └── package.json
│
├── frontend/                   # App React Native (Expo)
│   ├── app/
│   │   ├── (tabs)/            # Telas principais (tabs)
│   │   │   ├── index.tsx      # Home
│   │   │   └── bills.tsx      # Lista de contas
│   │   ├── services/          # Serviços (API, Câmera, Notificações)
│   │   ├── utils/             # Utilitários (Firebase)
│   │   ├── bill-upload.tsx    # Tela de upload/confirmação
│   │   └── bill-detail.tsx    # Tela de detalhes da conta
│   └── package.json
│
└── documentacao/              # Documentação completa
    ├── SETUP_COMPLETO.md      # Guia completo de instalação
    ├── FIREBASE_SETUP.md      # Configuração do Firebase
    └── COMO_RODAR.md          # Instruções para rodar
```

## 🛠️ Tecnologias

### Backend
- **Node.js + Express** - API REST
- **TypeScript** - Tipagem estática
- **Prisma ORM** - ORM moderno
- **PostgreSQL** - Banco de dados
- **Firebase Admin** - Autenticação e Storage
- **Tesseract.js / Google Vision** - OCR
- **Node-cron** - Agendamento de tarefas

### Frontend
- **React Native** - Framework mobile
- **Expo** - Toolchain e SDK
- **TypeScript** - Tipagem estática
- **Expo Router** - Navegação
- **Firebase SDK** - Autenticação
- **Axios** - Cliente HTTP
- **Expo Camera** - Captura de imagem
- **Expo Notifications** - Notificações push

## 📱 Screenshots

### Fluxo Principal

1. **Login/Registro** → Autenticação segura
2. **Dashboard** → Visão geral das contas
3. **Captura** → Foto da conta
4. **Processamento** → OCR automático
5. **Confirmação** → Revisão e edição
6. **Lembretes** → Notificações automáticas

## 🔐 Segurança

- Autenticação via Firebase Authentication
- Tokens JWT para APIs
- Validação de dados no backend
- Regras de segurança no Firebase Storage
- Senhas criptografadas
- CORS configurado

## 📊 Banco de Dados

### Entidades Principais

- **User** - Usuários do sistema
- **Bill** - Contas cadastradas
- **Reminder** - Lembretes agendados
- **Notification** - Histórico de notificações

Veja o schema completo em `backend/prisma/schema.prisma`

## 🔄 Fluxo de Dados

```
1. Usuário tira foto da conta
2. Frontend envia imagem para backend
3. Backend salva no Firebase Storage
4. Backend processa com OCR
5. Backend extrai dados (valor, vencimento)
6. Backend salva conta no PostgreSQL
7. Backend cria lembretes automáticos
8. Cron job verifica lembretes periodicamente
9. Backend envia notificação push
10. Frontend exibe notificação ao usuário
```

## 🧪 Testes

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

## 📝 Variáveis de Ambiente

### Backend (.env)
```env
DATABASE_URL=postgresql://...
PORT=3001
FIREBASE_PROJECT_ID=...
FIREBASE_PRIVATE_KEY=...
FIREBASE_CLIENT_EMAIL=...
USE_LOCAL_OCR=true
```

### Frontend (.env)
```env
EXPO_PUBLIC_API_URL=http://192.168.1.100:3001/api
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
```

## 🚧 Roadmap

- [ ] Suporte para múltiplas moedas
- [ ] Integração com bancos (Open Banking)
- [ ] Exportação de relatórios (PDF)
- [ ] Modo escuro
- [ ] Reconhecimento de QR Code
- [ ] Compartilhamento de contas (família)
- [ ] Categorização automática de gastos
- [ ] Dashboard com gráficos

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add: nova funcionalidade'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👥 Autores

- **Seu Nome** - *Desenvolvimento inicial*
- **Colaboradores** - Veja a lista de [contribuidores](https://github.com/seu-usuario/projetoMovel/contributors)

## 📞 Contato

- Email: seu-email@exemplo.com
- LinkedIn: [seu-linkedin](https://linkedin.com/in/seu-perfil)
- GitHub: [@seu-usuario](https://github.com/seu-usuario)

## 🙏 Agradecimentos

- Firebase por fornecer infraestrutura gratuita
- Expo pela excelente toolchain
- Comunidade React Native
- Contribuidores open-source

---

**⭐ Se este projeto te ajudou, considere dar uma estrela!**

**Desenvolvido com ❤️ usando React Native e Node.js**
