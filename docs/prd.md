# PRD — Saldu

**Data:** Julho/2026
**Versão:** 1.0 (baseline)
**Dono do produto:** William Jesus

---

## 1. Problema

Hoje o controle financeiro é feito em planilhas (Excel), o que se tornou inviável para acompanhar múltiplas contas, cartões de crédito e lançamentos com o nível de detalhe necessário. Falta uma visão consolidada de:

- O que entra e o que sai (contas)
- Como sai (movimentação, cartões de crédito, parcelamentos, faturas)
- Previsibilidade (extratos, saldo e futuro)
- Metas, orçamentos e investimentos (visão futura)

**Dor central:** ausência de uma ferramenta que consolide múltiplas contas e cartões com lançamentos organizados, sem a fragilidade e o trabalho manual de planilhas.

---

## 2. Objetivo do produto

Construir uma ferramenta de gestão financeira pessoal completa, que comece atendendo o dono do produto e um pequeno grupo próximo (beta), com arquitetura preparada para evoluir para um SaaS multi-tenant no futuro — sem que isso implique reescrita.

---

## 3. Usuários e contexto de validação

| Aspecto | Definição |
|---|---|
| Usuário inicial | Dono do produto |
| Grupo de validação (beta) | 2 a 5 pessoas próximas |
| Modelo de uso | Multiusuário desde o início (cada pessoa com seus próprios dados) |
| Prazo | Sem prazo rígido — prioridade é qualidade e solidez do modelo de dados sobre velocidade |

**Implicação técnica:** mesmo sendo "pessoal" em intenção, o sistema já nasce multiusuário de fato. `subscription_id` é conceito de primeira classe desde o dia 1 — cada usuário possui sua própria subscription (assinatura).

---

## 4. Escopo do MVP

### Dentro do escopo

- Múltiplas contas (corrente, poupança, cofrinhos[subcontas], carteira, etc)
- Cartões de crédito: lançamentos individuais, parcelamentos, fixos (anuidade, taxas) regra de dias para fechamento e vencimento com flag de dias úteis
- Criação manual de Transações (sem importação automática)
- Categorias hierárquicas (2 níveis: Categoria pai e Subcategoria), com conjunto padrão pré-cadastrado (algumas marcadas como sistema/inexcluíveis)
- Quatro datas por lançamento: ocorrência, lançamento, vencimento e efetivação (ver seção 8)
- Reajuste de saldo por atalho (automatiza criação de transação de ajuste)
- Transferências entre contas
- Reembolso/estorno como Receita (INCOME) com vínculo à transação original (`refundForId`)
- Autenticação por e-mail e senha, com alteração de senha
- Acesso controlado por convite (token [uso-unico], convite direto [e-mail], ou cadastro aberto com aprovação de admin)
- Visão consolidada de saldo geral e individualizado por contas incluindo saldo futuro (contas a pagar)
- Plataforma web (mobile-first e web via navegador)

### Fora do escopo — fase seguinte

Orçamento e metas financeiras · investimentos e empréstimos · importação de extratos (CSV/OFX) · Open Finance · app mobile nativo · dashboard com gráficos e ranking · relatórios exportáveis (PDF/CSV) · transações fixas/recorrentes · regime de caixa vs. competência · pagamentos parciais de despesa · tags e despesas multicategoria · câmbio/moeda estrangeira · múltiplos perfis e PIN · pesquisa global de transações · central de ajuda

### Backlog (sem decisão de prioridade ainda)

Histórico de notificações · integração com calendário externo

### Excluído formalmente do roadmap

- **Assistente de IA integrado**: recomendações financeiras automatizadas são reguladas por CVM/Bacen — não entra no roadmap sem avaliação jurídica especializada prévia.
- **"Relatórios inteligentes"**: serão definidos futuramente conforme necessidade.

> Itens de fase seguinte não são ignorados no domínio — conceitos como `Budget`, `Goal`, `Investment`, `ImportBatch` e `RecurringRule` existem como bounded contexts previstos na modelagem, mesmo sem implementação no MVP.

---

## 5. Requisitos funcionais

