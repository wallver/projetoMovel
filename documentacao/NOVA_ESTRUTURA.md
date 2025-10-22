# Nova Estrutura do App - Reorganização Completa

## Visão Geral

O app foi completamente reorganizado para oferecer uma melhor experiência ao usuário. Agora, após o login, o usuário acessa um dashboard inicial, e as informações pessoais são acessadas através de telas separadas.

---

## Estrutura de Telas

### 1. **Login** (`app/(tabs)/index.tsx`)
- Tela inicial do app
- Login, cadastro e recuperação de senha
- **Após login:** Navega para `/dashboard`

### 2. **Dashboard** (`app/dashboard.tsx`) - NOVO!
- Tela principal após login
- Mostra boas-vindas ao usuário
- Cards de funcionalidades futuras
- **Avatar no canto superior direito** com dropdown

### 3. **Perfil** (`app/profile.tsx`) - NOVO!
- Tela dedicada às informações do usuário
- Avatar grande + nome + email
- Informações pessoais detalhadas
- Estatísticas (futuras)
- **Acesso:** Dashboard → Avatar → Meu Perfil

### 4. **Configurações** (`app/settings.tsx`) - REFORMULADO!
- Menu organizado por seções
- **Botão "Alterar Informações"** em destaque
- Outras opções: Notificações, Aparência, Idioma, etc
- **Acesso:** Dashboard → Avatar → Configurações

### 5. **Alterar Informações** (`app/edit-info.tsx`) - NOVO!
- Tela para alterar senha
- Formulário completo com validações
- Dicas de segurança
- Espaço para futuras edições (nome, email, foto)
- **Acesso:** Configurações → Alterar Informações

---

## Fluxo de Navegação

```
┌─────────────┐
│   Login     │
└──────┬──────┘
       │ Login bem-sucedido
       ↓
┌─────────────┐
│  Dashboard  │ ← Tela principal
└──────┬──────┘
       │ Click no Avatar (👤)
       ↓
┌─────────────────────┐
│  Dropdown:          │
│  • Meu Perfil       │
│  • Configurações    │
│  • Sair             │
└──────┬──────────────┘
       │
       ├─→ Meu Perfil
       │   ↓
       │   ┌─────────────┐
       │   │   Perfil    │
       │   └─────────────┘
       │
       └─→ Configurações
           ↓
           ┌───────────────────┐
           │  Configurações    │
           └────────┬──────────┘
                    │ Click em "Alterar Informações"
                    ↓
           ┌───────────────────┐
           │ Alterar Info      │
           │ • Mudar Senha     │
           │ • Outros (futuro) │
           └───────────────────┘
```

---

## Comparação: Antes vs Depois

### ANTES (Estrutura Antiga):
```
Login → Home (já mostrava perfil completo)
         └─→ Configurações (só para mudar senha)
```

**Problemas:**
- ❌ Mostrava tudo de uma vez
- ❌ Informações do perfil misturadas com dashboard
- ❌ Falta de organização

### DEPOIS (Nova Estrutura):
```
Login → Dashboard (tela inicial limpa)
         └─→ Avatar Dropdown
              ├─→ Perfil (informações pessoais)
              ├─→ Configurações (opções do app)
              │    └─→ Alterar Informações (edições)
              └─→ Sair
```

**Vantagens:**
- ✅ Tela inicial limpa e focada
- ✅ Informações organizadas por contexto
- ✅ Navegação intuitiva
- ✅ Espaço para crescimento

---

## Detalhes de Cada Tela

### 1. Dashboard

**Propósito:** Tela inicial do app após login

**Elementos:**
- Header com título "Início" e avatar
- Mensagem de boas-vindas personalizada
- Grid de cards para funcionalidades futuras:
  - Lembretes
  - Tarefas
  - Agenda
  - Relatórios

**Dropdown do Avatar:**
```
┌──────────────────┐
│ 👤 Meu Perfil    │
│ ⚙️ Configurações │
│ ─────────────────│
│ 🚪 Sair          │
└──────────────────┘
```

---

### 2. Perfil

**Propósito:** Mostrar informações detalhadas do usuário

**Seções:**
1. **Header Visual**
   - Avatar grande (100px)
   - Nome do usuário
   - Email

2. **Informações Pessoais**
   - Nome de usuário (com ícone)
   - Email (com ícone)
   - Membro desde (data de cadastro)
   - ID do usuário

3. **Estatísticas** (futuras)
   - Lembretes ativos
   - Tarefas concluídas
   - Tarefas pendentes

