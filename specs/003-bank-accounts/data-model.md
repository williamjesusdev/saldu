# Data Model: Bank Accounts

## Entities

### `Account`

Representa uma conta bancária ou destino financeiro de um usuário.

**Attributes**:
- `id`: `UUID` (Primary Key)
- `subscription_id`: `UUID` (Foreign Key, Not Null) -> Protected by RLS
- `name`: `VARCHAR(100)` (Not Null, ex: "Nubank Principal")
- `institution`: `VARCHAR(50)` (Not Null, Default 'OTHER') -> Identificador do banco (ex: NUBANK, BB, ITAU, OTHER)
- `type`: `VARCHAR(20)` (Not Null, Enum: CHECKING, SAVINGS, INVESTMENT)
- `initial_balance`: `NUMERIC(15,2)` (Not Null, Default 0.00)
- `credit_limit`: `NUMERIC(15,2)` (Not Null, Default 0.00) -> Limite extra (cheque especial, limite da conta)
- `ignore_in_totals`: `BOOLEAN` (Not Null, Default false) -> Se o saldo da conta deve ser ignorado na soma geral
- `investment_account`: `BOOLEAN` (Not Null, Default false) -> Flag explícita para marcar como investimento
- `created_at`: `TIMESTAMP WITH TIME ZONE` (Not Null)
- `updated_at`: `TIMESTAMP WITH TIME ZONE` (Not Null)
- `deleted_at`: `TIMESTAMP WITH TIME ZONE` (Nullable, for soft deletes)

## Validation Rules

- `name` deve ter no mínimo 2 e no máximo 100 caracteres.
- `type` deve ser um dos valores válidos do enum (CHECKING, SAVINGS, INVESTMENT).
- `institution` deve ser uma string identificadora (limite 50 chars).
- `initial_balance` e `credit_limit` não podem ser nulos, mas podem ser 0.

## Row-Level Security (RLS)

A tabela `accounts` deve ter a política ativada:
```sql
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY account_isolation_policy ON accounts
    USING (subscription_id = current_setting('app.subscription_id')::uuid);
```
