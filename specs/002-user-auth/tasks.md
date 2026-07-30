# Tasks: Autenticação e Gestão de Acesso

**Input**: Design documents from `/specs/002-user-auth/`

**Prerequisites**: plan.md, spec.md, data-model.md, contracts/api.md, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story. Segue a regra rigorosa de TDD do Saldu (Red -> Green -> Refactor).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)

## Path Conventions
- **Backend**: `apps/api/src/main/java/...`, `apps/api/src/test/java/...`
- **Frontend**: `apps/web/src/...`, `apps/web/tests/...`
- **E2E**: `tests/e2e/tests/...`
- **DB Migrations**: `apps/api/src/main/resources/db/migration/...`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 [P] Setup backend auth module directories in apps/api/src/main/java/br/com/saldu/domain/user/
- [ ] T002 [P] Setup frontend auth module directories in apps/web/src/app/(auth)/

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Tests for Foundational Infra ⚠️
> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T003 [P] Write unit tests for RateLimitFilter logic in apps/api/src/test/java/br/com/saldu/infrastructure/filter/RateLimitFilterTest.java
- [ ] T004 [P] Write unit tests for SubscriptionContextFilter ThreadLocal isolation in apps/api/src/test/java/br/com/saldu/infrastructure/filter/SubscriptionContextFilterTest.java
- [ ] T005 [P] Write unit tests for GlobalExceptionHandler RFC 9457 formatting in apps/api/src/test/java/br/com/saldu/infrastructure/exception/GlobalExceptionHandlerTest.java

### Implementation for Foundational Infra

- [ ] T006 Create Flyway migration for `Subscription`, `User`, `InviteToken`, `AccessRequest` and `PasswordResetToken` entities with RLS in apps/api/src/main/resources/db/migration/V2__Create_Auth_Schema.sql
- [ ] T007 Setup Spring Security config, PasswordEncoder (Argon2) and JWT filter in apps/api/src/main/java/br/com/saldu/infrastructure/security/SecurityConfig.java
- [ ] T008 Implement Rate Limiting Filter for login/reset endpoints in apps/api/src/main/java/br/com/saldu/infrastructure/filter/RateLimitFilter.java
- [ ] T009 Implement ThreadLocal context filter to inject `subscription_id` from JWT in apps/api/src/main/java/br/com/saldu/infrastructure/filter/SubscriptionContextFilter.java
- [ ] T010 [P] Create base `User` and `Subscription` entities mapped to JPA in apps/api/src/main/java/br/com/saldu/domain/user/User.java
- [ ] T011 [P] Implement generic i18n for RFC 9457 error responses in apps/api/src/main/java/br/com/saldu/infrastructure/exception/GlobalExceptionHandler.java

---

## Phase 3: User Story 1 - Cadastro e Isolamento (Priority: P1) 🎯 MVP

**Goal**: Permitir cadastro via token de convite ou lista de espera (sem token).

**Independent Test**: Usuário recebe subscription única no DB.

### Tests for User Story 1 ⚠️

- [ ] T012 [P] [US1] Write integration test (Testcontainers) for register endpoints in apps/api/src/test/java/br/com/saldu/presentation/auth/RegisterIntegrationTest.java
- [ ] T013 [P] [US1] Write frontend unit tests (Jest) for Registration and Consent forms in apps/web/tests/unit/auth/Register.test.tsx
- [ ] T014 [P] [US1] Write E2E Playwright test for Registration flow in tests/e2e/tests/auth/register.spec.ts

### Implementation for User Story 1

- [ ] T015 [P] [US1] Create `AccessRequest` entity and Repository in apps/api/src/main/java/br/com/saldu/domain/user/AccessRequest.java
- [ ] T016 [US1] Implement `RegisterService` with token logic vs pending logic in apps/api/src/main/java/br/com/saldu/application/auth/RegisterService.java
- [ ] T017 [US1] Implement `POST /api/v1/auth/register` and `POST /api/v1/auth/invite/accept` in apps/api/src/main/java/br/com/saldu/presentation/auth/AuthController.java
- [ ] T018 [US1] Implement Next.js Register Page and API calls in apps/web/src/app/(auth)/register/page.tsx
- [ ] T019 [US1] Implement `POST /api/v1/users/me/consent` endpoint in apps/api/src/main/java/br/com/saldu/presentation/auth/UserController.java
- [ ] T020 [US1] Implement Next.js Consent Screen UI in apps/web/src/app/(auth)/consent/page.tsx