**Visual:**
```
┌─────────────────────────┐
│  ←  Meu Perfil          │
├─────────────────────────┤
│                         │
│       👤 (grande)       │
│     Nome Usuario        │
│    email@email.com      │
│                         │
├─────────────────────────┤
│ Informações Pessoais    │
│                         │
│ 👤 Nome: Usuario        │
│ ✉️ Email: email.com     │
│ 📅 Membro: 22/10/2025   │
│ 🔑 ID: abc123...        │
│                         │
├─────────────────────────┤
│ Estatísticas            │
│                         │
│  🔔 0   ✅ 0   ⏰ 0     │
│ Lemb  Concl  Pend       │
└─────────────────────────┘
```

---

### 3. Configurações

**Propósito:** Central de configurações e opções do app

**Seções:**

#### A. Conta
- **Alterar Informações** ⭐
  - Descrição: "Senha, email e outros dados"
  - Leva para `/edit-info`
- Excluir Conta (futuro)

#### B. Preferências
- Notificações (futuro)
- Aparência (tema claro/escuro) (futuro)
- Idioma (futuro)

#### C. Sobre
- Versão do App (1.0.0)
- Termos de Uso (futuro)
- Ajuda e Suporte (futuro)

**Visual:**
```
┌─────────────────────────┐
│  ←  Configurações       │
├─────────────────────────┤
│                         │
│ CONTA                   │
│ ┌─────────────────────┐ │
│ │ ✏️ Alterar Info    →│ │ ← Principal!
│ │ Senha, email...     │ │
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │ 🗑️ Excluir Conta   →│ │
│ └─────────────────────┘ │
│                         │
│ PREFERÊNCIAS            │
│ ┌─────────────────────┐ │
│ │ 🔔 Notificações    →│ │
│ │ 🎨 Aparência       →│ │
│ │ 🌍 Idioma          →│ │
│ └─────────────────────┘ │
│                         │
│ SOBRE                   │
│ ┌─────────────────────┐ │
│ │ ℹ️ Versão 1.0.0     │ │
│ │ 📄 Termos de Uso   →│ │
│ │ ❓ Ajuda           →│ │
│ └─────────────────────┘ │
└─────────────────────────┘
```

---

### 4. Alterar Informações

**Propósito:** Permitir edição de dados do usuário

**Seções:**

#### A. Alterar Senha
- Campo: Senha Atual (com mostrar/ocultar)
- Campo: Nova Senha (com mostrar/ocultar)
- Campo: Confirmar Nova Senha (com mostrar/ocultar)
- Box de dicas de segurança
- Botão: "Salvar Alterações"

#### B. Outras Informações (futuro)
- Editar nome
- Editar email
- Alterar foto de perfil

**Visual:**
```
┌─────────────────────────┐
│  ←  Alterar Informações │
├─────────────────────────┤
│                         │
│ 🔒 ALTERAR SENHA        │
│ Por segurança, você...  │
│                         │
│ Senha Atual             │
│ ┌─────────────────┐     │
│ │ ••••••••    👁  │     │
│ └─────────────────┘     │
│                         │
│ Nova Senha              │
│ ┌─────────────────┐     │
│ │ ••••••••    👁  │     │
│ └─────────────────┘     │
│                         │
│ Confirmar Senha         │
│ ┌─────────────────┐     │
│ │ ••••••••    👁  │     │
│ └─────────────────┘     │
│                         │
│ ┌───────────────────┐   │
│ │ 🛡️ Dicas:        │   │
│ │ • 6+ caracteres   │   │
│ │ • Letras e núm... │   │
│ └───────────────────┘   │
│                         │
│ ┌───────────────────┐   │
│ │ ✅ Salvar Alter.  │   │
│ └───────────────────┘   │
│                         │
│ ℹ️ OUTRAS INFORMAÇÕES   │
│ Em breve você poderá... │
└─────────────────────────┘
```

---

## Arquivos Criados/Modificados

### ✨ CRIADOS:
1. `frontend/app/dashboard.tsx` - Tela inicial pós-login
2. `frontend/app/profile.tsx` - Tela de perfil do usuário
3. `frontend/app/edit-info.tsx` - Tela de alteração de informações
4. `documentacao/NOVA_ESTRUTURA.md` - Esta documentação

### 🔧 MODIFICADOS:
1. `frontend/app/settings.tsx` - Reorganizado com menu estruturado
2. `frontend/app/(tabs)/index.tsx` - Navega para `/dashboard`
3. `frontend/app/_layout.tsx` - Novas rotas adicionadas

