# Quickstart: Autenticação e Gestão de Acesso

**Feature**: 002-user-auth
**Date**: 2026-07-26

## Pré-requisitos

- Docker + Docker Compose rodando (PostgreSQL 16)
- Backend Spring Boot rodando (porta 8080 em `apps/api/`)
- Frontend Next.js rodando (porta 3000 em `apps/web/`)

## Cenários de Validação (via cURL)

> **Nota**: Todas as respostas de erro neste projeto seguem o padrão **RFC 9457 (Problem Details)**, traduzidas via i18n (`Accept-Language`).

### 1. Geração de Convite (Admin)

**Teste**:
```bash
# Gerar convite
curl -X POST http://localhost:8080/api/v1/admin/invites \
  -H "Authorization: Bearer <admin-token>" \
  -H "Content-Type: application/json"
```

*Expected Outcome*:
- Status 201 Created
- Response: `{"token": "...", "expiresAt": "..."}`

---

### 2. Aceite de Convite e Criação de Conta

**Teste**:
```bash
# Aceitar convite
curl -X POST http://localhost:8080/api/v1/auth/invite/accept \
  -H "Content-Type: application/json" \
  -d '{"token": "<invite-token>", "name": "Teste", "email": "teste@email.com", "password": "SenhaSegura123"}'
```

*Expected Outcome*:
- Status 201 Created
- Response: `{"id": "...", "name": "Teste", "email": "teste@email.com"}`

---

### 3. Login com Credenciais Válidas

**Teste**:
```bash
# Fazer login
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "teste@email.com", "password": "SenhaSegura123"}'
```

*Expected Outcome*:
- Status 200 OK
- Response contém `tokenType` ("Bearer"), `token` e `expiresIn`

---

### 4. Login com Credenciais Inválidas

**Teste**:
```bash
# Senha incorreta
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "teste@email.com", "password": "SenhaErrada"}'
```

*Expected Outcome*:
- Status 401 Unauthorized
- Response (RFC 9457): `{"type": "about:blank", "title": "...", "status": 401, "detail": "...", "instance": "/api/v1/auth/login"}`

---

### 5. Alteração de Senha

**Teste**:
```bash
# Alterar senha (usuário autenticado)
curl -X POST http://localhost:8080/api/v1/users/me/password \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"currentPassword": "SenhaSegura123", "newPassword": "NovaSenha456"}'
```

*Expected Outcome*:
- Status 200 OK
- Response: `{"message": "Senha atualizada com sucesso"}`

---

### 6. Rate Limiting no Login

**Teste**:
```bash
# Fazer 6 tentativas de login com senha errada
for i in {1..6}; do
  curl -X POST http://localhost:8080/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email": "teste@email.com", "password": "SenhaErrada"}'
done
```

*Expected Outcome*:
- 5 primeiras tentativas: 401 Unauthorized
- 6ª tentativa: 429 Too Many Requests (Erro RFC 9457)

---

### 7. Acesso Negado para Não-Admin

**Teste**:
```bash
# Tentar gerar convite sendo usuário normal
curl -X POST http://localhost:8080/api/v1/admin/invites \
  -H "Authorization: Bearer <user-token>" \
  -H "Content-Type: application/json"
```

*Expected Outcome*:
- Status 403 Forbidden
- Response (RFC 9457 indicando falta de permissão)

---

### 8. Isolamento Multi-Tenant

**Teste**:
```bash
# Usuário do Tenant A tenta acessar dados do Tenant B manipulando a requisição
# (Saldu garante via ThreadLocal e RLS no banco que apenas os dados do 'subscription_id' próprio apareçam)
curl -X GET http://localhost:8080/api/v1/users/me \
  -H "Authorization: Bearer <tenant-a-token>"
```

*Expected Outcome*:
- O banco restringe qualquer query a `subscription_id = JWT.subscription_id`
- Retorno restrito apenas aos dados do próprio tenant, cross-tenant falha (404 ou lista vazia)

---

## Comandos de Validação Interna

### Backend

```bash
cd apps/api

# Rodar validações (formatação e lint)
./mvnw spotless:apply clean validate

# Rodar testes
./mvnw test

# Build
./mvnw clean package -DskipTests
```

### Frontend

```bash
cd apps/web

# Rodar validações
npm run format
npm run lint

# Rodar testes
npm run test
```

### E2E (Playwright)

```bash
cd tests/e2e

# Rodar testes
npx playwright test
```

### Database

```bash
# Verificar tabelas e RLS no Postgres via Testcontainers ou ambiente local
docker compose exec db psql -U saldu -d saldu_db -c "\d+ users"
```

## Checklist de Validação E2E (QA)

- [ ] Isolamento RLS e JWT testado via Playwright
- [ ] Formulário de Login valida credenciais corretamente
- [ ] Alteração de senha atualiza Argon2 e desloga de sessões ativas (opcional MVP)
- [ ] Admin Dashboard exibe aba para gerar convite e link copiado com sucesso
- [ ] Convite rejeitado se expirado (após 7 dias) ou já usado
- [ ] Rate limiting testado (bloqueio após 5 tentativas)
- [ ] Respostas de erro exibem mensagens traduzidas no Frontend baseado no RFC 9457
