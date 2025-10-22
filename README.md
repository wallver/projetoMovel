# Projeto Móvel - TrabalhoTuratti

Projeto da disciplina de programação de dispositivos móveis com ReactNative + Expo (Android)

Sistema de autenticação mobile com React Native/Expo e Firebase

## Estrutura do Projeto

```
projetoMovel/
├── backend/           # API Backend (Node.js + Express)
├── frontend/          # Aplicação Mobile (React Native + Expo)
├── documentacao/      # Documentação do projeto
├── apresentacao/      # Materiais de apresentação
├── video/            # Vídeos do projeto
├── COMO_RODAR.md     # Guia rápido
├── FIREBASE_SETUP.md # Configuração do Firebase
└── README.md         # Este arquivo
```

---

## Como Rodar o Projeto

### Pré-requisitos

- **Node.js** (versão 18 ou superior)
- **npm** ou **yarn**
- **Expo Go** app instalado no celular (Android/iOS)
- **Conta Firebase** configurada

---

## Backend (API)

### 1. Navegar para a pasta backend:
```bash
cd backend
```

### 2. Instalar dependências (se ainda não instalou):
```bash
npm install
```

### 3. Iniciar o servidor:
```bash
npm start
```

O servidor irá iniciar na porta **3001**:
- **Health check:** http://localhost:3001/api/health
- **API Base:** http://localhost:3001/api

---

## Frontend (Mobile)

### 1. Navegar para a pasta frontend:
```bash
cd frontend
```

### 2. Instalar dependências (se ainda não instalou):
```bash
npm install
```

### 3. Iniciar o Expo:
```bash
npx expo start
```

### 4. Testar no celular:
- Baixe o app **Expo Go** na Play Store (Android) ou App Store (iOS)
- Escaneie o **QR Code** que aparece no terminal
- O app será carregado no seu celular

---

## Testando a Aplicação

### Cadastro de Novo Usuário:
1. Abra o app
2. Clique em "Cadastrar"
3. Preencha: Nome, Email, Senha (mínimo 6 caracteres)
4. Clique em "Cadastrar"
5. Faça login com as credenciais criadas

### Login:
- Use o email e senha cadastrados
- Clique em "Entrar"

### Recuperação de Senha (REAL):
1. Clique em "Esqueci minha senha"
2. Digite seu email
3. **Verifique sua caixa de email** (Firebase envia automaticamente)
4. Clique no link recebido
5. Defina nova senha
6. Faça login

---

## Funcionalidades

- **Login** - Autenticação com Firebase
- **Cadastro** - Registro de novos usuários
- **Recuperação de Senha** - Email automático via Firebase
- **Salvamento de Dados** - Firestore Database
- **Validações** - Email, senha, campos obrigatórios

---

## Endpoints da API

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/health` | Status do servidor |

---

## Status do Projeto

| Componente | Status | Tecnologia |
|------------|--------|------------|
| **Backend** | ✅ Funcional | Node.js + Express |
| **Frontend** | ✅ Funcional | React Native + Expo |
| **Autenticação** | ✅ Funcional | Firebase Authentication |
| **Banco de Dados** | ✅ Funcional | Firebase Firestore |
| **Email** | ✅ Funcional | Firebase (automático) |

---

## Tecnologias Utilizadas

### Backend:
- Node.js
- Express.js
- CORS

### Frontend:
- React Native
- Expo
- TypeScript
- React Navigation
- Firebase SDK

### Firebase:
- Firebase Authentication
- Cloud Firestore
- Email Recovery (automático)

---

## Notas Importantes

1. **Firebase está configurado e funcionando**
2. **Emails de recuperação são enviados automaticamente**
3. **Dados são salvos no Firestore**
4. **Celular e computador devem estar na mesma rede WiFi**

---

## Documentação Adicional

- `documentacao/COMO_RODAR.md` - Guia rápido para iniciar o projeto
- `documentacao/FIREBASE_SETUP.md` - Documentação completa do Firebase
- `FIREBASE_REGRAS_FIRESTORE.md` - Como configurar regras do Firestore
- `backend/README.md` - Documentação do backend
- `documentacao/` - Documentos do projeto

---

## Próximas Melhorias

- [ ] Verificação de email após cadastro
- [ ] Login com Google
- [ ] Perfil de usuário editável
- [ ] Upload de foto de perfil
- [ ] Testes automatizados

---

## Suporte

Para problemas ou dúvidas, consulte:
- `documentacao/COMO_RODAR.md` - Soluções de problemas comuns
- `documentacao/FIREBASE_SETUP.md` - Configuração do Firebase
- `FIREBASE_REGRAS_FIRESTORE.md` - Configurar regras de segurança

---

**Desenvolvido para o Trabalho Turatti**