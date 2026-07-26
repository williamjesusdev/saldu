# Feature Specification: Fase 0 - Fundação

**Feature Branch**: `001-project-foundation`

**Created**: 2026-07-24

**Status**: Draft

**Input**: User description: "Fase 0 — Fundação (Monorepo, Tokens, Backend, Frontend, Test)"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Setup Monorepo Structure (Priority: P1)

Como um engenheiro de software, quero que o repositório seja configurado como um monorepo para que eu possa gerenciar os projetos de backend, frontend, testes E2E e infraestrutura de forma centralizada.

**Why this priority**: É a fundação básica para os demais projetos existirem.

**Independent Test**: Pode ser testado independentemente verificando se os diretórios `apps/api`, `apps/web`, `apps/e2e` e `infra` existem, e se a raiz possui um `package.json` configurado para orquestrá-los (se aplicável).

**Acceptance Scenarios**:

1. **Given** um repositório vazio, **When** eu configuro o monorepo, **Then** a estrutura de diretórios esperada é criada.

---

### User Story 2 - Inicializar Backend (Priority: P1)

Como um desenvolvedor backend, quero que a base do projeto Spring Boot (4.1.0) com Java 25 e integração com PostgreSQL via Flyway e Testcontainers esteja criada para que eu possa iniciar o desenvolvimento das features.

**Why this priority**: Dependência crítica para o desenvolvimento do domínio e persistência de dados.

**Independent Test**: Pode ser testado rodando `./mvnw clean validate test` e verificando se o projeto compila sem erros (zero warnings) e se a conexão com banco de dados nos testes via Testcontainers funciona.

**Acceptance Scenarios**:

1. **Given** a estrutura de monorepo, **When** eu inicializo o projeto Spring Boot em `apps/api`, **Then** ele compila e os testes base passam usando Testcontainers.

---

### User Story 3 - Inicializar Frontend (Priority: P1)

Como um desenvolvedor frontend, quero que o projeto Next.js (App Router) com TypeScript e Tailwind esteja inicializado para que eu possa construir a interface do usuário.

**Why this priority**: Dependência crítica para a construção da UI web e integração com o backend.

**Independent Test**: Pode ser testado rodando `npm run dev` e acessando a página inicial no navegador, ou rodando lint/formatação garantindo zero erros.

**Acceptance Scenarios**:

1. **Given** a estrutura de monorepo, **When** eu inicializo o projeto Next.js em `apps/web`, **Then** o app sobe e o lint passa com sucesso.

---

### User Story 4 - Inicializar Testes E2E (Priority: P1)

Como um engenheiro de QA/Testes, quero que o projeto base do Playwright esteja inicializado em `apps/e2e` para que eu possa escrever e rodar os testes end-to-end automatizados do sistema.

**Why this priority**: É a fundação para garantir a qualidade (Fase 6 do processo do Saldu Architect).

**Independent Test**: Pode ser testado executando a configuração inicial do Playwright e rodando um teste básico vazio (ou de validação de ambiente) com sucesso.

**Acceptance Scenarios**:

1. **Given** a estrutura de monorepo, **When** eu inicializo o projeto Playwright em `apps/e2e`, **Then** consigo rodar um teste base sem erros.

---

### User Story 5 - Gerar Design Tokens (Priority: P2)

Como um desenvolvedor frontend, quero que os tokens de design do `design.md` sejam extraídos e implementados no Tailwind (ou CSS global) para que os componentes reflitam a identidade visual definida (dark mode, tipografia, cores etc).

**Why this priority**: Essencial para a construção visual das próximas telas do MVP.

**Independent Test**: Pode ser testado verificando se o arquivo de configuração do Tailwind e os estilos CSS contêm as variáveis/tokens extraídos.

**Acceptance Scenarios**:

1. **Given** o arquivo `design.md`, **When** eu processo os tokens de design, **Then** as configurações são refletidas no projeto de frontend.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE ter uma estrutura de diretórios contendo `apps/api`, `apps/web`, `apps/e2e` e `infra`.
- **FR-002**: O backend DEVE ser inicializado com Spring Boot 4.1.0 e Java 25.
- **FR-003**: O backend DEVE usar PostgreSQL e gerenciar migrações com Flyway.
- **FR-004**: O backend DEVE estar configurado para rodar testes integrados com Testcontainers.
- **FR-005**: O frontend DEVE ser inicializado com Next.js 16 (App Router) e Tailwind CSS 4.
- **FR-006**: O projeto de testes DEVE ser inicializado com Playwright em `apps/e2e`.
- **FR-007**: Os Design Tokens documentados em `design.md` DEVEM estar implementados no frontend.

### Key Entities

Nenhuma entidade de negócio será criada nesta fase; o foco é puramente estrutural.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Os comandos de build (backend) e lint (frontend) executam em menos de 1 minuto em ambiente local.
- **SC-002**: O build do backend gera 0 warnings.
- **SC-003**: O linter do frontend gera 0 erros ou warnings.
- **SC-004**: O banco de dados Postgres é provisionado automaticamente nos testes via Testcontainers.
- **SC-005**: A suíte de testes Playwright consegue executar com sucesso no ambiente local.
- **SC-006**: A configuração visual do Tailwind (no frontend) mapeia 100% dos tokens principais definidos em `design.md` (cores, tipografia, bordas), dispensando uso de valores absolutos manuais.
- **SC-007**: O arquivo `docker-compose.yml` em `infra/` consegue subir um banco de dados Postgres local (para desenvolvimento) sem erros na inicialização.
- **SC-008**: Existe um `package.json` raiz configurado para executar/instalar os projetos contidos no repositório de forma centralizada (monorepo).

## Assumptions

- O desenvolvedor possui as dependências locais instaladas (Java 25, Node.js, Docker).
- A configuração da integração contínua (CI/CD) não é alvo imediato desta task (marcada como Fase 2 no PRD).
