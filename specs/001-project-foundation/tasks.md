# Tasks: Fase 0 - Fundação

**Input**: Design documents from `specs/001-project-foundation/`

**Prerequisites**: plan.md (required), spec.md (required)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

*(N/A - Toda a estrutura inicial foi mapeada diretamente como User Stories neste épico estrutural)*

---

## Phase 2: Foundational (Blocking Prerequisites)

*(N/A - Não há blocantes cruzados; as inicializações dos apps podem ser feitas em paralelo logo após o monorepo.)*

---

## Phase 3: User Story 1 - Setup Monorepo Structure (Priority: P1) 🎯 MVP

**Goal**: Configurar o repositório como um monorepo para gerenciar os projetos de forma centralizada e provisionar o banco de dados local.

**Independent Test**: Root package.json existe e Docker Compose inicializa com sucesso.

### Implementation for User Story 1

- [ ] T001 [P] [US1] Create root package.json configuring npm workspaces (apps/api, apps/web, apps/e2e) in `/package.json`
- [ ] T002 [P] [US1] Create PostgreSQL local infrastructure config in `/infra/docker-compose.yml`

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Inicializar Backend (Priority: P1)

**Goal**: Criar a base do projeto Spring Boot (4.1.0) com Java 25, Flyway e Testcontainers.

**Independent Test**: `./mvnw clean validate test` executa sem warnings.

### Tests for User Story 2 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T003 [US2] Write base context load test validating Testcontainers integration in `apps/api/src/e2e/java/com/saldu/SalduApplicationTests.java`

### Implementation for User Story 2

- [ ] T004 [US2] Initialize Maven pom.xml with Spring Boot, PostgreSQL, Flyway, and Testcontainers dependencies in `apps/api/pom.xml`
- [ ] T005 [US2] Create main application class in `apps/api/src/main/java/com/saldu/SalduApplication.java`
- [ ] T006 [US2] Create application properties for database config in `apps/api/src/main/resources/application.yml`
- [ ] T007 [US2] Create initial empty Flyway migration in `apps/api/src/main/resources/db/migration/V1__init.sql`

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Inicializar Frontend (Priority: P1)

**Goal**: Criar o projeto Next.js (App Router) com TypeScript e Tailwind CSS 4.

**Independent Test**: Linter não retorna erros e o servidor de desenvolvimento sobe corretamente.

### Tests for User Story 3 ⚠️

- [ ] T008 [US3] Create base dummy test or verify linter rules are strict in `apps/web/.eslintrc.json`

### Implementation for User Story 3

- [ ] T009 [US3] Initialize Next.js app package.json and dependencies in `apps/web/package.json`
- [ ] T010 [US3] Create TypeScript configuration in `apps/web/tsconfig.json`
- [ ] T011 [US3] Create Next.js configuration in `apps/web/next.config.mjs`
- [ ] T012 [US3] Create initial App Router layout and page in `apps/web/src/app/layout.tsx` and `apps/web/src/app/page.tsx`

**Checkpoint**: All user stories up to US3 are now independently functional

---

## Phase 6: User Story 4 - Inicializar Testes E2E (Priority: P1)

**Goal**: Inicializar o projeto Playwright para rodar testes E2E automatizados.

**Independent Test**: Execução de `npx playwright test` roda com sucesso validando um cenário base.

### Tests for User Story 4 ⚠️

- [ ] T013 [US4] Write an empty/dummy validating E2E test in `apps/e2e/tests/example.spec.ts`

### Implementation for User Story 4

- [ ] T014 [US4] Initialize Playwright project dependencies in `apps/e2e/package.json`
- [ ] T015 [US4] Configure Playwright settings in `apps/e2e/playwright.config.ts`

**Checkpoint**: E2E testing framework is ready

---

## Phase 7: User Story 5 - Gerar Design Tokens (Priority: P2)

**Goal**: Implementar os tokens do `design.md` (dark mode, tipografia, cores) no Tailwind CSS (frontend).

**Independent Test**: Configuração do Tailwind contém todos os tokens mapeados corretamente.

### Implementation for User Story 5

- [ ] T016 [P] [US5] Create Tailwind config with tokens extracted from design.md in `apps/web/tailwind.config.ts`
- [ ] T017 [US5] Include CSS variables and base styles in `apps/web/src/app/globals.css`

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T018 Configurar scripts unificados no `package.json` da raiz para invocar instalação/build de todos os apps em `/package.json`
- [ ] T019 Validar as métricas de sucesso (Build < 1min, zero warnings backend, zero erros linter)
- [ ] T020 Run quickstart.md validation

---

## Dependencies & Execution Order

### Phase Dependencies

- **User Stories (Phase 3+)**: US1, US2, US3, e US4 podem rodar de forma totalmente isolada se usarem diretórios distintos, no entanto, é aconselhável finalizar a Fase 3 (US1) primeiro para ter o scaffolding dos pacotes base.
- **Polish (Final Phase)**: Depende da conclusão de todos os projetos (apps).

### User Story Dependencies

- **User Story 1 (P1)**: Monorepo Root (Pré-requisito lógico)
- **User Story 2 (P1)**: Independente
- **User Story 3 (P1)**: Independente
- **User Story 4 (P1)**: Independente
- **User Story 5 (P2)**: Depende do projeto Frontend gerado na US3.

### Parallel Opportunities

- A criação do banco de dados (infra) e o setup das pastas backend e frontend podem ser executados totalmente em paralelo pelas subagentes especializadas.
