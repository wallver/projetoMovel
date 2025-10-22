# Alterar Senha - Guia Completo

## Funcionalidade Implementada

O usuário logado agora pode alterar sua senha através da tela de Configurações.

---

## Como Funciona

### 1. Segurança
- O Firebase exige **re-autenticação** antes de permitir alteração de senha
- O usuário precisa **confirmar a senha atual** para alterar
- A nova senha deve ter **pelo menos 6 caracteres**
- A nova senha **deve ser diferente** da senha atual

### 2. Validações Implementadas
- Todos os campos obrigatórios
- Senha atual correta (verificada com Firebase)
- Nova senha com mínimo 6 caracteres
- Confirmação de senha deve coincidir
- Nova senha deve ser diferente da atual

---

## Como Usar

### Passo a Passo:

```
1. Faça login no app
   ↓
2. Na tela Home, clique no ícone de perfil (👤)
   ↓
3. No dropdown, clique em "Configurações" (⚙️)
   ↓
4. Você será levado para a tela de Configurações
   ↓
5. Preencha os campos:
   - Senha Atual
   - Nova Senha (mínimo 6 caracteres)
   - Confirmar Nova Senha
   ↓
6. Clique em "Alterar Senha"
   ↓
7. Se tudo estiver correto:
   ✅ Mensagem de sucesso
   ✅ Volta para a tela Home
   ✅ Senha alterada!
```

---

## Estrutura da Tela de Configurações

```
┌─────────────────────────────────────┐
│  ←  Configurações                   │  ← Header
├─────────────────────────────────────┤
│                                     │
│  Alterar Senha                      │
│  Por segurança, você precisará...   │
│                                     │
│  Senha Atual                        │
│  ┌─────────────────────────────┐   │
│  │ ••••••••••           👁      │   │  ← Mostrar/ocultar senha
│  └─────────────────────────────┘   │
│                                     │
│  Nova Senha                         │
│  ┌─────────────────────────────┐   │
│  │ ••••••••••           👁      │   │
│  └─────────────────────────────┘   │
│                                     │
│  Confirmar Nova Senha               │
│  ┌─────────────────────────────┐   │
│  │ ••••••••••           👁      │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Dicas de Segurança:         │   │
│  │ • Use pelo menos 6 car...   │   │
│  │ • Combine letras, núm...    │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │   🔒 Alterar Senha          │   │  ← Botão
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

---

## Recursos da Tela

### 1. Mostrar/Ocultar Senha
- Cada campo de senha tem um ícone de olho (👁)
- Clique para alternar entre mostrar e ocultar
- Facilita verificar se digitou corretamente

### 2. Dicas de Segurança
- Box azul com dicas úteis
- Ajuda o usuário a criar senhas fortes
- Sempre visível durante o preenchimento

### 3. Validações em Tempo Real
- Verifica se campos estão preenchidos
- Valida tamanho mínimo da senha
- Confirma se as senhas coincidem
- Verifica se a senha atual está correta

### 4. Feedback Visual
- Loading spinner durante processamento
- Mensagens de erro claras
- Confirmação de sucesso
- Desabilita campos durante carregamento

---

## Arquivos Criados/Modificados

### 1. `frontend/app/services/authService.ts` (MODIFICADO)
**Adicionado:**
- Imports: `updatePassword`, `reauthenticateWithCredential`, `EmailAuthProvider`
- Função `changePassword(currentPassword, newPassword)`

**Como funciona:**
```typescript
1. Verifica se o usuário está logado
2. Cria credencial com email + senha atual
3. Re-autentica o usuário (Firebase exige)
4. Se re-autenticação OK, atualiza a senha
5. Retorna sucesso ou erro específico
```

### 2. `frontend/app/settings.tsx` (NOVO)
**Tela completa de configurações com:**
- Header com botão voltar
- 3 campos de senha (atual, nova, confirmar)
- Botões de mostrar/ocultar senha
- Box com dicas de segurança
- Validações completas
- Loading state
- Navegação de volta após sucesso

### 3. `frontend/app/home.tsx` (MODIFICADO)
**Adicionado:**
- Botão "Configurações" no dropdown do perfil
- Navegação para `/settings`
- Fecha o dropdown ao navegar

### 4. `frontend/app/_layout.tsx` (MODIFICADO)
**Adicionado:**
- Rota `settings` no Stack Navigator
- `headerShown: false` para tela de settings

---

## Fluxo Técnico

### Processo de Alteração de Senha:

```
1. Usuário preenche formulário
   ↓
2. App valida campos localmente
   ↓
3. App chama changePassword(senhaAtual, novaSenha)
   ↓
4. authService cria credencial com email + senhaAtual
   ↓
5. Firebase re-autentica o usuário
   ├─ ❌ Senha incorreta → Retorna erro
   └─ ✅ Senha correta → Continua
        ↓
6. Firebase atualiza senha para novaSenha
   ├─ ❌ Senha fraca → Retorna erro
   └─ ✅ Senha OK → Sucesso!
        ↓
7. App mostra mensagem de sucesso
   ↓
