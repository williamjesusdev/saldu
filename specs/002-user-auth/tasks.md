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

- [x] T001 [P] Setup backend auth module directories in apps/api/src/main/java/com/saldu/domain/user/
- [x] T002 [P] Setup frontend auth module directories in apps/web/src/app/(auth)/

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Tests for Foundational Infra ⚠️
> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T003 [P] Write unit tests for RateLimitFilter logic in apps/api/src/test/java/com/saldu/infrastructure/filter/RateLimitFilterTest.java
- [x] T004 [P] Write unit tests for SubscriptionContextFilter ThreadLocal isolation in apps/api/src/test/java/com/saldu/infrastructure/filter/SubscriptionContextFilterTest.java
- [x] T005 [P] Write unit tests for GlobalExceptionHandler RFC 9457 formatting in apps/api/src/test/java/com/saldu/infrastructure/exception/GlobalExceptionHandlerTest.java

### Implementation for Foundational Infra

- [x] T006 Create Flyway migration for `Subscription`, `User`, `InviteToken`, `AccessRequest` and `PasswordResetToken` entities with RLS in apps/api/src/main/resources/db/migration/V002__Create_Auth_Schema.sql
- [x] T007 Setup Spring Security config, PasswordEncoder (Argon2) and JWT filter in apps/api/src/main/java/com/saldu/infrastructure/security/SecurityConfig.java
- [x] T008 Implement Rate Limiting Filter for login/reset endpoints in apps/api/src/main/java/com/saldu/infrastructure/filter/RateLimitFilter.java
- [x] T009 Implement ThreadLocal context filter to inject `subscription_id` from JWT in apps/api/src/main/java/com/saldu/infrastructure/filter/SubscriptionContextFilter.java
- [x] T010 [P] Create base `User` and `Subscription` entities mapped to JPA in apps/api/src/main/java/com/saldu/domain/user/User.java
- [x] T011 [P] Implement generic i18n for RFC 9457 error responses in apps/api/src/main/java/com/saldu/infrastructure/exception/GlobalExceptionHandler.java

---

## Phase 3: User Story 1 - Cadastro e Isolamento (Priority: P1) 🎯 MVP

**Goal**: Permitir cadastro via token de convite ou lista de espera (sem token).

**Independent Test**: Usuário recebe subscription única no DB.

### Tests for User Story 1 ⚠️

- [x] T012 [P] [US1] Write integration test (Testcontainers) for register endpoints in apps/api/src/test/java/com/saldu/presentation/auth/RegisterIntegrationTest.java
- [x] T013 [P] [US1] Write frontend unit tests (Jest) for Registration and Consent forms in apps/web/tests/unit/auth/Register.test.tsx
- [x] T014 [P] [US1] Write E2E Playwright test for Registration flow in tests/e2e/tests/auth/register.spec.ts

### Implementation for User Story 1

- [x] T015 [P] [US1] Create `AccessRequest` entity and Repository in apps/api/src/main/java/com/saldu/domain/user/AccessRequest.java
- [x] T016 [US1] Implement `RegisterService` with token logic vs pending logic in apps/api/src/main/java/com/saldu/application/auth/RegisterService.java
- [x] T017 [US1] Implement `POST /api/v1/auth/register` and `POST /api/v1/auth/invite/accept` in apps/api/src/main/java/com/saldu/presentation/auth/AuthController.java
- [x] T018 [US1] Implement Next.js Register Page and API calls in apps/web/src/app/(auth)/register/page.tsx
- [x] T019 [US1] Implement `POST /api/v1/users/me/consent` endpoint in apps/api/src/main/java/com/saldu/presentation/auth/UserController.java
- [x] T020 [US1] Implement Next.js Consent Screen UI in apps/web/src/app/(auth)/consent/page.tsx

---

## Phase 4: User Story 2 - Login e Recuperação/Alteração de Senha (Priority: P1)

**Goal**: Usuário consegue acessar a conta, alterar a senha e resetar.

**Independent Test**: Login gera JWT válido e recuperações de senha funcionam.

### Tests for User Story 2 ⚠️

- [x] T021 [P] [US2] Write integration test for Login/Password change/Reset in apps/api/src/test/java/com/saldu/presentation/auth/AuthLoginIntegrationTest.java
- [x] T022 [P] [US2] Write frontend unit tests (Jest) for Login and Password Reset forms in apps/web/tests/unit/auth/Login.test.tsx
- [x] T023 [P] [US2] Write E2E Playwright test for Login and Password Reset flow in tests/e2e/tests/auth/login.spec.ts

### Implementation for User Story 2

- [x] T024 [P] [US2] Create `PasswordResetToken` entity and Repository in apps/api/src/main/java/com/saldu/domain/user/PasswordResetToken.java
- [x] T025 [US2] Implement `AuthService` (login, issue JWT) in apps/api/src/main/java/com/saldu/application/auth/AuthService.java
- [x] T026 [US2] Implement `PasswordService` (change, reset, verify token) in apps/api/src/main/java/com/saldu/application/auth/PasswordService.java
- [x] T027 [US2] Implement `POST /api/v1/auth/login`, `POST /api/v1/auth/password/reset` and `/reset/verify` in apps/api/src/main/java/com/saldu/presentation/auth/AuthController.java
- [x] T028 [US2] Implement `POST /api/v1/users/me/password` in apps/api/src/main/java/com/saldu/presentation/auth/UserController.java
- [x] T029 [P] [US2] Implement Next.js Login form in apps/web/src/app/(auth)/login/page.tsx
- [x] T030 [P] [US2] Implement Next.js Forgot/Reset password pages in apps/web/src/app/(auth)/forgot-password/page.tsx

---

## Phase 5: User Story 3 - Gestão de Acesso Admin (Priority: P2)

