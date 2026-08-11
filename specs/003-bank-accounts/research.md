# Research: Bank Accounts

## Decision 1: Account Type Storage Mapping

- **Decision**: Mapear o tipo da conta (CHECKING, SAVINGS, INVESTMENT) como `VARCHAR(20)` no PostgreSQL e como um `enum` em Java.
- **Rationale**: Usar `VARCHAR` no banco em vez de Enum nativo do PostgreSQL (ex: `CREATE TYPE`) facilita futuras migrações com Flyway e adição de novos tipos de conta sem complexidade de DDL específica do Postgres. O Java cuidará da validação através do Enum.
- **Alternatives considered**: Usar tipo `enum` nativo do Postgres (rejeitado pela dificuldade de adicionar valores em migrações futuras sem downtime ou sintaxe proprietária).

## Decision 2: Soft Delete Strategy for Accounts

- **Decision**: Adicionar uma coluna `deleted_at` (TIMESTAMP) e usar `@SQLRestriction("deleted_at IS NULL")` no Hibernate (se usar JPA) ou filtro manual na Repository.
- **Rationale**: Mantém a conformidade com a Constituição do Saldu (No Silent Deletes) e garante que consultas padrão ignorem as contas arquivadas sem esforço extra na camada de serviço.
- **Alternatives considered**: Uma flag booleana `is_active` (rejeitada, pois `deleted_at` oferece também auditoria temporal indicando *quando* foi arquivada).

## Decision 3: Institution / Bank Integration and Logos

- **Decision**: A vinculação do banco (Nubank, BB, Outros) será armazenada apenas como uma string identificadora (`institution`: `VARCHAR(50)`) no banco de dados. Os logotipos reais em SVG/PNG ficarão armazenados no lado do cliente (Next.js `/public/banks/`).
- **Rationale**: Impede sobrecarga do banco de dados com arquivos binários e evita complexidade de um cadastro de sistema de "Instituições" completo com tabela dedicada num estágio MVP. O Frontend simplesmente renderiza o arquivo `/banks/${institution}.svg`, fazendo fallback para `/banks/OTHER.svg`.
- **Alternatives considered**: Criar uma tabela de domínio estática `institutions` com relacionamentos (rejeitada, pois quebra o escopo MVP. Uma string é suficiente para vincular a interface).
