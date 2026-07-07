# PRD — Saldu

**Versão:** 1.0 (baseline)
**Data:** Julho/2026
**Dono do produto:** William

---

## 1. Problema

Hoje o controle financeiro é feito em planilhas (Excel), o que se tornou inviável para acompanhar múltiplas contas, cartões de crédito e lançamentos com o nível de detalhe necessário. Falta uma visão consolidada de:

- O que entra e o que sai (contas)
- Como sai (cartões de crédito, parcelamentos, faturas)
- Metas, orçamento e investimentos (visão futura)

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

**Implicação técnica:** mesmo sendo "pessoal" em intenção, o sistema já nasce multiusuário de fato. `tenant_id`/`user_id` é conceito de primeira classe desde o dia 1 — não é problema a resolver "quando virar SaaS", é problema do MVP.

---

## 4. Escopo do MVP

### Dentro do escopo

- Múltiplas contas (corrente, poupança, carteira, etc.)
- Cartões de crédito: lançamentos por fatura, parcelamentos, data de fechamento e vencimento
- Lançamentos manuais de transações (sem importação automática)
- Categorias e subcategorias customizáveis, com conjunto padrão pré-cadastrado
- Três datas por lançamento: lançamento, vencimento e efetivação (ver seção 8)
- Reajuste de saldo manual, com motivo obrigatório
- Transferências entre contas
- Despesas com valor negativo (reembolso/estorno)
- Autenticação por e-mail e senha, com alteração de senha
- Acesso controlado por convite (token, convite direto, ou cadastro aberto com aprovação de admin)
- Visão consolidada de saldo entre contas
- Plataforma web (desktop e mobile via navegador)

### Fora do escopo — fase seguinte

Orçamento e metas financeiras · investimentos e empréstimos · importação de extratos (CSV/OFX) · Open Finance · app mobile nativo · dashboard com gráficos e ranking · relatórios exportáveis (PDF/CSV) · transações fixas/recorrentes · regime de caixa vs. competência · pagamentos parciais de despesa · tags e despesas multicategoria · câmbio/moeda estrangeira · múltiplos perfis e PIN · pesquisa global de transações · central de ajuda · flags de "ignorar conta/limite nos totais"

### Backlog (sem decisão de prioridade ainda)

Histórico de notificações · integração com calendário externo

### Excluído formalmente do roadmap

- **Assistente de IA integrado**: recomendações financeiras automatizadas são reguladas por CVM/Bacen — não entra no roadmap sem avaliação jurídica especializada prévia.
- **"Relatórios inteligentes"**: sem definição clara do que seria.

> Itens de fase seguinte não são ignorados no domínio — conceitos como `Budget`, `Goal`, `Investment`, `ImportBatch` e `RecurringRule` existem como bounded contexts previstos na modelagem, mesmo sem implementação no MVP.

---

## 5. Requisitos funcionais

1. Usuário se autentica por e-mail e senha, e pode alterar sua senha.
2. Usuário pode criar, editar e arquivar contas financeiras.
3. Usuário pode criar, editar e arquivar cartões de crédito, associados a uma ou mais contas de pagamento.
4. Usuário pode registrar lançamentos manuais em contas (receitas e despesas), com data de lançamento, vencimento e efetivação. Despesas podem ter valor negativo, representando reembolso/estorno.
5. Usuário pode registrar lançamentos manuais em cartões, com suporte a parcelamento.
6. Usuário pode transferir valores entre duas contas próprias, gerando um par de lançamentos vinculados.
7. Usuário pode criar, editar e excluir categorias e subcategorias, e associá-las a cada lançamento.
8. Usuário pode fazer um reajuste manual de saldo em uma conta, com motivo obrigatório.
9. Sistema calcula automaticamente saldo de conta (considerando apenas lançamentos efetivados) e valor de fatura (considerando parcelas em aberto).
10. Usuário visualiza uma tela consolidada com saldo total e lançamentos recentes.
11. Cada usuário só enxerga e manipula seus próprios dados (isolamento multiusuário).
12. Uma fatura é editável livremente enquanto não estiver "paga". Uma vez paga, editar exige "reabrir" a fatura — ação que remove o lançamento de pagamento associado, obrigando um novo pagamento depois da edição.
13. Acesso ao sistema é controlado por convite manual (token), convite direto de beta tester, ou cadastro aberto com aceite explícito de um admin.
14. Existe um único papel de admin, fixo, atribuído ao dono do produto — sem sistema de permissões granular no MVP. O admin aprova cadastros e gera convites.

---

## 6. Requisitos não funcionais

- **Correção financeira antes de velocidade de entrega**: saldo e fatura precisam bater sempre.
- **Auditabilidade**: nenhum lançamento é apagado silenciosamente (soft-delete ou estorno explícito).
- **Isolamento de dados por usuário** desde o MVP, com desenho que já comporte migração para SaaS multi-tenant sem reescrita do domínio.
- **Web responsivo** para uso confortável em desktop e celular via navegador.
- **LGPD** (obrigatório no MVP, não pós-lançamento): consentimento explícito antes do primeiro uso, mecanismo de exclusão completa de dados (direito ao esquecimento), dados sensíveis criptografados em trânsito e repouso.

