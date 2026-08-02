# API Contracts: Bank Accounts

## `POST /api/v1/accounts`
Criar uma nova conta.

**Request Body**:
```json
{
  "name": "Minha Nuconta",
  "institution": "NUBANK",
  "type": "CHECKING",
  "initialBalance": 100.00,
  "creditLimit": 500.00,
  "ignoreInTotals": false,
  "isInvestmentAccount": false
}
```

**Response (201 Created)**:
```json
{
  "id": "uuid",
  "name": "Minha Nuconta",
  "institution": "NUBANK",
  "type": "CHECKING",
  "initialBalance": 100.00,
  "creditLimit": 500.00,
  "ignoreInTotals": false,
  "isInvestmentAccount": false,
  "createdAt": "2026-08-01T20:00:00Z"
}
```

## `GET /api/v1/accounts`
Listar todas as contas ativas do usuário. (As arquivadas são filtradas automaticamente).

**Response (200 OK)**:
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Minha Nuconta",
      "institution": "NUBANK",
      "type": "CHECKING",
      "initialBalance": 100.00,
      "creditLimit": 500.00,
      "ignoreInTotals": false,
      "isInvestmentAccount": false
    }
  ]
}
```

## `PUT /api/v1/accounts/{id}`
Atualizar dados de uma conta (exceto saldo inicial).

**Request Body**:
```json
{
  "name": "Minha Nuconta Principal",
  "institution": "NUBANK",
  "type": "CHECKING",
  "creditLimit": 1000.00,
  "ignoreInTotals": false,
  "isInvestmentAccount": false
}
```

**Response (200 OK)**:
```json
{
  "id": "uuid",
  "name": "Minha Nuconta Principal",
  "institution": "NUBANK",
  "type": "CHECKING",
  "initialBalance": 100.00,
  "creditLimit": 1000.00,
  "ignoreInTotals": false,
  "isInvestmentAccount": false
}
```

## `DELETE /api/v1/accounts/{id}`
Arquivar uma conta (Soft Delete).

**Response (204 No Content)**