1. Usuário se autentica por e-mail e senha, e pode alterar sua senha.
2. Usuário pode criar, editar e arquivar contas financeiras.
3. Usuário pode criar, editar e arquivar cartões de crédito, associados a uma ou mais contas de pagamento.
4. Usuário pode registrar Transações manuais em contas (Receitas ou Despesas), com data de ocorrência, lançamento, vencimento e efetivação. Estornos e reembolsos são modelados como uma Receita (INCOME) contendo um vínculo (`refundForId`) para a transação original.
5. Usuário pode registrar Transações manuais em cartões, com suporte a parcelamento e escolha de fatura inicial.
6. Usuário pode transferir valores entre duas contas próprias, gerando um par de Transações vinculadas (uma Despesa e uma Receita).
7. Usuário pode criar, editar e excluir categorias. As categorias formam uma árvore de no máximo 2 níveis (Pai e Filho/Subcategoria) através de um `parentId`. Categorias de sistema não podem ser excluídas.
8. Usuário pode reajustar o saldo da conta usando um atalho, que calcula a diferença para o saldo real e injeta uma transação com categoria "Outros", subcategoria "Ajustes" e descrição automática ("Receita de ajuste" ou "Despesa de ajuste").
9. Sistema calcula automaticamente saldo de conta (considerando apenas lançamentos efetivados) saldo futuro (considerando data de vencimento dentro do período) e valor de fatura (considerando faturas e parcelas em aberto e lançamentos atuais).
10. Usuário visualiza uma tela consolidada com saldo total e lançamentos recentes.
11. Cada usuário só enxerga e manipula seus próprios dados (isolamento multiusuário).
12. O estado de uma fatura é puramente derivado (Computed State), eliminando a necessidade de rotinas em background. Ela armazena `closingDate`, `dueDate` e `paidAt`. Se `paidAt` é nulo, a fatura está `OPEN` (antes do fechamento), `CLOSED` (após fechamento e antes do vencimento) ou `OVERDUE` (após o vencimento). Se `paidAt` é preenchido, está `PAID`. A data de vencimento respeita a flag de "dias úteis". Em estado `OPEN`, edição livre. Em estado `CLOSED` ou `OVERDUE`, inclusão/remoção exige confirmação explícita. O estorno do pagamento limpa o `paidAt`, restaurando o status derivado apropriado.
    - O consumo do limite do cartão é calculado rigorosamente por: Limite Total - Faturas Abertas - Lançamentos Parcelados (futuros) - Lançamentos no Período + Reembolsos.
    - Lançamentos específicos (ex: anuidade) podem ter uma flag de "não consome limite", servindo apenas para visualização no ledger da fatura.
13. Acesso ao sistema é controlado por convite manual (token), convite direto de beta tester (e-mail), ou cadastro aberto com aceite explícito de um admin.
14. Existe um único papel de admin, fixo, atribuído ao dono do produto — sem sistema de permissões granular no MVP. O admin aprova cadastros e gera convites.
15. Para o beta, o mecanismo padrão de acesso é convite direto por e-mail ou token (admin gera token aberto ou para um e-mail especifico e compartilha link manualmente). Cadastro aberto com aprovação fica disponível como alternativa.

### Validações de entrada

| Campo | Regra |
|---|---|
| Valor de transação | Não pode ser zero. Máximo 2 casas decimais. |
| Senha | Mínimo 8 caracteres, pelo menos 1 maiúscula e 1 número. |
| Descrição de transação | 1–255 caracteres. |
| Motivo de ajuste de saldo | Mínimo 5 caracteres ou pré-setados. |
| Parcelas (cartão) | 1–24. |

---

## 6. Requisitos não funcionais

- **Correção financeira antes de velocidade de entrega**: saldo e fatura precisam bater sempre.
- **Auditabilidade**: nenhum lançamento é apagado silenciosamente (soft-delete ou estorno explícito).
- **Isolamento de dados por usuário** desde o MVP, com desenho que já comporte migração para SaaS multi-tenant sem reescrita do domínio.
- **Web responsivo** para uso confortável em celular e desktop via navegador.
- **LGPD** (obrigatório no MVP, não pós-lançamento): consentimento explícito antes do primeiro uso, mecanismo de exclusão completa de dados (direito ao esquecimento), dados sensíveis criptografados em trânsito e repouso. Exclusão de dados: o usuário pode solicitar exclusão completa de sua conta e dados pessoais via endpoint dedicado ou solicitação ao admin. Dados financeiros obrigatórios por obrigação fiscal (ex: registros de transação) podem ser retidos por prazo legal, mas são desvinculados do identificador pessoal (anonimizados). Confirmação explícita antes da exclusão.