8. App volta para Home
```

---

## Mensagens de Erro

### Possíveis erros e suas mensagens:

| Erro | Mensagem |
|------|----------|
| Campos vazios | "Preencha todos os campos" |
| Senha < 6 caracteres | "A nova senha deve ter pelo menos 6 caracteres" |
| Senhas não coincidem | "As senhas não coincidem" |
| Senha igual à atual | "A nova senha deve ser diferente da senha atual" |
| Senha atual incorreta | "Senha atual incorreta" |
| Senha fraca (Firebase) | "A nova senha deve ter pelo menos 6 caracteres" |
| Muitas tentativas | "Muitas tentativas. Tente novamente mais tarde" |
| Requer login recente | "Por segurança, faça login novamente antes de alterar a senha" |

---

## Segurança Implementada

### 1. Re-autenticação Obrigatória
- Antes de alterar senha, o Firebase **exige** que o usuário confirme a senha atual
- Isso evita que alguém com acesso ao celular desbloqueado altere a senha

### 2. Validação de Senha Forte
- Mínimo 6 caracteres (padrão Firebase)
- Dicas de segurança visíveis
- Incentivo para usar combinações complexas

### 3. Confirmação de Senha
- Campo "Confirmar Nova Senha" evita erros de digitação
- Validação antes de enviar ao Firebase

### 4. Proteção Contra Reutilização
- Verifica se a nova senha é diferente da atual
- Evita que o usuário mantenha a mesma senha

### 5. Rate Limiting
- Firebase limita tentativas de re-autenticação
- Proteção contra ataques de força bruta

---

## Testando a Funcionalidade

### Teste 1: Alteração Bem-Sucedida
```
1. Login com email/senha válidos
2. Home → Perfil → Configurações
3. Preencher:
   - Senha Atual: senha123
   - Nova Senha: novaSenha456
   - Confirmar: novaSenha456
4. Clicar "Alterar Senha"
✅ Deve mostrar: "Senha alterada com sucesso!"
✅ Deve voltar para Home
```

### Teste 2: Senha Atual Incorreta
```
1. Configurações
2. Preencher:
   - Senha Atual: senhaErrada
   - Nova Senha: novaSenha456
   - Confirmar: novaSenha456
3. Clicar "Alterar Senha"
❌ Deve mostrar: "Senha atual incorreta"
```

### Teste 3: Senhas Não Coincidem
```
1. Configurações
2. Preencher:
   - Senha Atual: senha123
   - Nova Senha: novaSenha456
   - Confirmar: senhadiferente
3. Clicar "Alterar Senha"
❌ Deve mostrar: "As senhas não coincidem"
```

### Teste 4: Senha Muito Curta
```
1. Configurações
2. Preencher:
   - Senha Atual: senha123
   - Nova Senha: 123
   - Confirmar: 123
3. Clicar "Alterar Senha"
❌ Deve mostrar: "A nova senha deve ter pelo menos 6 caracteres"
```

### Teste 5: Mostrar/Ocultar Senha
```
1. Configurações
2. Digitar algo em "Senha Atual"
3. Clicar no ícone de olho (👁)
✅ Deve mostrar a senha em texto claro
4. Clicar novamente
✅ Deve ocultar a senha (••••••)
```

---

## Problemas Comuns e Soluções

### 1. "Senha atual incorreta" mesmo estando correta
**Causa:** Pode estar com Caps Lock ligado ou espaços extras
**Solução:** 
- Use o botão de mostrar senha (👁) para verificar
- Digite novamente com cuidado

### 2. "Requer login recente"
**Causa:** Sessão muito antiga (segurança do Firebase)
**Solução:** 
- Faça logout
- Faça login novamente
- Tente alterar a senha novamente

### 3. Botão "Alterar Senha" não responde
**Causa:** Campos não preenchidos ou validação falhou
**Solução:** 
- Verifique se todos os campos estão preenchidos
- Veja se há mensagem de erro na tela

### 4. App trava ao alterar senha
**Causa:** Sem conexão com internet
**Solução:** 
- Verifique sua conexão
- Tente novamente

---

## Melhorias Futuras (Sugestões)

### 1. Requisitos de Senha Fortes
- Exigir pelo menos 1 número
- Exigir pelo menos 1 letra maiúscula
- Exigir pelo menos 1 caractere especial
- Indicador visual de força da senha

### 2. Histórico de Senhas
- Impedir reutilização das últimas N senhas
- Salvar hash das últimas senhas no Firestore

### 3. Notificação por Email
- Enviar email quando a senha for alterada
- Alertar sobre atividade suspeita

### 4. Autenticação de 2 Fatores
- Adicionar código via SMS ou app autenticador
- Camada extra de segurança

### 5. Expiração de Senha
- Forçar alteração de senha a cada X meses
- Boas práticas de segurança corporativa

---

## Resumo Técnico

### Tecnologias Utilizadas:
- **Firebase Authentication** - Re-autenticação e update de senha
- **React Native** - Interface
- **Expo Router** - Navegação
- **TypeScript** - Type safety
- **Ionicons** - Ícones

### Principais Funções:
- `changePassword()` - Altera senha com validações
- `reauthenticateWithCredential()` - Re-autentica usuário
- `updatePassword()` - Atualiza senha no Firebase

### Estado Gerenciado:
- `currentPassword` - Senha atual
- `newPassword` - Nova senha
- `confirmPassword` - Confirmação
- `loading` - Estado de carregamento
- `showPassword` × 3 - Visibilidade de cada campo

---

## Checklist de Implementação

- [x] Função `changePassword()` no authService
- [x] Tela de Configurações criada
- [x] Validação de campos
- [x] Re-autenticação com Firebase
- [x] Mostrar/ocultar senha
- [x] Dicas de segurança
- [x] Loading state
- [x] Mensagens de erro específicas
- [x] Navegação Home → Settings
- [x] Botão no dropdown do perfil
- [x] Rota configurada no _layout
- [x] Documentação completa
- [ ] **VOCÊ PRECISA:** Testar no app!

---

**Funcionalidade de alterar senha implementada com sucesso! 🔒**

Agora os usuários podem alterar suas senhas de forma segura através do app!
