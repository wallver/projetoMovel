# 🚀 Como Iniciar o Projeto Bill Reminder

## ✅ Pré-requisitos Concluídos

- ✅ Node.js instalado
- ✅ Firebase configurado (credenciais no `backend/.env`)
- ✅ Banco de dados: **Firestore** (não precisa PostgreSQL!)
- ✅ Dependências instaladas

---

## 📱 Passo a Passo

### 1. **Ativar Firestore Database no Firebase**

⚠️ **IMPORTANTE: Faça isso ANTES de iniciar o backend!**

1. Acesse: **https://console.firebase.google.com/project/lembretecontas**
2. Menu lateral → **Firestore Database**
3. Clique em **"Criar banco de dados"**
4. Escolha **"Modo de produção"**
5. Localização: **southamerica-east1 (São Paulo)**
6. Clique em **"Ativar"**

Aguarde alguns segundos até o Firestore ser criado.

### 2. **Configurar Regras de Segurança**

Ainda no Firestore:
1. Clique na aba **"Regras"**
2. Cole este código:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isSignedIn() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return request.auth.uid == userId;
    }
    
    match /users/{userId} {
      allow read, write: if isSignedIn() && isOwner(userId);
    }
    
    match /bills/{billId} {
      allow read: if isSignedIn() && isOwner(resource.data.userId);
      allow create: if isSignedIn() && isOwner(request.resource.data.userId);
      allow update, delete: if isSignedIn() && isOwner(resource.data.userId);
      
      match /reminders/{reminderId} {
        allow read, write: if isSignedIn();
      }
    }
    
    match /notifications/{notificationId} {
      allow read: if isSignedIn() && isOwner(resource.data.userId);
      allow write: if isSignedIn();
    }
  }
}
```

3. Clique em **"Publicar"**

### 3. **Iniciar Backend**

Abra um terminal:

```bash
cd backend
npm run dev
```

**Deve aparecer:**
```
🚀 Servidor Bill Reminder rodando!
✅ Firebase Admin inicializado com sucesso
📦 Projeto: lembretecontas
📊 Health check: http://localhost:3001/api/health
⏰ Cron jobs iniciados
```

✅ **Backend rodando em:** `http://localhost:3001`

### 4. **Testar Backend**

Abra o navegador em: **http://localhost:3001/api/health**

Deve retornar:
```json
{
  "status": "OK",
  "message": "API funcionando!",
  "timestamp": "2025-10-24T...",
  "version": "1.0.0"
}
```

### 5. **Configurar Frontend**

Em outro terminal:

```bash
cd frontend
npm install  # Se ainda não instalou
npm start
```

### 6. **Abrir App no Celular**

1. Abra o app **Expo Go** no celular
2. Escaneie o QR Code que apareceu no terminal
3. Aguarde o app carregar

---

## 🔍 Verificar se está tudo OK

### ✅ Backend funcionando?
```bash
# Deve retornar "OK"
curl http://localhost:3001/api/health
```

### ✅ Firestore ativo?
1. Firebase Console → Firestore Database
2. Você deve ver as coleções: `users`, `bills`, `notifications`
3. Inicialmente estarão vazias (é normal!)

### ✅ Firebase Storage ativo?
1. Firebase Console → Storage
2. Deve estar ativo
3. Após fazer upload, verá a pasta `bills/`

---

## 🐛 Resolução de Problemas

### ❌ "default Firebase app does not exist"
**Solução:**
1. Verifique se o arquivo `backend/.env` existe
2. Verifique se tem todas as credenciais (PROJECT_ID, PRIVATE_KEY, etc.)
3. Reinicie o backend: `npm run dev`

### ❌ "Permission denied" no Firestore
**Solução:**
1. Configure as regras de segurança (passo 2)
2. Certifique-se que o Authentication está ativo no Firebase

### ❌ Frontend não conecta no backend
**Solução:**
1. Verifique se o backend está rodando (`http://localhost:3001/api/health`)
2. No `frontend/.env`, ajuste `EXPO_PUBLIC_API_URL` com seu IP local:
   ```bash
   # Windows: ipconfig
   # Mac/Linux: ifconfig
   ```
   ```env
   EXPO_PUBLIC_API_URL=http://SEU_IP:3001/api
   ```
3. Backend e celular devem estar na **mesma rede WiFi**

### ❌ OCR não funciona
**Solução:** O OCR local (Tesseract) está configurado. Para melhor precisão:
1. Garanta fotos nítidas e bem iluminadas
2. (Opcional) Configure Google Vision API no `.env`

---

## 📊 Estrutura do Firestore

Após o primeiro cadastro, você verá estas collections:

```
firestore/
  ├── users/
  │   └── {firebaseUid}/
  │       ├── email
  │       ├── username
  │       └── createdAt
  │
  ├── bills/
  │   └── {billId}/
  │       ├── userId
  │       ├── title
  │       ├── value
  │       ├── dueDate
  │       ├── imageUrl
  │       ├── status
  │       └── reminders/ (subcollection)
  │
  └── notifications/
      └── {notificationId}/
          ├── userId
          ├── title
          ├── message
          └── sentAt
```

---

## 🎯 Fluxo Completo de Teste

1. ✅ **Iniciar backend** → `npm run dev` em `backend/`
2. ✅ **Iniciar frontend** → `npm start` em `frontend/`
3. ✅ **Abrir app** no celular via Expo Go
4. ✅ **Criar conta** no app
5. ✅ **Fazer login**
6. ✅ **Tirar foto** de uma conta (teste com qualquer papel com números)
7. ✅ **Ver conta** processada na lista
8. ✅ **Verificar no Firestore** Console se os dados apareceram

---

## 📚 Documentação Adicional

- **Estrutura do Firestore:** [Ver documentação completa]
- **API REST:** Todas as rotas disponíveis
- **Firebase Setup:** Como configurar do zero

---

## 🎉 Pronto!

Seu projeto está 100% configurado com:
- ✅ Backend Node.js + Express
- ✅ Firebase/Firestore (sem PostgreSQL!)
- ✅ OCR automático
- ✅ Sistema de lembretes
- ✅ Frontend React Native

**Qualquer dúvida, consulte esta documentação!** 📖

---

**Desenvolvido com ❤️ usando Firebase**