---

## Phase 4: User Story 2 - Login e Recuperação/Alteração de Senha (Priority: P1)

**Goal**: Usuário consegue acessar a conta, alterar a senha e resetar.

**Independent Test**: Login gera JWT válido e recuperações de senha funcionam.

### Tests for User Story 2 ⚠️

- [ ] T021 [P] [US2] Write integration test for Login/Password change/Reset in apps/api/src/test/java/br/com/saldu/presentation/auth/AuthLoginIntegrationTest.java
- [ ] T022 [P] [US2] Write frontend unit tests (Jest) for Login and Password Reset forms in apps/web/tests/unit/auth/Login.test.tsx
- [ ] T023 [P] [US2] Write E2E Playwright test for Login and Password Reset flow in tests/e2e/tests/auth/login.spec.ts

### Implementation for User Story 2

- [ ] T024 [P] [US2] Create `PasswordResetToken` entity and Repository in apps/api/src/main/java/br/com/saldu/domain/user/PasswordResetToken.java
- [ ] T025 [US2] Implement `AuthService` (login, issue JWT) in apps/api/src/main/java/br/com/saldu/application/auth/AuthService.java
- [ ] T026 [US2] Implement `PasswordService` (change, reset, verify token) in apps/api/src/main/java/br/com/saldu/application/auth/PasswordService.java
- [ ] T027 [US2] Implement `POST /api/v1/auth/login`, `POST /api/v1/auth/password/reset` and `/reset/verify` in apps/api/src/main/java/br/com/saldu/presentation/auth/AuthController.java
- [ ] T028 [US2] Implement `POST /api/v1/users/me/password` in apps/api/src/main/java/br/com/saldu/presentation/auth/UserController.java
- [ ] T029 [P] [US2] Implement Next.js Login form in apps/web/src/app/(auth)/login/page.tsx
- [ ] T030 [P] [US2] Implement Next.js Forgot/Reset password pages in apps/web/src/app/(auth)/forgot-password/page.tsx

---

## Phase 5: User Story 3 - Gestão de Acesso Admin (Priority: P2)

**Goal**: Admin aprova cadastros ou gera links de convite diretos.

**Independent Test**: Token gerado por admin funciona no registro.

### Tests for User Story 3 ⚠️

- [ ] T031 [P] [US3] Write integration test for Admin endpoints in apps/api/src/test/java/br/com/saldu/presentation/admin/AdminIntegrationTest.java
- [ ] T032 [P] [US3] Write frontend unit tests (Jest) for Admin Dashboard UI in apps/web/tests/unit/admin/Dashboard.test.tsx
- [ ] T033 [P] [US3] Write E2E Playwright test for Admin Dashboard in tests/e2e/tests/admin/dashboard.spec.ts

### Implementation for User Story 3

- [ ] T034 [P] [US3] Create `InviteToken` entity and Repository in apps/api/src/main/java/br/com/saldu/domain/user/InviteToken.java
- [ ] T035 [US3] Implement `AdminInviteService` (gerar, listar, aprovar/rejeitar request) in apps/api/src/main/java/br/com/saldu/application/admin/AdminInviteService.java
- [ ] T036 [US3] Implement `POST/GET /api/v1/admin/invites`, `POST /api/v1/admin/register/{requestId}/approval/rejection` in apps/api/src/main/java/br/com/saldu/presentation/admin/AdminController.java
- [ ] T037 [US3] Implement Next.js Admin Dashboard Invites UI in apps/web/src/app/admin/invites/page.tsx

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T038 [P] Run linting and quality checks as CI mock (npm run quality-gate:ci and ./mvnw spotless:apply)
- [ ] T039 Validate checklists in quickstart.md
- [ ] T040 Update CHANGELOG.md

---

## Dependencies & Execution Order

- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **US1 & US2 (Phase 3 and 4)**: Can start in parallel after Foundational. They define the core auth paths.
- **US3 (Phase 5)**: Can start after US1/US2.
- **Polish (Final Phase)**: Depends on all desired user stories being complete
