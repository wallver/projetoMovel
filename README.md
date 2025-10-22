# Projeto Movel - Sistema de Autenticacao

Sistema completo de autenticacao mobile com React Native/Expo e Firebase

## Inicio Rapido

```bash
# 1. Criar arquivo .env no frontend (veja INICIO_RAPIDO.md)
# 2. Instalar dependencias:
cd frontend
npm install

# 3. Iniciar (escolha um):
npx expo start              # Mesma rede WiFi
npx expo start --tunnel     # Qualquer rede (recomendado)
```

Depois escaneie o QR Code com o Expo Go!

**Documentacao completa:** `documentacao/COMO_RODAR.md`

---

## Estrutura do App

```
Login
  ↓
Dashboard (Tela inicial)
  └─→ Avatar (canto superior direito)
      ├─→ Meu Perfil (informacoes completas)
      ├─→ Configuracoes
      │   └─→ Alterar Informacoes
      │       └─→ Mudar Senha
      └─→ Sair
```

---

## Funcionalidades

### Autenticacao:
- Login com email/senha
- Cadastro de novos usuarios
- Recuperacao de senha por email
- Logout

### Perfil:
- Ver informacoes pessoais
- Estatisticas (futuras)

### Configuracoes:
- Alterar senha
- Menu organizado por secoes
- Opcoes futuras (tema, notificacoes, etc)

### Seguranca:
- Variaveis de ambiente protegidas
- Re-autenticacao para mudar senha
- Validacoes em multiplas camadas
- Firebase Authentication + Firestore

---

## Tecnologias

### Frontend:
- React Native
- Expo
- TypeScript
- Expo Router (navegacao)
- Firebase SDK

### Backend:
- Firebase Authentication
- Cloud Firestore
- Node.js + Express (opcional)

---

## Modos de Conexao

| Modo | Comando | Quando usar |
|------|---------|-------------|
| **WiFi Local** | `npx expo start` | Mesma rede (rapido) |
| **Tunnel** | `npx expo start --tunnel` | Qualquer lugar |
| **USB** | `npx expo start --localhost` + ADB | Com cabo (Android) |

**Recomendado:** Use `--tunnel` se tiver qualquer problema de rede!

---

## Estrutura de Pastas

```
projetoMovel/
├── frontend/                  # App mobile
│   ├── app/
│   │   ├── (tabs)/
│   │   │   └── index.tsx     # Login
│   │   ├── dashboard.tsx     # Tela inicial
│   │   ├── profile.tsx       # Perfil
│   │   ├── settings.tsx      # Configuracoes
│   │   ├── edit-info.tsx     # Alterar senha
│   │   ├── services/
│   │   │   └── authService.ts
│   │   └── utils/
│   │       └── firebase.ts
│   ├── .env                  # Criar! (veja INICIO_RAPIDO.md)
│   └── package.json
│
├── backend/                   # API (opcional)
│   ├── server.js
│   └── package.json
│
├── documentacao/
│   ├── COMO_RODAR.md         # Guia completo
│   ├── FIREBASE_SETUP.md     # Setup Firebase
│   ├── NOVA_ESTRUTURA.md     # Estrutura do app
│   └── ALTERAR_SENHA.md      # Como mudar senha
│
├── INICIO_RAPIDO.md          # 3 passos para comecar
└── README.md                 # Este arquivo
```

---

## Documentacao

- **INICIO_RAPIDO.md** - 3 passos para comecar
- **documentacao/COMO_RODAR.md** - Guia completo + troubleshooting
- **documentacao/FIREBASE_SETUP.md** - Configurar Firebase
- **documentacao/NOVA_ESTRUTURA.md** - Entender o app
- **documentacao/ALTERAR_SENHA.md** - Detalhes da senha

---

## Problemas Comuns

### Porta ocupada:
```bash
npx expo start --tunnel --port 8082
```

### Cache:
```bash
npx expo start --tunnel --clear
```

### Variaveis nao carregam:
```bash
# Certifique-se que .env existe:
ls frontend/.env

# Reinicie com clear:
npx expo start --tunnel --clear
```

### Firebase errors:
Veja `documentacao/FIREBASE_SETUP.md`

**Mais solucoes:** `documentacao/COMO_RODAR.md`

---

## Status

| Componente | Status | Descricao |
|------------|--------|-----------|
| Login | ✅ Funcional | Firebase Auth |
| Cadastro | ✅ Funcional | Firebase Auth + Firestore |
| Recuperacao | ✅ Funcional | Email automatico |
| Dashboard | ✅ Funcional | Tela inicial |
| Perfil | ✅ Funcional | Informacoes completas |
| Configuracoes | ✅ Funcional | Menu organizado |
| Alterar Senha | ✅ Funcional | Com re-autenticacao |
| Logout | ✅ Funcional | Limpa sessao |

---

## Proximas Funcionalidades

- [ ] Lembretes (cards no dashboard)
- [ ] Tarefas
- [ ] Agenda
- [ ] Relatorios
- [ ] Upload de foto de perfil
- [ ] Editar nome/email
- [ ] Tema escuro
- [ ] Notificacoes push
- [ ] Login com Google

---

## Testando

### 1. Cadastro:
```
Abrir app → Cadastrar → Preencher dados → Cadastrar
```

### 2. Login:
```
Email + Senha → Entrar → Dashboard
```

### 3. Ver Perfil:
```
Dashboard → Avatar → Meu Perfil
```

### 4. Alterar Senha:
```
Dashboard → Avatar → Configuracoes → Alterar Informacoes
```

### 5. Logout:
```
Dashboard → Avatar → Sair
```

---

## Requisitos

- Node.js 18+
- npm ou yarn
- Expo Go (celular)
- Firebase configurado

---

## Licenca

Este projeto foi desenvolvido para fins academicos.

---

## Contato

Para duvidas, veja a documentacao em `documentacao/`

---

**Bom desenvolvimento! 🚀**