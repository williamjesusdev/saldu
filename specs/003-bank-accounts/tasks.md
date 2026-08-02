# Tasks: Bank Accounts

**Input**: Design documents from `/specs/003-bank-accounts/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api.md, quickstart.md

**Tests**: TDD approach is mandatory. Tests MUST be written before implementation (Red -> Green -> Refactor).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)

## Path Conventions
- **Backend**: `apps/api/src/main/java/com/saldu/...`, `apps/api/src/test/java/com/saldu/...`
- **Frontend**: `apps/web/src/...`, `apps/web/tests/...`
- **E2E**: `tests/e2e/tests/...`
- **DB Migrations**: `apps/api/src/main/resources/db/migration/...`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 [P] Setup backend account module directories in apps/api/src/main/java/com/saldu/domain/account/, apps/api/src/main/java/com/saldu/application/account/, and apps/api/src/main/java/com/saldu/presentation/account/
- [ ] T002 [P] Setup frontend account module directories in apps/web/src/app/(app)/accounts/ and apps/web/src/components/accounts/

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T003 Create Flyway migration for `Account` entity with RLS policy and all fields in apps/api/src/main/resources/db/migration/V003__Create_Accounts_Schema.sql
- [ ] T004 Create base `Account` entity mapped to JPA with UUID and all metadata fields in apps/api/src/main/java/com/saldu/domain/account/Account.java
- [ ] T005 Create `AccountType` enum for JPA mapping in apps/api/src/main/java/com/saldu/domain/account/AccountType.java

**Checkpoint**: Foundation ready - user story implementation can now begin.

---

## Phase 3: User Story 1 - Criar Conta Bancária (Priority: P1) 🎯 MVP

**Goal**: O usuário deseja cadastrar uma nova conta bancária no sistema, informando o nome, instituição financeira, tipo da conta, saldo inicial e limite extra.

**Independent Test**: Pode ser testado validando a criação da conta, isolamento de tenant e que reflete todos os limites e flags no BD.

### Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation (Red -> Green -> Refactor)**

- [ ] T006 [P] [US1] Write integration test (Testcontainers) for Account creation endpoint ensuring RLS and correct field persistence in apps/api/src/test/java/com/saldu/presentation/account/AccountCreateIntegrationTest.java
- [ ] T007 [P] [US1] Write frontend unit tests (Jest) for Account creation form validation in apps/web/tests/unit/accounts/CreateAccount.test.tsx
- [ ] T008 [P] [US1] Write E2E Playwright test for Account creation flow in tests/e2e/tests/accounts/create-account.spec.ts

### Implementation for User Story 1

- [ ] T009 [P] [US1] Create `AccountRepository` interface extending JpaRepository in apps/api/src/main/java/com/saldu/domain/account/AccountRepository.java
- [ ] T010 [US1] Implement `AccountService` (create logic validating user subscription) in apps/api/src/main/java/com/saldu/application/account/AccountService.java
- [ ] T011 [US1] Implement `POST /api/v1/accounts` endpoint in apps/api/src/main/java/com/saldu/presentation/account/AccountController.java
- [ ] T012 [P] [US1] Implement Next.js Create Account form UI with inputs for limit, flags, and institution in apps/web/src/components/accounts/CreateAccountForm.tsx
- [ ] T013 [US1] Implement Next.js Create Account Page mapping API calls in apps/web/src/app/(app)/accounts/new/page.tsx

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently.

---

## Phase 4: User Story 2 - Visualizar Lista e Detalhes de Contas (Priority: P1)

**Goal**: O usuário deseja visualizar todas as suas contas bancárias cadastradas, exibindo saldos, logos e limites (no detalhe).

**Independent Test**: Pode ser testado listando as contas isoladas do tenant, sem somar limite extra ao saldo principal.

### Tests for User Story 2 ⚠️

- [ ] T014 [P] [US2] Write integration test for listing accounts and filtering deleted ones in apps/api/src/test/java/com/saldu/presentation/account/AccountListIntegrationTest.java
- [ ] T015 [P] [US2] Write frontend unit tests (Jest) for Account List and Details UI in apps/web/tests/unit/accounts/ListAccounts.test.tsx

### Implementation for User Story 2

- [ ] T016 [US2] Implement list accounts logic in `AccountService` in apps/api/src/main/java/com/saldu/application/account/AccountService.java
- [ ] T017 [US2] Implement `GET /api/v1/accounts` endpoint in apps/api/src/main/java/com/saldu/presentation/account/AccountController.java
- [ ] T018 [P] [US2] Add bank logos (SVG) to apps/web/public/banks/ (NUBANK.svg, BB.svg, OTHER.svg)
- [ ] T019 [US2] Implement Next.js Account List UI displaying balances and logos in apps/web/src/components/accounts/AccountList.tsx
- [ ] T020 [US2] Implement Next.js Accounts Page (Dashboard integration) in apps/web/src/app/(app)/accounts/page.tsx
- [ ] T021 [US2] Implement Next.js Account Details UI showing credit limits separately in apps/web/src/app/(app)/accounts/[id]/page.tsx

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently.

---

## Phase 5: User Story 3 - Editar e Arquivar Conta Bancária (Priority: P2)

**Goal**: O usuário deseja alterar detalhes de uma conta ou arquivá-la (exclusão lógica).

**Independent Test**: Editar conta atualiza BD e arquivar preenche `deleted_at` em vez de apagar a linha.

### Tests for User Story 3 ⚠️

- [ ] T022 [P] [US3] Write integration test for Update and Archive ensuring `deleted_at` logic in apps/api/src/test/java/com/saldu/presentation/account/AccountUpdateArchiveIntegrationTest.java
- [ ] T023 [P] [US3] Write E2E Playwright test for editing and archiving flow in tests/e2e/tests/accounts/edit-archive-account.spec.ts

### Implementation for User Story 3

- [ ] T024 [US3] Implement update and soft-delete logic in `AccountService` in apps/api/src/main/java/com/saldu/application/account/AccountService.java
- [ ] T025 [US3] Implement `PUT /api/v1/accounts/{id}` and `DELETE /api/v1/accounts/{id}` endpoints in apps/api/src/main/java/com/saldu/presentation/account/AccountController.java
- [ ] T026 [P] [US3] Implement Edit form component in apps/web/src/components/accounts/EditAccountForm.tsx
- [ ] T027 [US3] Implement Next.js Edit Account Page in apps/web/src/app/(app)/accounts/[id]/edit/page.tsx
- [ ] T028 [US3] Add Archive button and action in Account Details/List UI in apps/web/src/components/accounts/AccountList.tsx

**Checkpoint**: All user stories should now be independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T029 [P] Run global quality gate check `npm run quality-gate:ci` and `./mvnw spotless:apply`
- [ ] T030 Validate scenarios described in `quickstart.md`
- [ ] T031 Final code cleanup and E2E flakiness check

---

## Dependencies & Execution Order

- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories.
- **US1 & US2 (Phase 3 and 4)**: Can start after Foundational. Define the core paths for accounts.
- **US3 (Phase 5)**: Depends on US1 (to have accounts to edit/archive).
- **Polish (Final Phase)**: Depends on all user stories being complete.
