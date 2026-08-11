# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed

- **Tests**: Fixed `RateLimitFilterTest` to correctly reference `nodeEnvironment` instead of `nodeEnv` via reflection.

### Added

#### Bank Accounts Management (`003-bank-accounts`)

- **Database & RLS**: Created Flyway migration `V003__Create_Accounts_Schema.sql` with `accounts` schema, PostgreSQL Row-Level Security policy (`account_isolation_policy`), and trigger `trg_prevent_accounts_hard_delete` preventing physical hard deletes.
- **Domain Model**: Created `Account` entity, `AccountType` enum (`CHECKING`, `SAVINGS`, `INVESTMENT`, `CASH`, `OTHER`), and `AccountRepository` interface.
- **Service Layer**: Implemented `AccountService` for creating, listing, updating, and soft deleting accounts with tenant isolation via `SubscriptionContextHolder`.
- **REST Controller**: Implemented `AccountController` exposed at `/api/v1/accounts` with endpoints for creation, detailed viewing, updating, and soft deletion (`DELETE /api/v1/accounts/{id}`).
- **Validation**: Added `@PositiveOrZero` constraints on `initialBalance` and `creditLimit` DTOs.
- **Frontend UI**: Created Next.js pages `/accounts`, `/accounts/new`, `/accounts/[id]`, and `/accounts/[id]/edit` with custom components (`AccountList`, `CreateAccountForm`, `EditAccountForm`).
- **Bank Logos**: Added SVG assets for financial institutions (`NUBANK.svg`, `BB.svg`, `OTHER.svg`).
- **Integration Tests**: Implemented Testcontainers-based Spring Boot tests (`AccountCreateIntegrationTest`, `AccountListIntegrationTest`, `AccountUpdateArchiveIntegrationTest`).
- **Web Unit Tests**: Created Vitest unit test suites for all account components and Next.js pages.
- **E2E Tests**: Created Playwright end-to-end test specs for account creation, listing, details view, and soft-delete/archiving workflows.

#### Authentication & Access Management (`002-user-auth`)

- **Auth**: Implemented email/password authentication with JWT token issuance.
- **Registration**: Implemented user registration via invite token or waiting list (admin approval flow).
- **Password Management**: Implemented authenticated password change and anonymous password reset with expirable tokens.
- **LGPD Consent**: Implemented consent screen with timestamp recording on user entity (`consent_given_at`).
- **Admin Dashboard**: Implemented admin UI for generating invite tokens and approving/rejecting access requests.
- **Multi-Tenant Isolation**: Implemented `subscription_id` on `users` table with PostgreSQL Row-Level Security (RLS).
- **Tenant Propagation**: Implemented JWT claim → `SubscriptionContextHolder` (ThreadLocal) → Hibernate filter chain.
- **Password Security**: Implemented Argon2 password hashing via Spring Security `PasswordEncoder`.
- **Rate Limiting**: Implemented custom sliding-window rate-limiting filter (5 req/min) for login and password reset endpoints.
- **Error Handling**: Implemented RFC 9457 (`ProblemDetail`) compliant global error handler with i18n support.
- **Audit**: Implemented centralized `AuditService` interface with SLF4J-based implementation for login audit logging (extensible for future DB storage per FR-015).
- **Migration**: Created Flyway migration `V002__Create_Auth_Schema.sql` with tables: `subscriptions`, `users`, `invite_tokens`, `access_requests`, `password_reset_tokens`.
- **Domain**: Created rich domain entities: `User` (create, updatePassword, recordConsent, softDelete), `Subscription`, `InviteToken`, `AccessRequest`, `PasswordResetToken`.
- **Services**: Created application services: `AuthService`, `RegisterService`, `PasswordService`, `AdminInviteService`.
- **Controllers**: Created REST controllers: `AuthController`, `UserController`, `AdminController`.
- **Frontend Pages**: Created Next.js pages: Login, Register, Consent, Forgot Password, Admin Invites Dashboard.
- **Integration Tests**: Created Testcontainers-based tests: `AuthRegisterIntegrationTest`, `AuthLoginIntegrationTest`, `AuthPasswordIntegrationTest`, `UserIntegrationTest`, `AdminIntegrationTest`.
- **E2E Tests**: Created Playwright specs: register, login, password-reset, admin dashboard flows.
- **Admin Seed**: Implemented CommandLineRunner to bootstrap initial PLATFORM_ADMIN user.
- **Landing Page**: Implemented public landing page (/) with Saldu overview and CTAs to login/register.

#### Project Foundation (`001-project-foundation`)

- **Monorepo**: Initialized npm workspaces for `apps/api`, `apps/web`, and `tests/e2e`.
- **Backend**: Set up Spring Boot 4.1.0 with Java 25, PostgreSQL, Flyway, and Testcontainers.
- **Frontend**: Created Next.js 16 (App Router) project with TypeScript and Tailwind CSS 4.
- **E2E Tests**: Configured Playwright for automated UI testing.
- **Design Tokens**: Configured Tailwind CSS with custom design tokens for typography, colors, and dark mode support.
- **Infra**: Added local PostgreSQL database configuration via Docker Compose.
- **Scripts**: Unified npm scripts for building, cleaning, formatting, linting, and testing across the monorepo.
