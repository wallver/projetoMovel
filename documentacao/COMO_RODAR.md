# Como Rodar o Projeto

## Inicio Rapido

### Requisitos
- Node.js instalado
- Expo Go no celular (baixe na App Store ou Google Play)
- Firebase configurado (veja FIREBASE_SETUP.md)

---

## Passo a Passo

### 1. Criar arquivo .env

**IMPORTANTE:** Antes de iniciar, crie o arquivo `.env` no frontend:

```bash
cd frontend
```

Crie um arquivo chamado `.env` com este conteudo:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=sua-api-key-aqui
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=seu-projeto-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=seu-bucket.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=seu-sender-id
EXPO_PUBLIC_FIREBASE_APP_ID=seu-app-id
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=seu-measurement-id
```

Substitua pelos valores do seu projeto Firebase.

---

### 2. Instalar Dependencias

#### Frontend:
```bash
cd frontend
npm install
```

#### Backend (Opcional - Por enquanto o Firebase cuida da auth):
```bash
cd backend
npm install
```

---

### 3. Iniciar o Projeto

Voce tem 2 opcoes:

#### OPCAO 1: Mesma Rede WiFi (Mais Rapido)

Use se seu celular estiver na **mesma rede WiFi** que seu PC.

```bash
cd frontend
npx expo start
```

**Vantagens:**
- Muito rapido
- Nao gasta internet
- Muito estavel

**Desvantagem:**
- Celular precisa estar na mesma rede

---

#### OPCAO 2: Tunnel - Qualquer Rede (Recomendado)

Use se seu celular estiver em **outra rede** ou com **dados moveis (4G/5G)**.

```bash
cd frontend
npx expo start --tunnel
```

**Vantagens:**
- Funciona de qualquer lugar
- Pode usar dados moveis
- Nao precisa mesma rede

**Desvantagem:**
- Um pouco mais lento

---

### 4. Abrir no Celular

1. Instale o **Expo Go** no celular:
   - Android: Google Play Store
   - iOS: App Store

2. Abra o **Expo Go**

3. Escaneie o QR Code que apareceu no terminal:
   - Android: Use o scanner do Expo Go
   - iOS: Use a camera do iPhone

4. Aguarde o app carregar!

---

## Problemas Comuns e Solucoes

### 1. "Port 8081 is being used"

Outra instancia do Expo esta rodando.

**Solucao:**
```bash
# Use outra porta:
npx expo start --tunnel --port 8082

# OU mate o processo na porta 8081:
# Windows:
netstat -ano | findstr :8081
taskkill /PID [numero-do-pid] /F

# Mac/Linux:
lsof -ti:8081 | xargs kill -9
```

---

### 2. "Execution policy error" (PowerShell)

Execucao de scripts desabilitada no Windows.

**Solucao:**
```powershell
# Execute como Administrador:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# OU use CMD ao inves do PowerShell
```

---

### 3. "Cannot find package.json"

Voce nao esta na pasta correta.

**Solucao:**
```bash
# Certifique-se de estar na pasta frontend:
cd F:\Trabalho_Estudos\Programming\projetoMovel\frontend
npx expo start --tunnel
```

---

### 4. "QR Code nao aparece"

O Expo ainda esta carregando ou teve erro.

**Solucao:**
```bash
# Limpe o cache e reinicie:
npx expo start --tunnel --clear
```

---

### 5. "Tunnel muito lento"

Conexao com internet pode estar ruim.

**Solucao:**
```bash
# Se possivel, conecte na mesma rede WiFi e use:
npx expo start
```

---

### 6. "Firebase Error: configuration-not-found"

Email/Password auth nao esta habilitado no Firebase.

**Solucao:**
1. Va ao Firebase Console
2. Authentication → Sign-in method
3. Habilite "Email/Password"
4. Salve

---

### 7. "Missing or insufficient permissions"

Regras do Firestore estao bloqueando.

**Solucao:**
1. Va ao Firebase Console
2. Firestore Database → Rules
3. Cole estas regras:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow create: if request.auth != null;
      allow read, update: if request.auth != null && request.auth.uid == userId;
      allow delete: if false;
    }
  }
}
```

4. Publique

---

### 8. "App nao carrega no celular"

Varios motivos possiveis.

**Solucao:**
```bash
# 1. Verifique se o .env existe:
ls frontend/.env

# Se nao existir, crie-o (veja passo 1)

# 2. Reinicie com cache limpo:
cd frontend
npx expo start --tunnel --clear

# 3. No celular, force-close o Expo Go e abra novamente
```

---

### 9. "Variaveis de ambiente nao carregam"

O arquivo .env foi criado mas as variaveis nao funcionam.

**Solucao:**
```bash
# Sempre reinicie com --clear apos criar/editar .env:
npx expo start --tunnel --clear
```

---

## Comandos Uteis

### Limpar Cache do Expo:
```bash
npx expo start --clear
```

### Usar Porta Especifica:
```bash
npx expo start --tunnel --port 8082
```

