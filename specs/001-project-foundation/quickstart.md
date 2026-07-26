# Quickstart Validation Guide: Fase 0

Guia rápido para validar se a fundação do monorepo e infraestrutura foram configuradas corretamente.

## Pré-requisitos
- Node.js (v20+)
- Java 25
- Maven (ou wrapper `./mvnw`)
- Docker & Docker Compose
- Playwright CLI (baixará os browsers automaticamente na primeira run)

## 1. Validando a Infraestrutura Local (Banco de Dados)

Navegue até a pasta de infraestrutura e inicie o banco local:

```bash
cd infra
docker-compose up -d
docker-compose ps
```

*Expected Outcome*: Um container do Postgres (porta padrão 5432) rodando de forma saudável.

## 2. Validando o Backend (Spring Boot + Testcontainers)

Navegue até o backend e execute o build com a validação completa (incluindo testes de integração):

```bash
cd apps/api
./mvnw clean validate test
```

*Expected Outcome*: 
- O projeto compila com ZERO warnings.
- O Testcontainers sobe um banco PostgreSQL dinâmico e os testes base (context load) passam com sucesso.

## 3. Validando o Frontend (Next.js + Tailwind)

Navegue até o frontend, instale as dependências e rode o linter e o servidor dev:

```bash
cd apps/web
npm install
npm run lint
npm run dev
```

*Expected Outcome*: 
- O linter não reporta erros.
- A aplicação Next.js responde na porta `3000`.
- É possível confirmar que a configuração do Tailwind carregou corretamente (ex: checando os estilos no navegador).

## 4. Validando o Ambiente E2E (Playwright)

Navegue até o diretório de testes e execute o comando base:

```bash
cd apps/e2e
npm install
npx playwright test
```

*Expected Outcome*: 
- A suíte de testes executa com sucesso (mesmo que haja apenas um teste dummy confirmando que o framework funciona).

## 5. (Opcional) Orquestração na Raiz do Monorepo

No diretório raiz (`/`), execute o script integrado (se configurado):

```bash
npm run install:all
npm run validate:all
```

*Expected Outcome*: Ambos os projetos são instalados e validados por um único comando centralizado.