---

## 7. Métricas de sucesso

| Dimensão | O que mede | Como observar no beta |
|---|---|---|
| Uso consistente | Se as pessoas incorporam o hábito de lançar dados | % de usuários que lançam pelo menos 1x/semana nas primeiras 4 semanas |
| Precisão financeira | Se o sistema é confiável | Zero divergências entre saldo/fatura calculado e o valor real esperado |
| Feedback qualitativo | O que trava, o que encanta | Conversa curta com cada beta tester após 2-3 semanas, perguntando se e onde ele voltou pra planilha |
| Volume de uso | Quantidade de transações registradas | Query direta no banco: `SELECT COUNT(*) FROM transaction WHERE subscription_id = ? AND posted_at >= ?` por usuário, semanalmente |

Um MVP bem-sucedido é aquele em que os beta testers abandonam a planilha de fato.

---

## 8. Conceitos de domínio

- **Account** (Conta): saldo, tipo, moeda
- **CreditCard** (Cartão): limite total, dias para fechamento (baseado no vencimento), dia de vencimento base, flag considerar dias úteis, conta de pagamento associada
- **Transaction** (Transação/Lançamento): valor (sempre absoluto/positivo), tipo (`INCOME` para Receitas, `EXPENSE` para Despesas), categoria, conta ou cartão de origem, e quatro datas — `occurredAt` (ocorrência), `postedAt` (lançamento), `dueAt` (vencimento), `settledAt` (efetivação, nulo até confirmado). **Invariante**: saldo de conta só considera transações com `settledAt` preenchido. O impacto no saldo é ditado exclusivamente pelo `type`. Reembolso/estorno é modelado como uma nova `Transaction` do tipo `INCOME`, possuindo um campo `refundForId` apontando para o ID da transação original.
- **Category** (Categoria): modelo com autorreferência (`parentId`) limitado a 2 níveis. Pode conter uma flag `isSystem` (marcando categorias estruturais imutáveis e inexcluíveis, ex: "Outros -> Ajustes").
- **Transfer** (Transferência): registrada em tabela própria antes de gerar os dois lançamentos, com status de processo (`pending` → `completed`/`failed`) para auditoria. Contrato técnico (duas fases, sem saga distribuída):
  1. Cria `Transfer` com status `pending` (commit imediato, é o registro de auditoria).
  2. Cria os dois `Transaction` (débito/crédito) numa transação de banco atômica.
  3. Sucesso → `completed`. Falha → `failed`.
  4. Nunca existe estado "parcial" visível ao usuário; sem retry automático.
  5. Em caso de falha (`failed`), o sistema exibe orientação ao usuário para tentar novamente. Não existe retry automático nem estorno automático — a recuperação é manual.
- **Installment** (Parcela): vinculada a uma transação de cartão
- **Invoice** (Fatura): agregação de lançamentos de um ciclo. **Arquitetura Just-in-Time (Lazy Creation):** a entidade só nasce no banco de dados (inserida sob demanda via Find-or-Create) no exato momento em que o primeiro lançamento daquele ciclo é registrado. Evita poluição no banco e preserva o histórico intacto caso o dia de vencimento seja alterado no futuro. Não possui coluna de `status`; os estados (`OPEN`, `CLOSED`, `OVERDUE`, `PAID`) são projetados/derivados dinamicamente no Backend a partir do cruzamento da data atual com `closingDate`, `dueDate` e `paidAt`.
- **User**: carrega flag `platformAdmin` (apenas seed user, concede acesso ao painel de convites). Cada usuário possui sua própria subscription.
- *(Fora do MVP, previstos no domínio):* `Budget`, `Goal`, `Investment`, `ImportBatch`, `RecurringRule`
- *(Fase futura):* transação entre tenants (ex: empréstimo — receita num tenant, débito em outro). Conflita com o isolamento por tenant atual; será tratado junto ao bounded context de `Investment`/`Loan`.

