# Research & Architecture Decisions: Fase 0

Esta documentação consolida as escolhas tecnológicas fundamentais para a estruturação do projeto Saldu (Fase 0), garantindo alinhamento total com a *Saldu Constitution* e o *PRD*.

## 1. Organização de Repositório

- **Decision**: Monorepo gerenciado por scripts NPM na raiz (`package.json`), com projetos isolados em `apps/`.
- **Rationale**: Permite controle centralizado de dependências compartilhadas, scripts unificados de build/test e simplifica o fluxo de CI/CD para o MVP, mantendo os domínios (api, web, e2e) fisicamente separados.
- **Alternatives considered**: Repositórios múltiplos (um para backend, um para frontend). Rejeitado devido ao overhead de gestão para um time pequeno focado em MVP rápido.

## 2. Banco de Dados Local (Desenvolvimento)

- **Decision**: Imagem Docker do PostgreSQL 16 provisionada via `docker-compose.yml` na pasta `infra/`.
- **Rationale**: Garante paridade de ambiente entre desenvolvimento local, CI e produção. O PRD dita PostgreSQL obrigatoriamente.
- **Alternatives considered**: Instalação local do Postgres (propenso a variações na máquina do dev). Rejeitado em favor do isolamento via Docker.

## 3. Testes de Integração Backend

- **Decision**: Uso estrito da biblioteca `Testcontainers` com imagem oficial do Postgres para testes integrados.
- **Rationale**: A constituição proíbe o uso de banco de dados em memória (ex: H2). Garantir que testes validem o dialeto correto e comportamentos específicos (como RLS no futuro) requer o uso do Postgres real durante os testes automatizados.

## 4. Estilização e Design Tokens

- **Decision**: Tailwind CSS 4 incorporado diretamente no Next.js (App Router), com tokens do `design.md` importados na configuração.
- **Rationale**: Solução padronizada e previsível que viabiliza a rápida aplicação de Dark Mode e tipografia sem a necessidade de manter grandes arquivos CSS manuais.
