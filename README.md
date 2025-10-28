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
- Conta no Firebase (com Firestore e Storage ativos)
- Expo CLI
- Celular com Expo Go instalado
- **ngrok** (para acesso remoto - opcional)

### Instalação Rápida

```bash
# Clone o repositório
git clone <url-do-repo>
cd projetoMovel

# Configure o backend
cd backend
npm install
cp .env.example .env
# Edite o .env com suas credenciais do Firebase
npm run dev

# Configure o frontend (em outro terminal)
cd frontend
npm install
cp env.example .env
# Edite o .env com suas credenciais
npm start
```

### 🌐 Configuração para Acesso Remoto (celular em rede diferente)

Se seu celular **não estiver na mesma rede WiFi** que seu computador:

```bash
# 1. Instale o ngrok
# Acesse: https://ngrok.com/ e crie uma conta grátis
# Baixe e instale o ngrok

# 2. Configure seu authtoken
ngrok config add-authtoken SEU_AUTHTOKEN

# 3. Exponha o backend (em um novo terminal)
ngrok http 3001

# 4. Copie a URL gerada (ex: https://abc123.ngrok-free.app)

# 5. No frontend/.env, configure:
EXPO_PUBLIC_API_URL=https://abc123.ngrok-free.app/api

# 6. Inicie o frontend com tunnel
cd frontend
npx expo start --tunnel
```

**📚 Documentação Completa:**
- [INICIAR_PROJETO.md](./INICIAR_PROJETO.md) - Como iniciar o projeto passo a passo
- [NGROK_SETUP.md](./NGROK_SETUP.md) - Guia completo sobre ngrok para acesso remoto

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
- **Firebase Firestore** - Banco de dados NoSQL
- **Firebase Admin** - Autenticação e Storage
- **Tesseract.js** - OCR local
- **Node-cron** - Agendamento de tarefas
- **Multer** - Upload de arquivos

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

## 📊 Banco de Dados (Firestore)

### Collections Principais

- **users** - Usuários do sistema
  ```
  users/{userId}
  ├── email
  ├── username
  └── createdAt
  ```

- **bills** - Contas cadastradas
  ```
  bills/{billId}
  ├── userId
  ├── title
  ├── value
  ├── dueDate
  ├── imageUrl
  ├── status
  └── reminders/ (subcollection)
  ```

- **notifications** - Histórico de notificações
  ```
  notifications/{notificationId}
  ├── userId
  ├── title
  ├── message
  └── sentAt
  ```

## 🔄 Fluxo de Dados

```
1. Usuário tira foto da conta
2. Frontend envia imagem para backend
3. Backend salva no Firebase Storage
4. Backend processa com OCR (Tesseract)
5. Backend extrai dados (valor, vencimento, tipo)
6. Backend salva conta no Firestore
7. Backend cria lembretes automáticos
8. Cron job verifica lembretes periodicamente (a cada 1 hora)
9. Backend envia notificação push via Firebase
10. Frontend exibe notificação ao usuário
```

## 🔧 Troubleshooting

### ❌ Frontend não conecta ao backend

**Problema:** App não consegue se comunicar com o backend

**Solução para mesma rede WiFi:**
1. Verifique se o backend está rodando: `http://localhost:3001/api/health`
2. Descubra seu IP: `ipconfig` (Windows) ou `ifconfig` (Mac/Linux)
3. Configure `frontend/.env`: `EXPO_PUBLIC_API_URL=http://SEU_IP:3001/api`
4. Reinicie o frontend

**Solução para redes diferentes:**
1. Certifique-se que o ngrok está rodando: `ngrok http 3001`
2. Copie a URL HTTPS do ngrok
3. Configure `frontend/.env`: `EXPO_PUBLIC_API_URL=https://abc123.ngrok-free.app/api`
4. **Não esqueça** do `/api` no final!
5. Reinicie o frontend com `--tunnel`: `npx expo start --tunnel`

### ❌ Erro "authentication failed" no ngrok

**Problema:** ngrok retorna erro de autenticação

**Solução:**
1. Acesse: https://dashboard.ngrok.com/get-started/your-authtoken
2. Copie SEU authtoken (não use o exemplo da documentação!)
3. Execute: `ngrok config add-authtoken SEU_AUTHTOKEN`
4. Tente novamente: `ngrok http 3001`

### ❌ ngrok "Route not found"

**Problema:** Browser mostra `{"error": "Rota não encontrada"}`

