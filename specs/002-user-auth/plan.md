# Implementation Plan: Autenticação e Gestão de Acesso

**Branch**: `002-user-auth` | **Date**: 2026-07-26 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/002-user-auth/spec.md`

## Summary

Implementação de autenticação por e-mail e senha, controle de acesso via tokens de convite ou aprovação manual do admin, e isolamento de tenant (`subscription_id`). O backend será em Spring Boot e o frontend em Next.js.

## Technical Context

**Language/Version**: Backend: Java 25. Frontend: TypeScript.

**Primary Dependencies**: Spring Boot 4.1.0 (Backend), Next.js 16 (App Router), Tailwind CSS 4, TanStack Query v5 (Frontend).

**Storage**: PostgreSQL 16 com Flyway.

**Testing**: Backend: Testcontainers para DB (não H2). Frontend: Playwright para E2E.

**Target Platform**: Aplicação Web (Desktop primário, mobile via browser).

**Project Type**: Aplicação Web (Backend API + Frontend App).

**Performance Goals**: Tempo médio para criação e autenticação < 1 minuto.

**Constraints**: Isolamento obrigatório por RLS no Postgres, ThreadLocal no Java baseado no JWT claim `subscription_id`. Senhas com BCrypt ou Argon2.

**Scale/Scope**: Módulo inicial de base para multi-tenancy.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Correctness over Delivery Speed**: A lógica de auth deve ser correta e isolada, falhando seguro.
- [x] **Auditability (No Silent Deletes)**: Tabela de users e subscriptions não terão hard delete, apenas soft delete.
- [x] **Privacy by Design (LGPD)**: Todo dado tem `subscription_id` e RLS configurado. Consentimento explícito registrado.
- [x] **Multi-Tenant Data Isolation Rules**: JWT claim -> ThreadLocal -> Hibernate filter e RLS enforcement.
- [x] **Engineering Standards**: TDD e integração via Testcontainers, sem warnings, Playwright para testes.

## Project Structure

### Documentation (this feature)

```text
specs/002-user-auth/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── api.md
└── tasks.md
```

### Source Code (repository root)

```text
apps/
├── api/                   # Backend (Spring Boot)
│   ├── src/main/java/com/saldu/
│   │   ├── domain/user/
│   │   ├── application/auth/
│   │   ├── infrastructure/
│   │   └── presentation/
│   └── src/test/java/
├── web/                   # Frontend (Next.js)
│   └── src/
│       ├── app/(auth)/
│       └── components/
tests/
└── e2e/                   # E2E Tests (Playwright)
    └── tests/
```

**Structure Decision**: Utilização do monorepo definido na Fase 0, separando lógicas em `apps/api` (Backend), `apps/web` (Frontend) e `tests/e2e` (Testes ponta a ponta). O backend utiliza a abordagem de Bounded Context em camadas (Domain, Application, Infrastructure, Presentation).

## Complexity Tracking

> N/A
