# Saldu — Gestão Financeira Pessoal

Sistema focado em controle absoluto, velocidade e zero ruído (sem gamificação, sem social).
Criado com abordagem de design primeiro e princípios de single-tenant com isolamento, para um app limpo, rápido e focado.

## Estrutura do Monorepo

- `.docs/`: Documentação geral e guia de setup para novos desenvolvedores
- `.specify/`: Configurações e constituição do projeto para os Agentes IA
- `backend/`: API Spring Boot (Java 25, Spring Boot 4.1.0) usando PostgreSQL
- `frontend/`: Aplicação Next.js (App Router, TailwindCSS)
- `docker-compose.yml`: Ambiente local contendo o banco de dados PostgreSQL

## Ambiente de Desenvolvimento

Para rodar o projeto localmente, consulte o guia passo a passo em [setup-guide.md](.docs/setup-guide.md).

## CI/CD

Pipeline configurado no GitHub Actions rodando testes do backend e build/linting do frontend em todo Push para main ou Pull Requests.
