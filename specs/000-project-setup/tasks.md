---
description: "Lista de tarefas para implementação da feature"
---

# Tarefas: Configuração Base e Perfis de Ambiente

**Entrada**: Documentos de design em `specs/000-project-setup/`
**Pré-requisitos**: plan.md (obrigatório), spec.md (obrigatório)

## Formato: `[ID] [P?] [Story] Descrição`
- **[P]**: Pode ser executado em paralelo (arquivos diferentes, sem dependências)
- **[Story]**: A qual história de usuário esta tarefa pertence (ex: US1, US2, US3)

---

## Fase 1: Setup (Infraestrutura Compartilhada)
**Propósito**: Inicialização do projeto e estrutura básica

- [x] T001 Criar estrutura do projeto conforme plano de implementação (Frontend Next.js e Backend Spring Boot)
- [x] T002 Inicializar docker-compose.yml para PostgreSQL

---

## Fase 2: Fundacional (Pré-requisitos Bloqueantes)
**Propósito**: Infraestrutura central que DEVE estar completa antes de implementar QUALQUER história de usuário

- [x] T003 Configurar `.gitignore` raiz para excluir arquivos de IDE, segredos e overrides `*.local` adequadamente.

---

## Fase 3: História de Usuário 1 - Execução do Ambiente Local Padrão (dev) (Prioridade: P1)
**Objetivo**: Desenvolvedores precisam inicializar o projeto localmente de forma rápida e reprodutível.

**Teste Independente**: Subir a aplicação sem definir perfil explicitamente deve inicializar como `dev` e se conectar ao banco Docker padrão.

### Implementação da História de Usuário 1
- [x] T004 [P] [US1] Criar arquivo base `application.yml` em `backend/src/main/resources/application.yml`
- [x] T005 [P] [US1] Criar propriedades de desenvolvimento em `backend/src/main/resources/application-dev.yml` configurando a conexão do PostgreSQL.
- [x] T006 [P] [US1] Criar configuração de ambiente do frontend em `frontend/.env.development` com URLs base para frontend/backend.

---

## Fase 4: História de Usuário 2 - Sobrescrita de Configurações Locais (dev.local) (Prioridade: P2)
**Objetivo**: Desenvolvedores podem apontar serviços para instâncias específicas localmente sem sujar repositório.

**Teste Independente**: Criar um arquivo `.local` ou `application-dev.local.yml`, alterar a porta e checar que a app subiu na nova porta, sem estar rastreado no git.

### Implementação da História de Usuário 2
- [x] T007 [P] [US2] Atualizar `backend/src/main/resources/application.yml` para incluir `dev.local` em `spring.profiles.include` (Next.js já suporta `.env.local` automaticamente).

---

## Fase 5: História de Usuário 3 - Perfis de Nuvem (hml e prd) (Prioridade: P1)
**Objetivo**: Aplicação deve comportar-se de forma segura em staging e produção com vars de ambiente do SO.

**Teste Independente**: Subir com perfil `prd` falha se variáveis de env essenciais não estiverem injetadas no SO; migrations do Flyway não executam sozinhas em prd.

### Implementação da História de Usuário 3
- [x] T008 [P] [US3] Criar arquivo `backend/src/main/resources/application-hml.yml`
- [x] T009 [P] [US3] Criar arquivo `backend/src/main/resources/application-prd.yml` com `spring.flyway.enabled=false` e exigindo vars de ambiente do SO.
- [x] T010 [P] [US3] Criar arquivo `frontend/.env.production` como base para sobrescritas na Vercel.

---

## Fase 6: Polimento e Preocupações Transversais
- [x] T011 Atualizar `README.md` e `SETUP-GUIDE.md` para refletir a nova hierarquia de perfis.

---

## Dependências e Ordem de Execução
- A História de Usuário 1 bloqueia o desenvolvimento local, portanto deve ser executada primeiro.
- As Histórias de Usuário 2 e 3 podem ser realizadas em paralelo após a US1.
