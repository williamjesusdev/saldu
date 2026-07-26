# Data Model: Autenticação e Gestão de Acesso

## Entities

### `Subscription`
- `id`: UUID (Primary Key)
- `plan`: VARCHAR (ex: 'FREE', 'PRO')
- `created_at`: TIMESTAMP
- `deleted_at`: TIMESTAMP (Nullable)

### `User`
- `id`: UUID (Primary Key)
- `subscription_id`: UUID (Foreign Key -> Subscription.id) - Define o tenant com Row-Level Security
- `email`: VARCHAR (Unique)
- `password_hash`: VARCHAR
- `name`: VARCHAR
- `role`: VARCHAR (ex: 'USER', 'PLATFORM_ADMIN')
- `consent_given_at`: TIMESTAMP (Nullable)
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP (Nullable)
- `deleted_at`: TIMESTAMP (Nullable)

### `InviteToken`
- `id`: UUID (Primary Key)
- `token`: VARCHAR (Unique)
- `email`: VARCHAR (Nullable)
- `created_by`: UUID (Foreign Key -> User.id)
- `used_by`: UUID (Foreign Key -> User.id, Nullable)
- `expires_at`: TIMESTAMP
- `created_at`: TIMESTAMP
- `used_at`: TIMESTAMP (Nullable)

### `AccessRequest`
- `id`: UUID (Primary Key)
- `email`: VARCHAR
- `name`: VARCHAR
- `status`: VARCHAR ('PENDING', 'APPROVED', 'REJECTED')
- `reviewed_by`: UUID (Foreign Key -> User.id, Nullable)
- `created_at`: TIMESTAMP
- `reviewed_at`: TIMESTAMP (Nullable)

### `PasswordResetToken`
- `id`: UUID (Primary Key)
- `token`: VARCHAR (Unique)
- `user_id`: UUID (Foreign Key -> User.id)
- `expires_at`: TIMESTAMP
- `used_at`: TIMESTAMP (Nullable)
- `created_at`: TIMESTAMP

## Relationships
- `User` pertence a uma `Subscription`.
- `InviteToken` é criado por um `User` (Admin).
- `InviteToken` é utilizado por um `User`.
- `AccessRequest` pode ser revisado por um `User` (Admin).
- `PasswordResetToken` está vinculado a um `User`.

## State Transitions
- **InviteToken**: Não utilizado -> Utilizado (quando `used_at` é preenchido), Expirado (quando `expires_at` está no passado).
- **AccessRequest**: PENDENTE -> APROVADO | REJEITADO.
- **PasswordResetToken**: Não utilizado -> Utilizado (quando `used_at` é preenchido), Expirado (quando `expires_at` está no passado).

## Validation Rules
- Senhas devem ter pelo menos 8 caracteres, 1 letra maiúscula, 1 número.
- `InviteToken` expira em 7 dias.
- `PasswordResetToken` expira em prazo curto (ex: 1 a 2 horas).
