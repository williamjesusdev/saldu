# 🤖 Agent Context: Saldu (Living Document)

> **⚠️ ATTENTION ALL AI AGENTS ⚠️**
> This is your primary brain context for the Saldu Monorepo. You **MUST** consult and update this file as the project evolves to maintain architectural consistency. Ignoring these rules will result in failed builds and rejected PRs.

---

## 📌 1. Project Context
Saldu is a **Multi-Tenant Personal Financial Management (PFM)** system built for the web. It operates in a monorepo structure.

- 🖥️ **Frontend:** `apps/web`
- ⚙️ **Backend:** `apps/api`
- 🧪 **E2E Tests:** `tests/e2e`

---

## 🛑 2. Absolute Commandments
These rules are non-negotiable.

1. 🏢 **Multi-Tenant (RLS):** All data tables **MUST** have a `subscription_id` column. Row-Level Security (RLS) policies are mandatory.
2. 🧮 **Single-Entry MVP:** Balances are dynamically calculated based on `settledAt` transactions. Do not persist balance snapshots.
3. ➕ **No Negative Transactions:** Use `type` (`INCOME`/`EXPENSE`) and `refundForId` for handling absolute values. No minus signs in the amount column.
4. 🧾 **Just-in-Time Invoices:** Invoices are dynamically computed based on `paidAt` and `closingDate`. They are **NOT** persisted state-machines.
5. 🛡️ **No Silent Deletes:** NEVER execute `DELETE FROM` on financial tables. You must use soft deletes (`deleted_at`).

---

## 📦 3. Dependency Decision Table
*Agents must update this table whenever a new major dependency is added or evaluated.*

| Layer / BC | Dependency | Version | Decision Context | Status |
|---|---|---|---|---|
| ⚙️ Backend | Spring Boot | 4.1.0 | Official framework for robust API and IoC | 🟢 Approved |
| ⚙️ Backend | Java | 25 | Latest LTS | 🟢 Approved |
| ⚙️ Backend | Flyway | - | Schema migration (enforces RLS) | 🟢 Approved |
| 🗄️ DB | PostgreSQL | 16 | Relational store with RLS support | 🟢 Approved |
| 🖥️ Frontend | Next.js | 16 | App Router for modern React delivery | 🟢 Approved |
| 🖥️ Frontend | Tailwind CSS | 4 | Styling standard | 🟢 Approved |
| 🖥️ Frontend | TanStack Query | v5 | Server state management | 🟢 Approved |
| 🧪 Tests | Testcontainers | - | Replaces H2. Uses real Postgres image | 🟢 Approved |

---

## 🏗️ 4. Architecture & Layer Dependencies
**Strict Dependency Rule:** Outer layers can depend on inner layers, *never* the reverse.

| Layer | Path | Allowed Imports | Forbidden Imports |
|---|---|---|---|
| **Domain** | `domain/{context}/` | Java Standard Lib | `application/`, `infrastructure/`, `presentation/` |
| **Application** | `application/{context}/` | `domain/` | `infrastructure/`, `presentation/` |
| **Infrastructure** | `infrastructure/` | `domain/`, `application/` | `presentation/` |
| **Presentation** | `presentation/` | `application/`, `domain/` | `infrastructure/` |

---

## 🗺️ 5. Bounded Context Map
*Update this map when introducing new entities.*

| Bounded Context | Aggregate Root | Known Entities |
|---|---|---|
| **User** | User | InviteToken, AccessRequest |
| **Account** | Account | - |
| **CreditCard** | CreditCard | Invoice (Computed), Installment |
| **Transaction** | Transaction | Category (System/Shared) |
| **Transfer** | Transfer | - |

---

## 🛠️ 6. Agent Tooling Rules
- **Formatting:** Run `npm run format:all` from the root.
- **Linting:** Run `npm run lint:all` from the root.
- **Tests (TDD is MANDATORY):** 
  - Run `npm run test:all` from the root.
  - Tests must validate side-effects in the database, not just mock API responses.

---

## 🎭 7. Dynamic E2E Rules
- E2E tests are driven by **Playwright**.
- Acceptance criteria must validate end-to-end functionality via the UI interacting with the real backend and Testcontainer DB.

---
*End of Agent Instructions. Proceed with your tasks effectively.*