---

## 7. Métricas de sucesso

| Dimensão | O que mede | Como observar no beta |
|---|---|---|
| Uso consistente | Se as pessoas incorporam o hábito de lançar dados | % de usuários que lançam pelo menos 1x/semana nas primeiras 4 semanas |
| Precisão financeira | Se o sistema é confiável | Zero divergências entre saldo/fatura calculado e o valor real esperado |
| Feedback qualitativo | O que trava, o que encanta | Conversa curta com cada beta tester após 2-3 semanas, perguntando se e onde ele voltou pra planilha |

Um MVP bem-sucedido é aquele em que os beta testers abandonam a planilha de fato.

---

## 8. Conceitos de domínio

- **Account** (Conta): saldo, tipo, moeda
- **CreditCard** (Cartão): limite, dia de fechamento, dia de vencimento, conta de pagamento associada
- **Transaction** (Lançamento): valor, categoria, conta ou cartão de origem, e três datas — `postedAt` (lançamento), `dueAt` (vencimento), `settledAt` (efetivação, nulo até confirmado). **Invariante**: saldo de conta só considera transações com `settledAt` preenchido. Reembolso/estorno é modelado como `Transaction` de valor negativo, sem entidade separada.
- **Category** / **Subcategory**: hierarquia simples, associada a cada lançamento
- **Transfer** (Transferência): registrada em tabela própria antes de gerar os dois lançamentos, com status de processo (`pending` → `completed`/`failed`) para auditoria. Contrato técnico (duas fases, sem saga distribuída):
  1. Cria `Transfer` com status `pending` (commit imediato, é o registro de auditoria).
  2. Cria os dois `Transaction` (débito/crédito) numa transação de banco atômica.
  3. Sucesso → `completed`. Falha → `failed`.
  4. Nunca existe estado "parcial" visível ao usuário; sem retry automático.
- **BalanceAdjustment**: valor, motivo obrigatório, conta associada
- **Installment** (Parcela): vinculada a uma transação de cartão
- **Invoice** (Fatura): agregação de lançamentos de um ciclo, status `open`/`closed`/`paid`. Editável em `open`/`closed`; se `paid`, exige "reabrir" (remove o pagamento associado) antes de editar
- **User**: carrega flag `isAdmin` (fixo, único usuário com essa flag no MVP)
- *(Fora do MVP, previstos no domínio):* `Budget`, `Goal`, `Investment`, `ImportBatch`, `RecurringRule`
- *(Fase futura):* transação entre tenants (ex: empréstimo — receita num tenant, débito em outro). Conflita com o isolamento por tenant atual; será tratado junto ao bounded context de `Investment`/`Loan`.

Considerar **double-entry bookkeeping** (partida dobrada) mesmo no MVP simplificado, já que "saldo e fatura sempre corretos" é o critério de sucesso nº 1.

---

## 9. Riscos em aberto

- Compartilhamento de dados entre tenants (item acima) exigirá decisão de modelagem futura: como garantir consistência entre tenants isolados sem violar o isolamento de dados? Não bloqueia o MVP.

---

## 10. Definição técnica e infraestrutura

### Backend
- Spring Boot 4.1.0 + Java 25
- Spring Data JPA + Hibernate + Flyway (migrações)
- JUnit 5, Mockito, Testcontainers (integração contra Postgres real)
- Monólito modular, hexagonal/ports-and-adapters por bounded context
- Multi-tenancy: `tenant_id` em toda entidade + filtro Hibernate + Row-Level Security no Postgres
- API REST versionada
- Spring Security 7.1 + JWT

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

> Roadmap de setup de ambiente, ferramentas e frameworks: ver `guia-setup-ambiente.md`. Sistema de design: ver `design.md`. Princípios não-negociáveis de desenvolvimento: ver `constitution.md`.

---

## 11. Decisões de marca

Nome do produto: **Saldu**. Verificado via busca web sem conflito identificado em apps ou empresas de finanças (diferente de candidatos anteriores descartados: "Ledger" colide com a fabricante de hardware cripto Ledger SAS; "Konta" e "Zelo" colidem com produtos/empresas já existentes no setor financeiro).

Recomenda-se confirmação final antes de qualquer lançamento público via: registro.br (domínio), INPI/e-Marcas (marca registrada), e busca direta nas lojas de app.

---

## 12. Próximos passos

1. Transformar as seções 5, 6 e 8 em specs por feature via Spec Kit
2. Modelar os aggregates DDD (Account, CreditCard, Transaction, Invoice) com testes unitários antes de qualquer infraestrutura
3. Vertical slice ponta a ponta da primeira feature: criar conta + registrar lançamento
