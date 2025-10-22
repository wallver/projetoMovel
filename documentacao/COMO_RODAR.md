# 🚀 GUIA RÁPIDO - Como Rodar o Projeto

## ⚡ Início Rápido (5 minutos)

### 1️⃣ Abrir **DOIS** Terminais

Você precisa de 2 terminais abertos simultaneamente:
- Terminal 1: **Backend**
- Terminal 2: **Frontend**

---

### 2️⃣ Terminal 1 - Backend (API)

```bash
# Navegar para a pasta backend
cd backend

# Instalar dependências (só precisa fazer 1 vez)
npm install

# Iniciar o servidor
npm start
```

✅ **Sucesso quando ver:**
```
🚀 Servidor rodando na porta 3001
🔗 Health check: http://localhost:3001/api/health
```

**⚠️ Deixe este terminal aberto!** O backend precisa ficar rodando.

---

### 3️⃣ Terminal 2 - Frontend (Mobile)

```bash
# Navegar para a pasta frontend
cd frontend

# Instalar dependências (só precisa fazer 1 vez)
npm install

# Iniciar o Expo
npx expo start
```

✅ **Sucesso quando ver um QR Code** no terminal.

---

### 4️⃣ Testar no Celular

1. **Baixe o Expo Go** no seu celular:
   - 📱 Android: [Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - 🍎 iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)

2. **Escaneie o QR Code:**
   - Android: Abra o Expo Go e toque em "Scan QR Code"
   - iOS: Abra a câmera e aponte para o QR Code

3. **Aguarde o carregamento** (pode demorar alguns segundos)

4. **Cadastre um usuário:**
   - Clique em "Cadastrar"
   - Preencha: Nome, Email, Senha (mínimo 6 caracteres)
   - Faça login com as credenciais criadas

---

## 📱 Testar no Navegador (Opcional)

No terminal do Expo, pressione `w` para abrir no navegador web.

---

## ❌ Problemas Comuns

### "Erro de conexão com o servidor"
**Solução:** Verifique se o backend está rodando (Terminal 1)

### "Cannot read package.json"
**Solução:** Certifique-se de estar na pasta correta (`cd backend` ou `cd frontend`)

### "Port 3001 is already in use"
**Solução:** Feche outros processos Node.js ou mude a porta em `backend/server.js`

### QR Code não aparece
**Solução:** 
1. Pressione `Ctrl+C` para parar
2. Execute `npx expo start --clear` para limpar cache
3. Tente novamente

### App não carrega no celular
**Solução:**
1. Certifique-se de que **celular e computador estão na mesma rede WiFi**
2. Desabilite VPN se estiver usando
3. Tente usar `npx expo start --tunnel`

---

## 🎯 Checklist Rápido

- [ ] Terminal 1: Backend rodando (`npm start` na pasta `backend`)
- [ ] Terminal 2: Expo rodando (`npx expo start` na pasta `frontend`)
- [ ] Expo Go instalado no celular
- [ ] QR Code escaneado
- [ ] App carregado no celular
- [ ] Teste de login funcionando

---

## 🔄 Para Parar o Projeto

1. **Terminal 1 (Backend):** Pressione `Ctrl+C`
2. **Terminal 2 (Frontend):** Pressione `Ctrl+C`

---

## 📞 Precisa de Ajuda?

Consulte os arquivos:
- `README.md` - Documentação completa
- `documentacao/FIREBASE_SETUP.md` - Configuração do Firebase
- `FIREBASE_REGRAS_FIRESTORE.md` - Configurar regras de segurança
- `backend/README.md` - Documentação do backend

---

**Boa sorte! 🎉**