**Solução:** Você acessou `/api` ao invés de `/api/health`
- ✅ Correto: `https://sua-url.ngrok-free.app/api/health`
- ❌ Errado: `https://sua-url.ngrok-free.app/api`

### ⚠️ ngrok exibe página de aviso

**Problema:** Ao acessar a URL do ngrok no navegador, aparece uma página "You are about to visit..."

**Solução:** Isso é **normal** para contas gratuitas!
- Clique em **"Visit Site"** para continuar
- Esse aviso só aparece no navegador na primeira vez
- O app mobile **não** mostra essa tela - as requisições funcionam diretamente
- Se necessário, pode-se adicionar o header `ngrok-skip-browser-warning` nas requisições

### ❌ Firestore "Permission denied"

**Problema:** Erro de permissão no Firestore

**Solução:**
1. Acesse: https://console.firebase.google.com/
2. Vá em **Firestore Database** → **Regras**
3. Verifique se as regras de segurança estão configuradas (veja [INICIAR_PROJETO.md](./INICIAR_PROJETO.md))
4. Certifique-se que o Authentication está ativo

### ❌ OCR não funciona / não extrai dados

**Problema:** OCR não consegue ler os dados da conta

**Solução:**
1. Tire fotos **nítidas** e **bem iluminadas**
2. Evite fotos tremidas ou com sombras
3. Centralize o documento na foto
4. Se necessário, edite os dados manualmente após o upload

## 🧪 Testes

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```
## 🎯 Como Usar

### 📱 Mesma Rede WiFi (Recomendado para desenvolvimento local)

1. Inicie o backend: `cd backend && npm run dev`
2. Descubra seu IP local: `ipconfig` (Windows) ou `ifconfig` (Mac/Linux)
3. Configure `frontend/.env`: `EXPO_PUBLIC_API_URL=http://SEU_IP:3001/api`
4. Inicie o frontend: `cd frontend && npm start`
5. Escaneie o QR Code no app Expo Go

### 🌐 Redes Diferentes (Usando ngrok)

1. Inicie o backend: `cd backend && npm run dev`
2. Exponha com ngrok: `ngrok http 3001`
3. Copie a URL gerada (ex: `https://abc123.ngrok-free.app`)
4. Configure `frontend/.env`: `EXPO_PUBLIC_API_URL=https://abc123.ngrok-free.app/api`
5. Inicie o frontend: `cd frontend && npx expo start --tunnel`
6. Escaneie o QR Code no app Expo Go

**⚠️ Importante:** 
- Mantenha o ngrok rodando enquanto usa o app
- A URL do ngrok muda a cada reinicialização (plano gratuito)
- Atualize o `.env` quando a URL mudar

### 💻 Estrutura de Terminais

**Para mesma rede WiFi (2 terminais):**
```
Terminal 1: Backend
├─ cd backend
└─ npm run dev
   ✅ http://localhost:3001

Terminal 2: Frontend
├─ cd frontend
└─ npm start
   ✅ Expo Metro Bundler
```

**Para redes diferentes (3 terminais):**
```
Terminal 1: Backend
├─ cd backend
└─ npm run dev
   ✅ http://localhost:3001

Terminal 2: ngrok
└─ ngrok http 3001
   ✅ https://abc123.ngrok-free.app → localhost:3001

Terminal 3: Frontend
├─ cd frontend
└─ npx expo start --tunnel
   ✅ Expo Metro Bundler + Tunnel
```

## 🚧 Roadmap

- [x] Sistema de autenticação com Firebase
- [x] Upload e OCR de contas
- [x] Lembretes automáticos (3 dias, 1 dia, no dia)
- [x] Notificações push
- [x] Dashboard com estatísticas
- [ ] Suporte para múltiplas moedas
- [ ] Integração com bancos (Open Banking)
- [ ] Exportação de relatórios (PDF)
- [ ] Modo escuro
- [ ] Reconhecimento de código de barras/QR Code
- [ ] Compartilhamento de contas (família)
- [ ] Categorização automática de gastos
- [ ] Dashboard com gráficos avançados

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

- **Wallace da Silva Francisco** - *Desenvolvimento inicial*
- **Willian Luiz Iamarino Gandolphi** - Veja a lista de [contribuidores](https://github.com/seu-usuario/projetoMovel/contributors)

## 📞 Contato

- Email: wallacedasilvalesk123@gmail.com
- GitHub: Acesse o repositório do projeto

## 🙏 Agradecimentos

- Firebase por fornecer infraestrutura gratuita
- Expo pela excelente toolchain
- Comunidade React Native
- Contribuidores open-source

---