**Goal**: Admin aprova cadastros ou gera links de convite diretos.

**Independent Test**: Token gerado por admin funciona no registro.

### Tests for User Story 3 ⚠️

- [x] T031 [P] [US3] Write integration test for Admin endpoints in apps/api/src/test/java/com/saldu/presentation/admin/AdminIntegrationTest.java
- [x] T032 [P] [US3] Write frontend unit tests (Jest) for Admin Dashboard UI in apps/web/tests/unit/admin/Dashboard.test.tsx
- [x] T033 [P] [US3] Write E2E Playwright test for Admin Dashboard in tests/e2e/tests/admin/dashboard.spec.ts

### Implementation for User Story 3

- [x] T034 [P] [US3] Create `InviteToken` entity and Repository in apps/api/src/main/java/com/saldu/domain/user/InviteToken.java
- [x] T035 [US3] Implement `AdminInviteService` (gerar, listar, aprovar/rejeitar request) in apps/api/src/main/java/com/saldu/application/admin/AdminInviteService.java
- [x] T036 [US3] Implement `POST/GET /api/v1/admin/invites`, `POST /api/v1/admin/register/{requestId}/approval/rejection` in apps/api/src/main/java/com/saldu/presentation/admin/AdminController.java
- [x] T037 [US3] Implement Next.js Admin Dashboard Invites UI in apps/web/src/app/admin/invites/page.tsx

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T038 [P] Run linting and quality checks as CI mock (npm run quality-gate:ci and ./mvnw spotless:apply)
- [x] T039 Validate checklists in quickstart.md
- [x] T040 Update CHANGELOG.md

---

## Dependencies & Execution Order

- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **US1 & US2 (Phase 3 and 4)**: Can start in parallel after Foundational. They define the core auth paths.
- **US3 (Phase 5)**: Can start after US1/US2.
- **Polish (Final Phase)**: Depends on all desired user stories being complete

---

## Phase 7: Convergence

- [x] T041 Implementar AuditService para log (console/stdout via SLF4J) de login (sucesso/falha) e preparo para DB per FR-012, FR-015 (missing)
- [x] T042 Create admin seed script (CommandLineRunner) to bootstrap the first PLATFORM_ADMIN user with a default subscription per spec.md Assumptions (missing)
- [x] T043 Implement public landing page in apps/web/src/app/page.tsx explaining what Saldu is, with CTAs to login (/login) and request access (/register) per spec.md US1 registration flow

---

## Phase 8: Refactoring and Security Adjustments (Post-Launch)

**Purpose**: Feedback from the user regarding hardcoded values, weak unit tests, and security E2E assertions.

### Backend Adjustments
- [x] T044 Extract `InviteToken` (7 days) and `PasswordResetToken` (2 hours) expirations to `application.yml` mapped to ENV vars (`SALDU_AUTH_INVITE_TOKEN_VALIDITY_DAYS` and `SALDU_AUTH_PASSWORD_RESET_TOKEN_VALIDITY_HOURS`). Update `AdminInviteService` and `PasswordService` to use `@Value`.
- [x] T051 Improve backend tests to achieve 100% coverage in the `application` layer (`AdminInviteService`, `PasswordService`, `RegisterService`, `UserService`).

### Frontend Test Adjustments
- [x] T045 Refactor `Register.test.tsx` using `userEvent` to test validation rules (empty submit), loading state, and successful submission behavior (mocking fetch).
- [x] T046 Refactor `Login.test.tsx` using `userEvent` to test validation rules, loading state, and successful login routing.
- [x] T047 Refactor `ForgotPassword.test.tsx` (if it exists) to test validation rules and success state.

### E2E Security Tests
- [x] T048 Verify and update existing E2E tests to ensure they cover redirects for unauthenticated access.
- [x] T049 Create `tests/e2e/tests/auth/security.spec.ts` to assert that anonymous users are redirected to `/login` when accessing `/admin/invites` and `/dashboard` (or similar protected routes).

### Frontend Error Handling Polish
- [x] T050 Refactor frontend error handling (Login, Register, ForgotPassword, AdminInvites) to rely strictly on API RFC 9457 `detail` property instead of hardcoded fallback strings, ensuring i18n messages from the backend are displayed.

---

## Phase 9: UI Consistency & Navigation

**Purpose**: Feedback from the user regarding missing global navigation (Header) and landing page design mismatch.

- [x] T052 Implement a global `Header` component in `apps/web/src/components/` and include it in `apps/web/src/app/layout.tsx` (or a dedicated grouping layout like `(app)`) to allow navigation between screens.
- [x] T053 Refactor the landing page (`apps/web/src/app/page.tsx`) to match the global application's aesthetic, typography (Inter/Spline Sans Mono), and color palette, ensuring consistency with the dashboard and authentication screens.

---

## Phase 10: Security Polish & Logout Flow

**Purpose**: Feedback from the user regarding the logout flow and a request to validate `SecurityConfig` against modern market standards.

- [x] T054 Backend: Review `SecurityConfig.java` against modern market standards (e.g., consider HttpOnly cookies vs LocalStorage, Token Blocklisting, or Refresh Tokens). Implement a secure `POST /api/v1/auth/logout` endpoint that properly invalidates the user session/token according to the chosen modern standard.
- [x] T055 Frontend: Implement the logout action in `Header.tsx` (and `AuthGuard` if necessary), calling the backend logout endpoint, clearing any client-side tokens/cookies, and securely redirecting the user to the landing page or login. Ensure comprehensive tests for the logout flow.
- [x] T056 Backend: Refactor AuthController and AuthService to address bad practices (hardcoded maxAge, inline imports, token extraction logic in controller). Moved token extraction to `JwtService` and injected `SalduProperties` for configurable expiration.
