# Feature Specification: Bank Accounts

**Feature Branch**: `003-bank-accounts`

**Created**: 2026-08-01

**Status**: Draft

**Input**: User description: "Gestão de Contas Bancárias (Bank Accounts)"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Criar Conta Bancária (Priority: P1)

O usuário deseja cadastrar uma nova conta bancária no sistema, informando o nome, instituição financeira (ex: Nubank, Banco do Brasil, Outros), tipo da conta, saldo inicial e limite extra (cheque especial, limite da conta). Ele também pode marcar flags para ignorar a conta nos totais ou marcá-la como conta de investimento.

**Why this priority**: É a funcionalidade base para que existam transações e transferências no sistema. Sem contas, não há movimentação financeira.

**Independent Test**: Pode ser testado independentemente validando que a conta foi criada, associada corretamente ao `subscription_id` do usuário logado, e reflete o saldo inicial, limite e instituição no banco de dados.

**Acceptance Scenarios**:

1. **Given** um usuário logado na plataforma, **When** ele preenche o formulário de nova conta com nome "Nubank", instituição "Nubank", saldo "100.00" e limite "500.00", **Then** o sistema cria a conta e exibe uma mensagem de sucesso.
2. **Given** um usuário logado, **When** ele tenta criar uma conta sem nome, **Then** o sistema exibe um erro de validação.

---

### User Story 2 - Visualizar Lista e Detalhes de Contas (Priority: P1)

O usuário deseja visualizar todas as suas contas bancárias cadastradas, juntamente com o saldo atual. O limite extra NÃO deve ser somado ao saldo total do dashboard, mas deve ser exibido nos detalhes da conta. As contas também exibem os logotipos das instituições vinculadas.

**Why this priority**: O usuário precisa enxergar onde seu dinheiro está alocado e verificar rapidamente os saldos.

**Independent Test**: Pode ser testado listando as contas criadas pelo próprio usuário (isolamento de tenant) e garantindo que o limite extra e as flags são retornados.

**Acceptance Scenarios**:

1. **Given** o usuário tem contas cadastradas, **When** ele acessa o painel de contas, **Then** ele vê uma lista com as contas, seus respectivos saldos e logos.
2. **Given** que o usuário clica para ver os detalhes da conta, **When** a tela de detalhes é aberta, **Then** o limite extra é exibido separadamente do saldo.

---

### User Story 3 - Editar e Arquivar Conta Bancária (Priority: P2)

O usuário deseja alterar os detalhes (nome, tipo, instituição, limite, flags) de uma conta existente, ou arquivá-la (exclusão lógica) caso não a utilize mais.

**Why this priority**: Importante para a manutenção do cadastro. Arquivar é vital pois, pela Constituição do Saldu, não realizamos hard deletes (exclusão física).

**Independent Test**: Pode ser testado alterando um nome de conta ou chamando o endpoint de exclusão, verificando se a flag `deleted_at` foi preenchida em vez de o registro ser deletado (No Silent Deletes).

**Acceptance Scenarios**:

1. **Given** uma conta existente, **When** o usuário altera a instituição para "Banco do Brasil", **Then** a conta é atualizada no sistema.
2. **Given** uma conta existente, **When** o usuário solicita a exclusão da conta, **Then** a conta é marcada como arquivada/deletada logicamente.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST permitir a criação de contas bancárias associadas à Subscription (Tenant).
- **FR-002**: System MUST garantir isolamento de dados por `subscription_id`.
- **FR-003**: System MUST permitir vinculação com uma Instituição (com opção default 'Outros').
- **FR-004**: System MUST permitir categorizar a conta por tipo (e.g., CHECKING, SAVINGS, INVESTMENT).
- **FR-005**: System MUST capturar o `initial_balance` e o `credit_limit` separadamente. O limite de crédito (cheque especial) não deve compor o saldo no dashboard.
- **FR-006**: System MUST armazenar duas flags booleanas: `ignore_in_totals` e `investment_account`.
- **FR-007**: System MUST implementar arquivamento (soft-delete) via coluna `deleted_at`.

### Key Entities *(include if feature involves data)*

- **Account**: Entidade que representa uma conta bancária. Atributos: `id`, `subscription_id`, `name`, `institution` (Enum/String), `type`, `initial_balance`, `credit_limit`, `ignore_in_totals`, `investment_account`, `created_at`, `updated_at`, `deleted_at`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Usuários conseguem cadastrar uma conta bancária em menos de 1 minuto.
- **SC-002**: O sistema previne 100% de exclusões físicas (hard deletes) na tabela de contas.
- **SC-003**: O isolamento de tenant (RLS) assegura que nenhum usuário acessa contas alheias.

## Assumptions

- A validação se o `credit_limit` compõe saldos ou não é primariamente uma regra de apresentação e cálculo do Frontend/Backend para o dashboard. O banco armazena o valor bruto separadamente.
- A instituição financeira será um campo de chave (String), e os arquivos de imagem/logos (`.svg`/`.png`) residirão no frontend (`apps/web/public/banks/`).
