<!--
Sync Impact Report:
- Version change: none → 1.0.0
- List of modified principles: None (initial creation)
- Added sections:
  - Core Principles
  - Technology Stack & Domain Isolation
  - Compliance & Development Workflow
  - Governance
- Removed sections: None
- Templates requiring updates: None
- Follow-up TODOs: None
-->

# Saldu Constitution

## Core Principles

### I. Exatidão & Efetivação Confirmada
Todo saldo de conta DEVE considerar apenas transações com uma data de efetivação (`settledAt`) confirmada. Cálculos e exibições na interface DEVEM excluir transações pendentes/não efetivadas do saldo ativo. Bugs de cálculo são completamente inaceitáveis; a exatidão do status financeiro tem prioridade absoluta sobre a velocidade de execução.

### II. Isolamento de Inquilino (Multi-Tenancy)
Toda entidade de dados DEVE carregar um `tenant_id` (ou `user_id`). Nenhuma query de banco de dados ou manipulação de dados tem permissão para executar sem o escopo explícito do tenant. Isso garante a partição completa e o isolamento dos dados entre os usuários.

### III. Test-Driven Development (TDD) (INEGOCIÁVEL)
Todos os agregados de domínio, lógica e invariantes DEVEM ser desenvolvidos seguindo TDD: testes unitários/integração são escritos e falham primeiro, para então a lógica ser implementada. Os testes de integração DEVEM rodar usando Testcontainers com uma instância real do PostgreSQL—nunca utilize H2, bancos em memória ou mocks para lógicas envolvendo cálculo de saldo ou faturas.

### IV. Transferências Seguras e Rastreadas
Transferências entre contas DEVEM ser registradas em uma tabela dedicada `Transfer` com um fluxo de estado (`pending`, `completed`, `failed`) e logs de auditoria, antes de iniciar as transações individuais de débito/crédito. A execução deve ser atômica, garantindo que nenhum estado parcial ou fantasma seja exposto ao usuário. Não há retry automático — falha é reportada como `failed` e a nova tentativa é sempre uma ação explícita do usuário.

### V. Auditabilidade & Registros Imutáveis
Nenhum registro financeiro ou transação pode ser deletado silenciosamente. Soft-deletes, estornos (transações de valor negativo) ou registros manuais de ajuste de saldo com justificativas obrigatórias são necessários para rastrear mudanças. Faturas com o status `paid` (paga) são estritamente imutáveis; editá-las requer uma ação explícita de "reabrir", que primeiro remove a transação de pagamento associada.

### VI. Idioma Oficial da Documentação
Toda documentação técnica (Constituição, Specs, Plans, Checklists, READMEs) DEVE ser escrita e mantida em Português do Brasil (pt-BR).

### VII. Papel de Admin Fixo
O sistema tem um único papel de admin, fixo, atribuído ao dono do produto — não há sistema de permissões granular, papéis customizáveis ou hierarquia de acesso nesta fase. O admin é responsável por aprovar solicitações de cadastro aberto e gerar tokens de convite. Implementar RBAC genérico ou múltiplos níveis de admin está fora de escopo até que o produto evolua para SaaS multi-administrador.

## Technology Stack & Domain Isolation
- **Backend Stack**: Java 25, Spring Boot 4.1.0, Spring Data JPA, Flyway, Spring Security 7.1 (autenticação JWT).
- **Frontend Stack**: Next.js (App Router), TypeScript, Tailwind CSS, TanStack Query, Zod.
- **Padrão de Arquitetura**: Ports and Adapters / Arquitetura Hexagonal por bounded context. A camada central de domínio deve permanecer pura e livre de qualquer dependência ou imports da camada de infraestrutura (como anotações do Spring ou JPA nas entidades puras de domínio).

## Compliance & Development Workflow
- **Conformidade LGPD**: O consentimento explícito do usuário é obrigatório antes do primeiro uso. O sistema deve suportar o direito ao esquecimento (um mecanismo completo de deleção de dados do usuário). Dados sensíveis pessoais e financeiros devem ser criptografados tanto em trânsito quanto em repouso.
- **Restrição regulatória — IA e aconselhamento financeiro**: nenhuma funcionalidade de recomendação financeira automatizada, assistente de IA integrado, ou "insights inteligentes" pode ser implementada sem avaliação jurídica prévia especializada (risco regulatório CVM/Bacen). Um agente que receber uma solicitação nessa direção deve recusar e sinalizar a necessidade de revisão jurídica antes de prosseguir.
- **Diretrizes de UI**: Os indicadores visuais de estado de efetivação devem ser consistentes: uma borda esquerda de 3px nas linhas das tabelas (cor sólida verde/vermelha para efetivado, tracejada cinza para pendente). Os valores devem ser renderizados usando figuras tabulares monoespaçadas (`Spline Sans Mono`) para garantir o alinhamento vertical.
- **Fluxo de Trabalho**: Todas as novas features devem passar pelo pipeline completo do Spec Kit (`/speckit-specify` -> `/speckit-plan` -> `/speckit-tasks` -> `/speckit-implement`). Todo pull request deve acionar GitHub Actions automatizadas para compilar, testar (com Testcontainers) e verificar o lint (backend e frontend).

## Governance
- A Constituição é a autoridade suprema para padrões de desenvolvimento e código neste projeto. Ela substitui todas as práticas individuais, discussões em PRs e diretrizes externas.
  - Emendas a esta constituição devem ser formalmente documentadas, ter sua versão atualizada, e refletidas em todos os documentos base (`spec-template.md`, `plan-template.md`, `tasks-template.md`).
  - Auditorias de conformidade devem ser realizadas em cada revisão de código, verificando se a implementação atende a todos os princípios fundamentais.

**Version**: 1.0.0 | **Ratified**: 2026-07-06 | **Last Amended**: 2026-07-06
