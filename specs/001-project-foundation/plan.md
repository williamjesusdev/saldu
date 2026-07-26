# Implementation Plan: Fase 0 - Fundação

**Branch**: `001-project-foundation` | **Date**: 2026-07-24 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-project-foundation/spec.md`

## Summary

Configuração inicial do monorepo e infraestrutura base do projeto Saldu, englobando o setup do backend (Spring Boot 4.1.0 + Java 25), frontend (Next.js 16 + Tailwind CSS 4), ambiente de testes E2E (Playwright), banco de dados local via Docker Compose (PostgreSQL) e implementação dos design tokens.

## Technical Context

**Language/Version**: Java 25 (Backend), TypeScript (Frontend, Test)

**Primary Dependencies**: Spring Boot 4.1.0, Next.js 16 (App Router), Tailwind CSS 4, Playwright

**Storage**: PostgreSQL 16 (via Docker Compose / Testcontainers)

**Testing**: JUnit 5 + Testcontainers (Backend), Playwright (E2E), Jest/Vitest (Frontend)

**Target Platform**: Web (Desktop/Mobile browsers)

**Project Type**: Monorepo (Web Application + REST API)

**Performance Goals**: Build e lint rápidos (< 1 minuto em dev)

**Constraints**: Zero warnings tolerados no backend; banco PostgreSQL obrigatório para testes (sem H2).

**Scale/Scope**: Setup estrutural inicial; sem volume de usuários ou features de negócio no momento.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Correctness over Delivery Speed**: N/A para fundação.
- **Auditability (No Silent Deletes)**: N/A para fundação.
- **Privacy by Design**: N/A para fundação (será ativado no backend futuramente).
- **Web Responsive**: O setup do Tailwind já inclui suporte base.
- **Tech Stack Compliance**: Em total conformidade (Spring Boot 4.1.0, Java 25, Postgres, Next.js, Tailwind).
- **Engineering Standards**: Será configurado Testcontainers (sem DB in-memory). O monorepo orquestrará a garantia de zero warnings.

## Project Structure

### Documentation (this feature)

```text
specs/001-project-foundation/
├── plan.md              
├── research.md          
├── data-model.md        
├── quickstart.md        
├── contracts/           
└── tasks.md             
```

### Source Code (repository root)

```text
/
├── apps/
│   ├── api/               # Spring Boot 4.1.0 (Maven)
│   ├── e2e/               # Playwright E2E (npm)
│   └── web/               # Next.js 16 (npm)
├── infra/
│   └── docker-compose.yml # (ou na raiz, dependendo da preferência)
├── docs/                  # Documentação
└── package.json           # Root orchestration (monorepo scripts)
```

**Structure Decision**: Monorepo customizado gerenciado por scripts NPM na raiz para facilitar a execução conjunta dos projetos (`apps/api`, `apps/web`, `apps/e2e`), com uma pasta `infra/` dedicada ao docker-compose do banco de dados (conforme PRD).

## Complexity Tracking

Nenhuma complexidade adicional introduzida que fira a constituição. O uso de um monorepo foi estritamente ordenado pelo PRD Fase 0.