Para o MVP, adota-se **single-entry** com saldo calculado a partir de transações efetivadas (`settledAt` preenchido). Reajustes compensam divergências via transações categorizadas. Partida dobrada (double-entry) é pré-requisito para evolução futura — a modelagem atual não impede essa migração (basta deixar de persistir `balance` e passá-lo a calcular a partir do ledger).

**Propagação de `subscription_id` e Dados Compartilhados:** 
- O isolamento padrão ocorre via JWT claim → SubscriptionContext (ThreadLocal) → Hibernate filter e Row-Level Security (RLS) no Postgres (`subscription_id = current_setting('app.subscription_id')`).
- **REGRA ABSOLUTA (Shared Reference Data):** Para tabelas de domínio que carregam dados estruturais padrão (ex: `Category`, ou futuras tabelas base), o `subscription_id` DEVE ser anulável (`NULL`). Registros com `NULL` são globais/do sistema (somente leitura para os usuários). Registros com o ID preenchido são exclusivos do usuário que os criou. A política RLS e os filtros do Hibernate para essas tabelas específicas utilizarão obrigatoriamente a cláusula `(subscription_id = ... OR subscription_id IS NULL)`. Operações de edição e exclusão feitas pelos usuários nestas tabelas devem bloquear registros onde o ID é nulo.

### Abordagem DDD — Pragmática

Adota-se DDD simplificado (tactical patterns essenciais) com foco em **modelos de domínio ricos**, não anêmicos:

- **Entidades** carregam regras de negócio (ex: `Invoice` deriva dinamicamente seu estado e permissões; `Transfer` orquestra a criação de transações vinculadas)
- **Services** coordenação, não lógica de negócio (ex: `TransferService` orquestra, mas `Transfer` valida e executa)
- **Value Objects** para conceitos imutáveis (ex: `Money`, `DateRange`)
- **Bounded Contexts** por agregado: `Account`, `CreditCard`, `Transaction`, `Category` (unifica subcategorias e ajustes), `User`
- Sem event sourcing, sem CQRS, sem DDD tactical completo — apenas o necessário para um MVP sólido

**Referência:** `refs/ddd-pragmatico.md` — guia de aplicação DDD simplificado neste projeto.

---

## 9. Riscos em aberto

- Compartilhamento de dados entre tenants (item acima) exigirá decisão de modelagem futura: como garantir consistência entre tenants isolados sem violar o isolamento de dados? Não bloqueia o MVP.

---

## 10. Definição técnica e infraestrutura

### Estrutura do monorepo

```
saldu_/
├── .agents/         # Configuração harness agentes globais
├── .specify/        # Configuração harness SpecKit
├── apps/
│   ├── api/         # Spring Boot 4.1.0 + Java 25
│   ├── e2e/         # Testes E2E com Playwright
│   └── web/         # Next.js + TypeScript + Tailwind
├── docs/            # Documentação do projeto
├── infra/           # Docker Compose + configs de infra local
├── package.json     # Orquestração do Monorepo via npm scripts (Root)
└── README.md
```

### Backend
- Spring Boot 4.1.0 + Java 25
- Spring Data JPA + Hibernate + Flyway (migrações)
- JUnit 5, Mockito, Testcontainers (integração contra Postgres real)
- Monólito modular, hexagonal/ports-and-adapters por bounded context
- API REST versionada em `/api`
- Spring Security 7.1 + JWT

### Isolamento por Subscription e Shared Data
- `subscription_id` propagado via JWT claim, extraído em filtro de segurança para SubscriptionContext (ThreadLocal).
- **Tabelas Estritas do Inquilino (ex: Transaction, Account):** Hibernate filter aplica `WHERE subscription_id = ?`. RLS no Postgres exige `subscription_id = current_setting('app.subscription_id')`.
- **Tabelas de Domínio Compartilhado (ex: Category):** Seguem o padrão Shared Reference Data. Hibernate filter e RLS aplicam `WHERE (subscription_id = ? OR subscription_id IS NULL)`. O Backend bloqueia `UPDATE` e `DELETE` disparados por usuários em registros com `NULL`.
- A dupla camada de proteção (Aplicação + Banco) garante que o vazamento de dados entre inquilinos seja estruturalmente impossível, enquanto o padrão Shared Data mantém o banco livre de duplicação.

