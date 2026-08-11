# Tasks: Auth & Security Refactor

**Input**: Design documents from `/specs/004-auth-security-refactor/`

**Prerequisites**: plan.md, spec.md, research.md, contracts/api.md, quickstart.md

**Tests**: TDD approach is mandatory. Tests MUST be written before implementation (Red -> Green -> Refactor).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)

## Path Conventions
- **Backend**: `apps/api/src/main/java/com/saldu/...`, `apps/api/src/test/java/com/saldu/...`
- **Frontend**: `apps/web/src/...`, `apps/web/tests/...`
- **E2E**: `tests/e2e/tests/...`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

*(N/A - O projeto já está inicializado, não há dependências de setup infraestrutural para esta refatoração)*

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

*(N/A - As tarefas a seguir são independentes e não possuem bloqueadores fundamentais não atendidos)*

**Checkpoint**: Foundation ready - user story implementation can begin.

---

## Phase 3: User Story 1 - Extração de Componentes e Validação com Zod (Priority: P1) 🎯 MVP

**Goal**: O usuário deseja que as páginas de autenticação utilizem validação via Zod centralizadas em um componente reutilizável `AuthForm`.

**Independent Test**: Pode ser testado executando a suíte de testes de UI do frontend e verificando manualmente as validações locais sem requisição de rede.

### Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation (Red -> Green -> Refactor)**

- [ ] T001 [P] [US1] Write frontend unit tests (Jest) for AuthForm component and Zod schemas in apps/web/tests/unit/auth/AuthForm.test.tsx
- [ ] T002 [P] [US1] Write E2E Playwright test validating Zod error rendering on empty submits in tests/e2e/tests/auth/auth-validation.spec.ts

### Implementation for User Story 1

- [ ] T003 [P] [US1] Create centralized Zod schemas for login and register payloads in apps/web/src/schemas/auth.ts
- [ ] T004 [US1] Create the centralized UI component in apps/web/src/components/auth/AuthForm.tsx using the Zod schemas from T003
- [ ] T005 [P] [US1] Refactor login page to use AuthForm in apps/web/src/app/(app)/login/page.tsx
- [ ] T006 [P] [US1] Refactor register page to use AuthForm in apps/web/src/app/(app)/register/page.tsx

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently.

---

## Phase 4: User Story 2 - Ativação da Proteção CSRF (Priority: P1)

**Goal**: O usuário deseja que mutações de estado validem o token CSRF exposto via cookie legível e repassado via cabeçalho (Defense in Depth).

**Independent Test**: Pode ser testado via ferramenta de API HTTP (esperando 403 sem token) e validando no Network Tab que a aplicação web anexa o header.

### Tests for User Story 2 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation (Red -> Green -> Refactor)**

- [ ] T007 [P] [US2] Write integration test (Testcontainers) validating that POST requests without CSRF token return 403 Forbidden in apps/api/src/test/java/com/saldu/infrastructure/security/CsrfIntegrationTest.java
- [ ] T008 [P] [US2] Write frontend unit test (Jest) ensuring Axios interceptor appends X-XSRF-TOKEN in apps/web/tests/unit/lib/apiClient.test.ts
- [ ] T009 [P] [US2] Write E2E Playwright test validating full auth request loop with CSRF token in tests/e2e/tests/auth/csrf-protection.spec.ts

### Implementation for User Story 2

- [ ] T010 [P] [US2] Update Spring Security configuration to use CookieCsrfTokenRepository.withHttpOnlyFalse() in apps/api/src/main/java/com/saldu/infrastructure/security/SecurityConfig.java
- [ ] T011 [P] [US2] Implement CSRF interceptor logic in frontend HTTP client to read cookie and set header in apps/web/src/lib/apiClient.ts

**Checkpoint**: At this point, User Story 2 should be fully functional.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T012 [P] Run global quality gate check via `npm run quality-gate:ci` and ensure zero SonarQube alerts
- [ ] T013 Validate scenarios described in `quickstart.md` locally

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup & Foundational**: N/A
- **User Stories (Phase 3 & 4)**: Can start immediately in parallel since they touch completely different scopes (UI React vs Network/Security).
- **Polish (Final Phase)**: Depends on all desired user stories being complete.

### User Story Dependencies

- **User Story 1 (P1)**: Independent.
- **User Story 2 (P1)**: Independent.

### Parallel Opportunities

- All tests for US1 and US2 can be written in parallel.
- US1 UI Refactor and US2 Security Config can be implemented in parallel by different specialists.
