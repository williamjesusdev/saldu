# Implementation Plan: Auth & Security Refactor

**Branch**: `[004-auth-security-refactor]` | **Date**: 2026-08-11 | **Spec**: [spec.md](./spec.md)

## Summary

Refatorar o módulo `002-user-auth` para extrair a UI para um componente centralizado (`AuthForm`) aplicando princípios SOLID e DRY para evitar duplicação de código entre Login e Cadastro, utilizando Zod para validação (espelhando a arquitetura do módulo de contas). Reativar o repositório CSRF (`CookieCsrfTokenRepository.withHttpOnlyFalse()`) no Spring Security e configurar o frontend (Next.js) para repassar o cabeçalho `X-XSRF-TOKEN` em requisições de mutação.

## Technical Context

**Language/Version**: Java 25, TypeScript

**Primary Dependencies**: Spring Boot 4.1.0, Spring Security, Next.js 16, Zod, Tailwind CSS 4

**Storage**: PostgreSQL (não afetado diretamente, mas as mutações dependem do token)

**Testing**: JUnit, Testcontainers, Jest, Playwright

**Project Type**: Monorepo Web Application (Backend API + Frontend SPA)

**Constraints**: Zod errors rendered locally sem reload da página. Token CSRF deve ser extraído do cookie. O frontend deve priorizar a reutilização (DRY) através de um único `AuthForm` adaptável, centralizando esquemas Zod e tratamento de submit.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Zero Warnings**: Resolver o alerta SonarQube `java:S4502` de CSRF alinha perfeitamente com a regra de Zero Warnings.
- **Auditability / LGPD**: A defesa em profundidade protege transações de manipulações forjadas por terceiros.
- **TDD / Testing**: Testes E2E (Playwright) e Unitários (Jest) devem ser atualizados e manter o sinal verde (`quality-gate:ci`).

## Project Structure

### Documentation (this feature)

```text
specs/004-auth-security-refactor/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (future)
```

### Source Code (repository root)

```text
apps/api/
├── src/main/java/com/saldu/infrastructure/security/
│   └── SecurityConfig.java

apps/web/
├── src/
│   ├── app/(app)/login/page.tsx
│   ├── app/(app)/register/page.tsx
│   ├── components/auth/
│   │   └── AuthForm.tsx
│   └── lib/
│       └── apiClient.ts (Axios/Fetch interceptor)
```

**Structure Decision**: A estrutura foi adaptada para o padrão de Vertical Slices no frontend e configuração de Security Filter Chain global no backend, preservando o layout oficial do Saldu Monorepo.
