# Configuração do Firebase

## O que foi implementado

### Firebase Authentication
- Login com email e senha
- Cadastro de novos usuários
- **Recuperação de senha real por email**
- Logout
- Validação de credenciais

### Cloud Firestore
- Salvamento de dados dos usuários
- Armazenamento de informações adicionais (username, data de criação)

---

## Funcionalidades Implementadas

### 1. Cadastro de Usuários
- Cria usuário no Firebase Authentication
- Salva dados adicionais no Firestore
- Validação de email e senha
- Mensagens de erro personalizadas

### 2. Login
- Autentica usuário com Firebase
- Busca dados adicionais do Firestore
- Mantém sessão do usuário
- Validação de credenciais

### 3. Recuperação de Senha (REAL)
- **Envia email de recuperação através do Firebase**
- Email enviado automaticamente pelo Firebase
- Link seguro para redefinição
- Validação de email

### 4. Logout
- Encerra sessão do usuário
- Limpa dados locais

---

## Estrutura de Arquivos

```
frontend/
├── app/
│   ├── utils/
│   │   └── firebase.ts          # Configuração do Firebase
│   ├── services/
│   │   └── authService.ts       # Serviços de autenticação
│   └── (tabs)/
│       └── index.tsx             # Tela de login integrada
```

---

## Como Funciona

### Fluxo de Cadastro:
1. Usuário preenche nome, email e senha
2. Firebase cria conta de autenticação
3. Sistema salva dados adicionais no Firestore
4. Usuário pode fazer login

### Fluxo de Login:
1. Usuário informa email e senha
2. Firebase valida credenciais
3. Sistema busca dados do Firestore
4. Usuário é autenticado

### Fluxo de Recuperação de Senha:
1. Usuário informa email
2. **Firebase envia email automático com link**
3. Usuário clica no link recebido
4. Firebase permite redefinir senha
5. Usuário pode fazer login com nova senha

---

## Configuração do Firebase

### Projeto Firebase
- **Nome:** lembretecontas
- **ID:** lembretecontas
- **Authentication:** Habilitado (Email/Password)
- **Firestore:** Habilitado

### Regras de Segurança do Firestore

**IMPORTANTE:** Você precisa configurar as regras no Firebase Console!

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      // Permite criar usuário durante cadastro
      allow create: if request.auth != null;
      
      // Permite ler e atualizar apenas os próprios dados
      allow read, update: if request.auth != null && request.auth.uid == userId;
      
      // Não permite deletar
      allow delete: if false;
    }
  }
}
```

**Como configurar:** Veja o arquivo `FIREBASE_REGRAS_FIRESTORE.md` para instruções detalhadas.

---

## Testando

### 1. Cadastro
1. Abra o app
2. Clique em "Cadastrar"
3. Preencha: Nome, Email, Senha (min 6 caracteres)
4. Clique em "Cadastrar"
5. Aguarde confirmação

### 2. Login
1. Informe email e senha cadastrados
2. Clique em "Entrar"
3. Aguarde autenticação

### 3. Recuperação de Senha
1. Clique em "Esqueci minha senha"
2. Digite seu email
3. Clique em "Enviar"
4. **Verifique sua caixa de email** (e spam)
5. Clique no link recebido
6. Defina nova senha
7. Faça login com a nova senha

---

## Mensagens de Erro

### Cadastro
- "Este email já está em uso" - Email já cadastrado
- "A senha deve ter pelo menos 6 caracteres" - Senha fraca
- "Email inválido" - Formato de email incorreto

### Login
- "Email ou senha inválidos" - Credenciais incorretas
- "Credenciais inválidas" - Problema na autenticação

### Recuperação
- "Email não encontrado" - Email não cadastrado
- "Email inválido" - Formato incorreto

---

## Vantagens do Firebase

### Segurança
- Hash automático de senhas
- Proteção contra ataques
- SSL/TLS integrado
- Validação de tokens

### Escalabilidade
- Suporta milhões de usuários
- Infraestrutura do Google
- Alta disponibilidade

### Recursos
- Email de recuperação automático
- Gerenciamento de sessões
- Multi-plataforma (Web, iOS, Android)

---

## Próximas Melhorias

- [ ] Verificação de email após cadastro
- [ ] Login com Google
- [ ] Login com Facebook
- [ ] Autenticação de dois fatores (2FA)
- [ ] Perfil de usuário editável
- [ ] Upload de foto de perfil

---

## Documentação Oficial

- Firebase: https://firebase.google.com/docs
- Authentication: https://firebase.google.com/docs/auth
- Firestore: https://firebase.google.com/docs/firestore

---

**Integração completa com Firebase funcionando!**