### Ver Logs Detalhados:
```bash
npx expo start --tunnel --verbose
```

### Abrir no Navegador (Web):
```bash
npx expo start
# Depois pressione 'w'
```

---

## Estrutura do Projeto

```
projetoMovel/
├── frontend/               ← App mobile
│   ├── app/
│   │   ├── (tabs)/
│   │   │   └── index.tsx  ← Login
│   │   ├── dashboard.tsx  ← Tela inicial apos login
│   │   ├── profile.tsx    ← Perfil do usuario
│   │   ├── settings.tsx   ← Configuracoes
│   │   ├── edit-info.tsx  ← Alterar senha
│   │   ├── services/
│   │   │   └── authService.ts  ← Funcoes Firebase
│   │   └── utils/
│   │       └── firebase.ts     ← Config Firebase
│   ├── .env               ← Suas credenciais (criar!)
│   └── package.json
│
├── backend/               ← API (opcional por enquanto)
│   ├── server.js
│   └── package.json
│
└── documentacao/
    ├── COMO_RODAR.md      ← Este arquivo
    ├── FIREBASE_SETUP.md  ← Setup Firebase
    ├── NOVA_ESTRUTURA.md  ← Estrutura do app
    └── ALTERAR_SENHA.md   ← Como mudar senha
```

---

## Fluxo de Uso

### 1. Primeira Vez:
```bash
# 1. Criar .env no frontend
# 2. Instalar dependencias:
cd frontend
npm install

# 3. Iniciar:
npx expo start --tunnel
```

### 2. Dias Seguintes:
```bash
# Apenas iniciar:
cd frontend
npx expo start --tunnel
```

---

## Testando Funcionalidades

### 1. Cadastro:
1. Abra o app
2. Clique em "Cadastrar"
3. Preencha: nome, email, senha
4. Clique "Cadastrar"
5. Deve mostrar sucesso e voltar para login

### 2. Login:
1. Digite email e senha
2. Clique "Entrar"
3. Deve ir para Dashboard

### 3. Ver Perfil:
1. No Dashboard, clique no avatar (canto superior direito)
2. Clique "Meu Perfil"
3. Veja suas informacoes

### 4. Alterar Senha:
1. Dashboard → Avatar → Configuracoes
2. Clique "Alterar Informacoes"
3. Preencha os campos de senha
4. Clique "Salvar Alteracoes"

### 5. Logout:
1. Dashboard → Avatar → Sair
2. Confirme
3. Volta para Login

---

## Modos de Conexao

### Comparacao:

| Modo | Comando | Mesma Rede? | Velocidade | Uso |
|------|---------|-------------|------------|-----|
| **WiFi Local** | `npx expo start` | Sim | Rapido | Mesma rede |
| **Tunnel** | `npx expo start --tunnel` | Nao | Normal | Qualquer lugar |
| **USB Android** | `npx expo start --localhost` + ADB | Nao | Rapido | Com cabo |

### Quando usar cada um:

**WiFi Local:**
- Voce e seu celular na mesma rede
- Quer velocidade maxima
- Desenvolvimento rapido

**Tunnel (Recomendado):**
- Celular em outra rede
- Usando dados moveis (4G/5G)
- Quer testar de qualquer lugar
- Compartilhar com outras pessoas

**USB (Android apenas):**
- Conexao instavel
- Quer velocidade maxima sem WiFi
- Desenvolvimento com cabo

---

## Backend (Opcional)

Por enquanto, o Firebase cuida de toda a autenticacao. O backend e opcional.

Se quiser iniciar o backend:

```bash
cd backend
npm install
npm start
```

Deve mostrar:
```
🚀 Servidor rodando na porta 3001
🔗 Health check: http://localhost:3001/api/health
```

---

## Checklist de Inicio

Antes de iniciar, verifique:

- [ ] Node.js instalado
- [ ] Expo Go instalado no celular
- [ ] Firebase configurado (Authentication + Firestore)
- [ ] Arquivo `.env` criado no frontend
- [ ] Dependencias instaladas (`npm install`)
- [ ] Porta 8081 livre (ou use outra)
- [ ] Internet funcionando (para tunnel)

---

## Dicas

1. **Sempre use `--clear`** apos mudar o `.env`:
   ```bash
   npx expo start --tunnel --clear
   ```

2. **Mantenha o terminal aberto** enquanto testa o app

3. **Use tunnel** se tiver qualquer problema de rede

4. **Force-close o Expo Go** no celular se o app nao atualizar

5. **Verifique os logs** no terminal para ver erros

---

## Links Uteis

- **Firebase Console:** https://console.firebase.google.com/
- **Expo Docs:** https://docs.expo.dev/
- **React Native Docs:** https://reactnative.dev/

---

## Suporte

Se tiver problemas:

1. Verifique esta documentacao
2. Veja os logs no terminal
3. Verifique se o Firebase esta configurado (FIREBASE_SETUP.md)
4. Tente com `--clear`
5. Tente com `--tunnel`

---

**Pronto para comecar! Bom desenvolvimento! 🚀**