# Saldu - Multi-Tenant PFM

Saldu is a Personal Financial Management (PFM) system architected as a Multi-Tenant application. 
It guarantees absolute precision in financial calculations and strict tenant data isolation.

## Project Structure
- **apps/api/**: Spring Boot 4.1.0 + Java 25. Enforces Pragmatic DDD and Row-Level Security (RLS).
- **apps/web/**: Next.js 16 (App Router) + Tailwind CSS 4.
- **tests/e2e/**: Testes E2E com Playwright.
- **infra/**: Docker Compose (PostgreSQL 16) and Flyway scripts.
- **docs/**: Product Requirements Document (PRD) and architecture designs.
- **AGENTS.md**: **[CRITICAL]** The living context document for all AI agents. Outlines layer dependencies, bounded contexts, and the dependency decision table.
- **.specify/memory/constitution.md**: The absolute non-negotiable rules for the project (TDD, Zero Warnings, No Silent Deletes).

## Setup & Execution
The repository is orchestrated entirely via `npm scripts` at the root.

**Prerequisites:** Node.js 22+, Java 25, Docker 24+
```bash
# Install root orchestration tools
npm install

# Start the entire environment (DB, Backend, Frontend)
npm run dev
```

For more detailed setup instructions, see `docs/refs/setup-ambiente.md`.

## Quality & Contribution
- This project follows **Spec-Driven Development**. 
- Commits must follow the Conventional Commits format.
- Code must pass automated quality gates (`npm run quality-gate:ci`) before PR submission.
