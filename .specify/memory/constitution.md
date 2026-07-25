# Saldu Constitution

## Core Principles

### I. Correctness over Delivery Speed
Financial correctness is the absolute priority. The calculated balance and invoice totals must ALWAYS match reality. Never sacrifice data integrity for faster delivery.

### II. Auditability (No Silent Deletes)
No transaction is ever silently deleted. Use explicit reversals or soft-deletes if necessary, but never wipe financial history. Manual corrections must be modeled as regular Transactions categorized as "Adjustments" requiring an explicit reason.

### III. Privacy by Design (LGPD)
Data isolation is paramount. Every user has a `subscription_id` and can only interact with their own data.

### IV. Web Responsive
Desktop is the primary use case (financial data precision). Mobile via browser is supported, but not mobile-first.

## Architecture & Tech Stack
- **Monorepo:** Managed via simple directory structure, root `package.json` (npm scripts with concurrently), and Docker Compose.
- **Backend:** Spring Boot 4.1.0 + Java 25 + Postgres (Built with Maven).
- **Frontend:** Next.js (App Router) + TypeScript + Tailwind + TanStack Query (Built with npm).

## Multi-Tenant Data Isolation Rules
- All domain tables must include a `subscription_id`.
- The backend enforces isolation via a ThreadLocal context populated from a JWT claim.
- The Postgres database enforces Row-Level Security (RLS) guaranteeing that `subscription_id = current_setting('app.subscription_id')`.
- **Shared Reference Data:** Tables like `Category` that hold system-wide defaults must allow `NULL` in `subscription_id`. 
  - `NULL` means the record is a global/system record (read-only for users).
  - RLS policies for these tables must be `(subscription_id = current_setting('app.subscription_id') OR subscription_id IS NULL)`.
  - Backend must block user-initiated updates/deletes on records where `subscription_id IS NULL`.

## Financial Modeling (MVP)
- **Single-Entry System:** For the MVP, we use a single-entry model. The account balance is calculated dynamically based only on transactions that have `settledAt` populated.
- **Transactions:** Transaction values are strictly absolute/positive. The `type` enum (`INCOME`/`EXPENSE`) determines the operation.
- **Reversals/Refunds:** Modeled as inbound transactions (`INCOME`) containing a `refundForId` reference to the original transaction. Never use negative values.
- **Invoices:** Follow Just-in-Time creation and Computed States based on `paidAt` and `closingDate`. No physical statuses are persisted.

## Engineering Standards
- **TDD:** Write tests before implementation (Red → Green → Refactor). Unit tests for financial calculations are mandatory. Integration tests against Postgres via Testcontainers.
- **Zero Warnings:** Build must compile with zero warnings. Linters must pass. Warnings are treated as bugs.
- **Atomic Commits:** One commit = one complete logical change. Use Conventional Commits (`feat:`, `fix:`, `test:`, `refactor:`).
- **Quality Gate:** Code must pass automated quality gates (JUnit/Playwright) and code review before being merged.

## Governance
The Saldu Constitution supersedes all other practices. `prd.md`, `design.md`, `refs/ddd-pragmatico.md` and `refs/setup-ambiente.md` are living documents. When architectural decisions change, update the docs first. All PRs/reviews must verify compliance with this constitution.

**Version**: 2.0.0 | **Ratified**: 2026-07-24 | **Last Amended**: 2026-07-24
