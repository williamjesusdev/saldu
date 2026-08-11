# Implementation Plan: Bank Accounts

**Branch**: `003-bank-accounts` | **Date**: 2026-08-01 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/003-bank-accounts/spec.md`

## Summary

Implementação do cadastro de Contas Bancárias (Bank Accounts), permitindo criar, listar, editar e arquivar (soft-delete) contas. Cada conta terá um nome, tipo e saldo inicial.

## Technical Context

**Language/Version**: Java 25 (Backend), TypeScript 5 (Frontend)

**Primary Dependencies**: Spring Boot 4.1.0, Next.js 16 (App Router), Tailwind CSS 4, TanStack Query v5

**Storage**: PostgreSQL 16 (com Flyway)

**Testing**: JUnit 5, Testcontainers, Jest, Playwright

**Target Platform**: Linux server, Web Browser (Desktop primary)

**Project Type**: Monorepo (Web App + REST API)

**Performance Goals**: <200ms p95 API response, instant UI updates via optimistic UI

**Constraints**: RLS required for multi-tenant, No hard deletes (soft delete only)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Correctness over Delivery Speed**: `initial_balance` is NUMERIC(15,2)
- [x] **Auditability**: `deleted_at` is used for soft delete. No `DELETE FROM` will be executed.
- [x] **Privacy by Design**: `subscription_id` is mandatory and protected by RLS.
- [x] **Single-Entry MVP**: Account acts as the base entity for future transactions.

## Project Structure

### Documentation (this feature)

```text
specs/003-bank-accounts/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
apps/api/
├── src/main/java/com/saldu/
│   ├── domain/account/
│   ├── application/account/
│   └── presentation/account/
└── src/test/java/com/saldu/...

apps/web/
├── src/app/(app)/accounts/
├── src/components/accounts/
└── tests/...

tests/e2e/
└── tests/accounts/
```

**Structure Decision**: Utilizando a estrutura de Monorepo (api + web + e2e) estabelecida pela fundação do Saldu.