### 🗑️ REMOVIDOS:
1. `frontend/app/home.tsx` - Substituído por `dashboard.tsx`

---

## Rotas Configuradas

No `_layout.tsx`:
```typescript
<Stack>
  <Stack.Screen name="(tabs)" />          // Login
  <Stack.Screen name="dashboard" />       // Dashboard
  <Stack.Screen name="profile" />         // Perfil
  <Stack.Screen name="settings" />        // Configurações
  <Stack.Screen name="edit-info" />       // Alterar Informações
</Stack>
```

---

## Como Testar

### Fluxo Completo:

```bash
# 1. Inicie o Expo
cd frontend
npx expo start --clear
```

### 2. Teste o Dashboard:
1. Faça login
2. ✅ Deve ir para tela "Início" (Dashboard)
3. ✅ Veja cards de funcionalidades
4. ✅ Clique no avatar (canto superior direito)
5. ✅ Dropdown deve aparecer

### 3. Teste o Perfil:
1. No dropdown, clique em "Meu Perfil"
2. ✅ Deve mostrar avatar grande
3. ✅ Deve mostrar nome e email
4. ✅ Deve mostrar informações completas
5. ✅ Deve ter estatísticas
6. ✅ Botão voltar funciona

### 4. Teste Configurações:
1. Dashboard → Avatar → Configurações
2. ✅ Deve mostrar menu organizado
3. ✅ Seções: Conta, Preferências, Sobre
4. ✅ Botão "Alterar Informações" visível

### 5. Teste Alterar Senha:
1. Configurações → Alterar Informações
2. ✅ Formulário de senha aparece
3. ✅ Preencha os campos
4. ✅ Teste validações
5. ✅ Altere a senha
6. ✅ Deve voltar para Configurações

---

## Benefícios da Nova Estrutura

### 1. Organização Clara
- ✅ Cada tela tem um propósito específico
- ✅ Informações separadas por contexto
- ✅ Fácil de encontrar o que precisa

### 2. Escalabilidade
- ✅ Fácil adicionar novas funcionalidades
- ✅ Cards do dashboard podem virar telas reais
- ✅ Menu de configurações pode crescer

### 3. UX Melhorada
- ✅ Dashboard limpo ao entrar
- ✅ Navegação intuitiva
- ✅ Informações quando necessárias

### 4. Padrões Modernos
- ✅ Segue padrões de apps modernos
- ✅ Dropdown de avatar é comum
- ✅ Configurações organizadas por seções

---

## Próximos Passos (Sugestões)

### 1. Funcionalidades do Dashboard
- Implementar Lembretes
- Implementar Tarefas
- Implementar Agenda
- Implementar Relatórios

### 2. Perfil
- Upload de foto
- Editar nome
- Editar bio/descrição
- Conquistas/badges

### 3. Configurações
- Tema claro/escuro
- Notificações push
- Backup de dados
- Exportar dados

### 4. Alterar Informações
- Alterar email (com verificação)
- Alterar nome de usuário
- Alterar foto de perfil
- Conectar redes sociais

---

## Documentação Relacionada

- `COMO_RODAR.md` - Como executar o projeto
- `FIREBASE_SETUP.md` - Configuração do Firebase
- `ALTERAR_SENHA.md` - Detalhes sobre alteração de senha
- `TELA_HOME.md` - (Descontinuado - ver NOVA_ESTRUTURA.md)

---

## Resumo Visual Completo

```
APP REORGANIZADO:

Login
  ↓
Dashboard (Início)
  ├─→ Avatar Dropdown
  │   ├─→ Meu Perfil
  │   │   └─→ Ver informações completas
  │   │
  │   ├─→ Configurações
  │   │   ├─→ Alterar Informações
  │   │   │   └─→ Mudar Senha ✅
  │   │   │   └─→ Outros (futuro)
  │   │   │
  │   │   ├─→ Notificações (futuro)
  │   │   ├─→ Aparência (futuro)
  │   │   └─→ Outros...
  │   │
  │   └─→ Sair → Volta para Login
  │
  └─→ Cards de Funcionalidades (futuro)
      ├─→ Lembretes
      ├─→ Tarefas
      ├─→ Agenda
      └─→ Relatórios
```

---

**Estrutura completa e organizada! 🎉**

O app agora está preparado para crescer de forma escalável e intuitiva!
