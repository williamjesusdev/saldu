# API Contracts: Auth

## Overview

Este documento define os contratos da API de Autenticação e Gestão de Acesso, especificando estruturas de requisição, retornos esperados e padronização de erros.

## Headers de Isolamento por Subscription

Todos os endpoints autenticados extraem `subscription_id` do JWT. O sistema garante isolamento via:
1. JWT claim `subscription_id`
2. Hibernate filter `WHERE subscription_id = ?`
3. Row-Level Security no Postgres

## Rate Limiting

- **Login e Reset de Senha**: 5 tentativas/min por IP

---

## Internacionalização (i18n)

Todas as mensagens de texto retornadas pela API (sucesso ou erro) devem suportar internacionalização. O idioma será resolvido dinamicamente com base no header HTTP **`Accept-Language`** (ex: `pt-BR`, `en-US`). O Spring Boot utilizará um `MessageSource` centralizado para traduzir os campos legíveis (`title`, `detail`, `message`) antes de enviá-los ao cliente.

---

## Error Responses (Padrão RFC 9457)

Todos os endpoints (sem exceção) seguem o formato Problem Details (RFC 9457) em caso de erro:

**Content-Type**: `application/problem+json`

```json
{
  "type": "about:blank",
  "title": "Invalid credentials", // Localizado via i18n
  "status": 401,
  "detail": "As credenciais informadas são inválidas ou o cadastro está pendente.", // Localizado via i18n
  "instance": "/api/v1/auth/login",
  "errors": [] // Opcional, usado para erros de validação (400)
}
```

---

## Endpoints

### `POST /api/v1/auth/login`
- **Request**: `{ "email": "...", "password": "..." }`
- **Response (200 OK)**: `{ "tokenType": "Bearer", "token": "...", "expiresIn": 3600 }`
- **Response (401 Unauthorized)**: Erro RFC 9457 (Credenciais inválidas / Aprovação pendente).
- **Response (429 Too Many Requests)**: Erro RFC 9457 (Rate limit excedido).

### `POST /api/v1/auth/register`
- **Request**: `{ "name": "...", "email": "...", "password": "..." }`
- **Response (201 Created)**: `{ "requestId": "...", "email": "...", "status": "pending" }`
- **Response (400 Bad Request)**: Erro RFC 9457 (E-mail inválido / Senha fraca).
- **Response (409 Conflict)**: Erro RFC 9457 (Registro pendente para o e-mail).

### `POST /api/v1/auth/invite/accept`
- **Request**: `{ "name": "...", "email": "...", "password": "...", "token": "..." }`
- **Response (201 Created)**: `{ "id": "...", "name": "...", "email": "..." }`
- **Response (400 Bad Request)**: Erro RFC 9457 (Token inválido, Token expirado, E-mail já existe, Senha fraca).

### `POST /api/v1/admin/register/{requestId}/approval`
- **Headers**: `Authorization: Bearer <admin_token>`
- **Response (200 OK)**: `{ "id": "...", "name": "...", "email": "..." }`
- **Response (400 Bad Request)**: Erro RFC 9457 (requestId inválido).
- **Response (403 Forbidden)**: Erro RFC 9457 (Acesso restrito para admin).

### `POST /api/v1/admin/register/{requestId}/rejection`
- **Headers**: `Authorization: Bearer <admin_token>`
- **Request**: `{ "reason": "..." }`
- **Response (200 OK)**: `{ "message": "Registro rejeitado com sucesso" }` *(Localizado via i18n)*
- **Response (400 Bad Request)**: Erro RFC 9457 (requestId inválido).
- **Response (403 Forbidden)**: Erro RFC 9457 (Acesso restrito para admin).

### `POST /api/v1/admin/invites`
- **Headers**: `Authorization: Bearer <admin_token>`
- **Response (201 Created)**: `{ "token": "...", "expiresAt": "..." }`
- **Response (400 Bad Request)**: Erro RFC 9457 (E-mail inválido).
- **Response (403 Forbidden)**: Erro RFC 9457 (Acesso restrito para admin).

### `GET /api/v1/admin/invites`
- **Headers**: `Authorization: Bearer <admin_token>`
- **Query**:
  - `page`: filter by page `default: 0`
  - `size`: filter by page size `default: 20`
  - `status`: filter by status `pending`, `used`, `expired`
- **Response (200 OK)**: `{ "content": [ { "token": "...", "expiresAt": "..." } ], "page": { "size": 20, "number": 0, "totalElements": 1, "totalPages": 1 } }`
- **Response (403 Forbidden)**: Erro RFC 9457 (Acesso restrito para admin).

### `GET /api/v1/users/me`
- **Headers**: `Authorization: Bearer <token>`
- **Response (200 OK)**: `{ "id": "...", "name": "...", "email": "...", "hasConsented": true }`

### `POST /api/v1/users/me/password`
- **Headers**: `Authorization: Bearer <token>`
- **Request**: `{ "currentPassword": "...", "newPassword": "..." }`
- **Response (200 OK)**: `{ "message": "Senha atualizada com sucesso" }` *(Localizado via i18n)*
- **Response (400 Bad Request)**: Erro RFC 9457 (Senha atual inválida ou Senha fraca).

### `POST /api/v1/users/me/consent`
- **Headers**: `Authorization: Bearer <token>`
- **Response (204 No Content)**: Vazio.

### `DELETE /api/v1/users/me`
- **Headers**: `Authorization: Bearer <token>`
- **Response (204 No Content)**: Vazio.

### `POST /api/v1/auth/logout`
- **Headers**: `Authorization: Bearer <token>`
- **Response (204 No Content)**: Cookie `saldu-token` removido (maxAge 0) e token revogado no repositório.

### `POST /api/v1/auth/password/reset`
- **Request**: `{ "email": "..." }`
- **Response (200 OK)**: `{ "message": "E-mail de recuperação de senha enviado" }` *(Localizado via i18n)*
- **Response (400 Bad Request)**: Erro RFC 9457 (E-mail inválido).
- **Response (429 Too Many Requests)**: Erro RFC 9457 (Rate limit excedido).

### `POST /api/v1/auth/password/reset/verify`
- **Request**: `{ "email": "...", "token": "...", "password": "..." }`
- **Response (200 OK)**: `{ "message": "Senha resetada com sucesso" }` *(Localizado via i18n)*
- **Response (400 Bad Request)**: Erro RFC 9457 (Token inválido, Token expirado, Senha fraca).
- **Response (429 Too Many Requests)**: Erro RFC 9457 (Rate limit excedido).

### `GET /api/v1/_internal/e2e/password/reset/token` *(Profiles: test, e2e)*
- **Query**: `email`
- **Response (200 OK)**: `{ "token": "..." }`
- **Response (404 Not Found)**: Token ou usuário não localizado.