### Frontend
- Next.js (App Router) + TypeScript + Tailwind
- TanStack Query + Zod

### Infraestrutura

| Camada | Serviço | Racional |
|---|---|---|
| Backend (Docker) | Render (free web service) | Cold start tolerável; stateless, sem risco de perda de dado |
| Banco de dados | Supabase (free Postgres) | Postgres gratuito do Render é deletado após 30 dias sem grace period — inaceitável para dado financeiro real. Supabase free pausa após 7 dias de inatividade, mas não deleta dado |
| Frontend | Vercel | Nativo para Next.js, free tier generoso |
| CI/CD | GitHub Actions | Build/testes automáticos por push |
| Local | Docker + docker-compose | Ambiente idêntico entre desenvolvedor(es) e agentes |

Premissa assumida: sem exigência de residência de dados em território nacional (LGPD exige salvaguardas, não hospedagem local).

> Roadmap de setup de ambiente, ferramentas e frameworks: ver `refs/setup-ambiente.md`. Sistema de design: ver `design.md`. Princípios não-negociáveis de desenvolvimento: ver `../.specify/memory/constitution.md`.

---

## 11. Decisões de marca

Nome do produto: **Saldu**. Verificado via busca web sem conflito identificado em apps ou empresas de finanças (diferente de candidatos anteriores descartados: "Ledger" colide com a fabricante de hardware cripto Ledger SAS; "Konta" e "Zelo" colidem com produtos/empresas já existentes no setor financeiro).

Recomenda-se confirmação final antes de qualquer lançamento público via: registro.br (domínio), INPI/e-Marcas (marca registrada), e busca direta nas lojas de app.

---

## 12. Próximos passos

### Fase 0 — Fundação

| # | Tarefa | Status |
|---|---|---|
| 1 | Criar `refs/ddd-pragmatico.md` com definição arrojada | ✅ |
| 2 | Criar `refs/setup-ambiente.md` com setup local | ✅ |
| 3 | Instalar SpecKit e gerar `.specify/memory/constitution.md` | ✅ |
| 4 | Configurar monorepo (`apps/api` + `apps/web` + `apps/e2e` + `infra`) | ⏳ |
| 5 | Gerar Design Tokens a partir do `design.md` | ⏳ |
| 6 | Inicializar api (Spring Boot 4.1.0 + Java 25 + Postgres) | ⏳ |
| 7 | Inicializar web (Next.js + Tailwind) | ⏳ |
| 8 | Inicializar e2e (Playwright para E2E) | ⏳ |

### Fase 1 — Specs por feature

Usar a equipe de agentes (liderada por `saldu-architect`) para gerenciar o Spec-Driven Development (Fases 1 a 8) em cada feature:

| # | Feature | bounded context |
|---|---|---|
| 9 | Autenticação e gestão de acesso | User |
| 10 | Criar/editar/arquivar contas | Account |
| 11 | Categorias e subcategorias | Category |
| 12 | Transações em conta | Transaction |
| 13 | Transferência entre contas | Transfer |
| 14 | Reajuste de saldo manual | Account |
| 15 | Cartão de crédito e fatura | CreditCard |
| 16 | Lançamento em cartão com parcelamento | CreditCard |
| 17 | Tela consolidada (saldo total + lançamentos recentes) | Account |

### Fase 2 — Infraestrutura e qualidade

| # | Tarefa |
|---|---|
| 18 | Configurar CI/CD (GitHub Actions): build, testes, lint |
| 19 | Configurar Row-Level Security no Supabase |
| 20 | Implementar design tokens (Prompt 1 do design.md) |
| 21 | Configurar Flyway migrations com primeiro schema |

### Fase 3 — Vertical slices

| # | Feature |
|---|---|
| 22 | Vertical slice ponta a ponta: criar conta + registrar lançamento |
| 23 | Vertical slice de transferência entre contas |
| 24 | Vertical slice de cartão de crédito e fatura |
