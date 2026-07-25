# Agent Context: Saldu (Living Document)

This is a dynamic, living document intended for all AI agents working on the Saldu Monorepo. 
Agents MUST consult and update this file as the project evolves to maintain architectural consistency.

## 1. Project Context
Saldu is a Multi-Tenant Personal Financial Management (PFM) system built for the web.

## 2. Dependency Decision Table
*Agents must update this table whenever a new major dependency is added or evaluated.*

| Layer / BC | Dependency | Version | Decision Context | Status |
|---|---|---|---|---|
| Backend | Spring Boot | 4.1.0 | Official framework for robust API and IoC | Approved |
| Backend | Java | 25 | Latest LTS | Approved |
| Backend | Flyway | - | Schema migration (enforces RLS) | Approved |
| DB | PostgreSQL | 16 | Relational store with RLS support | Approved |
| Frontend | Next.js | 16 | App Router for modern React delivery | Approved |
| Frontend | Tailwind CSS | 4 | Styling standard | Approved |
| Frontend | TanStack Query | v5 | Server state management | Approved |
| Tests (Integration) | Testcontainers | - | Replaces H2. Uses real Postgres image | Approved |

## 3. Absolute Rules
- **Multi-Tenant (RLS):** All data tables MUST have `subscription_id` and Row-Level Security policies.
- **Single-Entry MVP:** Balance is dynamically calculated based on `settledAt` transactions.
- **No Negative Transactions:** Use `type` (INCOME/EXPENSE) and `refundForId` for absolute values.
- **Just-in-Time Invoices:** Invoices are not persisted state-machines, they are dynamically computed based on `paidAt` and `closingDate`.
- **No Silent Deletes:** Use soft deletes (`deleted_at`) for financial tables. NEVER execute `DELETE FROM`.

## 4. Agent Tooling Rules
- **Formatting:** Backend uses `./mvnw spotless:apply`. Frontend uses `npm run format`.
- **Linting:** Backend uses Maven plugins. Frontend uses `npm run lint`.
- **Tests:** TDD is mandatory. Tests must validate side-effects in the database, not just API responses.

## 5. Architecture & Layer Dependencies
Strict Dependency Rule: Outer layers can depend on inner layers, never the reverse.

| Layer | Path | Allowed Imports | Forbidden Imports |
|---|---|---|---|
| Domain | `domain/{context}/` | Java Standard Library | `application/`, `infrastructure/`, `presentation/` |
| Application | `application/{context}/` | `domain/` | `infrastructure/`, `presentation/` |
| Infrastructure | `infrastructure/` | `domain/`, `application/` | `presentation/` |
| Presentation | `presentation/` | `application/`, `domain/` | `infrastructure/` |

## 6. Bounded Context Map
*Update this map when introducing new entities.*

| Bounded Context | Aggregate Root | Known Entities |
|---|---|---|
| User | User | InviteToken, AccessRequest |
| Account | Account | - |
| CreditCard | CreditCard | Invoice (Computed), Installment |
| Transaction | Transaction | Category (System/Shared) |
| Transfer | Transfer | - |

## 7. Dynamic E2E Rules
- E2E tests are driven by Playwright.
- Acceptance criteria must validate end-to-end functionality via the UI interacting with the real backend and Testcontainer DB.
