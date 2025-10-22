# Guia de Segurança - Firebase

## Como Proteger suas Credenciais do Firebase

### Por que usar variáveis de ambiente?

As credenciais do Firebase (API Key, Project ID, etc) **não devem ser commitadas** diretamente no código porque:
- ✅ Evita exposição de informações sensíveis no GitHub
- ✅ Permite diferentes configurações por ambiente (dev, prod)
- ✅ Facilita rotação de credenciais
- ✅ Segue melhores práticas de segurança

---

## Configuração Passo a Passo

### 1. Criar arquivo .env

No diretório `frontend/`, crie um arquivo chamado `.env`:

```bash
cd frontend
```

Crie o arquivo `.env` (pode usar o exemplo):
```bash
cp env.example .env
```

Ou crie manualmente com este conteúdo:

```env
# Firebase Configuration
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyBW85iYMpE7yCu6XDNohHTmr8ON11-FWUI
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=lembretecontas.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=lembretecontas
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=lembretecontas.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=853973539596
EXPO_PUBLIC_FIREBASE_APP_ID=1:853973539596:web:010e651e5414d4b2690729
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=G-S88VBFRSEF
```

**IMPORTANTE:** No Expo, as variáveis devem começar com `EXPO_PUBLIC_` para serem acessíveis no app.

---

### 2. Verificar .gitignore

O arquivo `.gitignore` na raiz do projeto deve conter:

```gitignore
# Variáveis de ambiente - NÃO COMMITAR
.env
.env.local
.env.*.local
**/.env
```

✅ **Já está configurado no projeto!**

---

### 3. Usar as variáveis no código

O arquivo `frontend/app/utils/firebase.ts` agora usa:

```typescript
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  // ... outras configurações
};
```

✅ **Já está configurado!**

---

## Para GitHub (Secrets)

### Configurar GitHub Secrets para CI/CD

Se você usar GitHub Actions, adicione as variáveis como secrets:

1. Vá para seu repositório no GitHub
2. **Settings** → **Secrets and variables** → **Actions**
3. Clique em **New repository secret**
4. Adicione cada variável:
   - Nome: `EXPO_PUBLIC_FIREBASE_API_KEY`
   - Valor: `AIzaSyBW85iYMpE7yCu6XDNohHTmr8ON11-FWUI`
   - (Repita para todas as variáveis)

---

## Testando

### 1. Reiniciar o Expo

Após criar o arquivo `.env`, **reinicie o servidor Expo**:

```bash
# Pare o Expo (Ctrl+C)
# Inicie novamente
npx expo start --clear
```

O `--clear` limpa o cache e recarrega as variáveis de ambiente.

### 2. Verificar se funciona

1. Abra o app
2. Tente fazer login ou cadastro
3. Se funcionar, está tudo certo! ✅

---

## Segurança Adicional no Firebase

### 1. Restrições de API Key

No Firebase Console:

1. Vá em **Project Settings** → **General**
2. Na seção **Your apps**, clique no app web
3. Configure **API Key restrictions**:
   - **Application restrictions**: HTTP referrers
   - Adicione seus domínios autorizados

### 2. Regras de Segurança do Firestore

Já estão configuradas em `documentacao/FIREBASE_SETUP.md`:

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

### 3. Habilitar App Check (Opcional)

Para proteção avançada contra abuso:

1. Firebase Console → **App Check**
2. Habilite para seu app
3. Configure reCAPTCHA ou outros provedores

---

## Checklist de Segurança

- [x] Arquivo `.env` criado no frontend
- [x] `.env` adicionado ao `.gitignore`
- [x] `firebase.ts` usando `process.env.EXPO_PUBLIC_*`
- [x] Expo reiniciado com `--clear`
- [ ] Arquivo `.env` NÃO está no GitHub (VERIFIQUE!)
- [ ] GitHub Secrets configurados (se usar CI/CD)
- [ ] Regras do Firestore configuradas
- [ ] API Key com restrições (opcional)

---

## Removendo Credenciais do Histórico do Git

Se você já commitou as credenciais antes, precisa removê-las do histórico:

⚠️ **ATENÇÃO:** Isso reescreve o histórico do Git!

### Opção 1: BFG Repo-Cleaner (Recomendado)

```bash
# Instale o BFG
# https://rtyley.github.io/bfg-repo-cleaner/

# Clone um mirror do seu repo
git clone --mirror https://github.com/seu-usuario/seu-repo.git

# Execute o BFG para remover o arquivo
bfg --delete-files firebase.ts

# Limpe e force push
cd seu-repo.git
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push --force
```

### Opção 2: Rotacionar Credenciais (Mais Fácil)

Se as credenciais já estão no GitHub:

1. **Vá ao Firebase Console**
2. **Regenere a API Key**:
   - Project Settings → General
   - Delete old web app
   - Create new web app
   - Copie novas credenciais
3. **Atualize o arquivo `.env`** com as novas credenciais
4. **Commit apenas o `.gitignore` atualizado**

---

## Estrutura Final de Arquivos

```
projetoMovel/
├── .gitignore                  ✅ Com .env listado
├── frontend/
│   ├── .env                    ✅ Com suas credenciais (NÃO COMMITAR)
│   ├── env.example             ✅ Exemplo sem credenciais (COMMITAR)
│   └── app/
│       └── utils/
│           └── firebase.ts     ✅ Usando process.env (COMMITAR)
```

---

## Boas Práticas

### ✅ FAÇA:
- Use variáveis de ambiente para credenciais
- Adicione `.env` ao `.gitignore`
- Crie `env.example` como referência
- Configure regras de segurança no Firestore
- Reinicie o Expo após alterar `.env`

### ❌ NÃO FAÇA:
- Não commite arquivos `.env`
- Não exponha API Keys em código público
- Não use credenciais de produção em desenvolvimento
- Não compartilhe `.env` por email/chat

---

## Testando Segurança

### Verificar se .env não está no GitHub:

```bash
# Verifique o status do Git
git status

# O .env NÃO deve aparecer para commit
# Se aparecer, está no .gitignore?
```

### Verificar se as variáveis estão carregando:

Adicione um console.log temporário em `firebase.ts`:

```typescript
console.log('Firebase Config:', {
  hasApiKey: !!process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  hasProjectId: !!process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID
});
```

Deve mostrar `true` para ambos.

---

## Suporte

- Firebase Security: https://firebase.google.com/docs/rules
- Expo Environment Variables: https://docs.expo.dev/guides/environment-variables/
- GitHub Secrets: https://docs.github.com/en/actions/security-guides/encrypted-secrets

---

**Suas credenciais agora estão protegidas! 🔒**
