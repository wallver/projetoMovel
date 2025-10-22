# 🔧 Backend - API de Autenticação
API REST para autenticação de usuários.

## 🚀 Como Rodar

### 1. Instalar Dependências:
```bash
npm install
```

### 2. Iniciar Servidor:
```bash
npm start
```

ou

```bash
npm run dev
```

O servidor irá iniciar na **porta 3001**.

---

## 📡 Endpoints Disponíveis

### Health Check
```http
GET /api/health
```

**Resposta:**
```json
{
  "status": "OK",
  "message": "Backend funcionando!",
  "timestamp": "2025-10-22T15:00:00.000Z",
  "port": 3001
}
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "teste",
  "password": "1234"
}
```

**Resposta (Sucesso):**
```json
{
  "success": true,
  "message": "Login bem-sucedido!",
  "user": {
    "id": 1,
    "username": "teste",
    "email": "teste@teste.com"
  }
}
```

### Cadastro
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "novousuario",
  "email": "novo@email.com",
  "password": "senha123"
}
```

**Resposta (Sucesso):**
```json
{
  "success": true,
  "message": "Usuário cadastrado com sucesso!",
  "user": {
    "id": 2,
    "username": "novousuario",
    "email": "novo@email.com"
  }
}
```

### Recuperação de Senha
```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "teste@teste.com"
}
```

**Resposta:**
```json
{
  "success": true,
  "message": "E-mail de recuperação enviado para teste@teste.com (simulação)"
}
```

---

## 🗂️ Estrutura de Arquivos

```
backend/
├── server-simple.js    # Servidor principal (simplificado)
├── package.json        # Dependências e scripts
├── config.env          # Configurações de ambiente
└── README.md          # Esta documentação
```

---

## 🔒 Segurança

⚠️ **ATENÇÃO:** Este é um servidor de **desenvolvimento/demonstração**.

**Para produção, implemente:**
- Hash de senhas (bcrypt)
- JWT para autenticação
- Validação de inputs
- Rate limiting
- HTTPS
- Banco de dados real
- Variáveis de ambiente seguras

---

## 🧪 Testando a API

### Usando curl:
```bash
# Health Check
curl http://localhost:3001/api/health

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"teste","password":"1234"}'
```

### Usando Postman:
1. Importe a coleção de endpoints
2. Configure a URL base: `http://localhost:3001`
3. Teste os endpoints

---

## 📦 Dependências

```json
{
  "express": "^5.1.0",
  "cors": "^2.8.5",
  "dotenv": "^17.2.3"
}
```

---

## 🔧 Configuração

O servidor usa **CORS aberto** para desenvolvimento.  
Para produção, configure origens específicas em `server-simple.js`:

```javascript
app.use(cors({
  origin: 'https://seudominio.com',
  credentials: true
}));
```

---

## 📝 Notas

- Dados armazenados **em memória** (serão perdidos ao reiniciar)
- Usuário padrão: `teste` / senha: `1234`
- Porta padrão: `3001`
- CORS configurado para aceitar todas as origens.