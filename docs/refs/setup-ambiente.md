# Guia de Setup do Ambiente — Saldu

## 1. Pré-requisitos

| Ferramenta | Versão mínima | Verificar com |
|---|---|---|
| Java | 25 (ou superior) | `java --version` |
| Node.js | 22 LTS | `node --version` |
| npm | 10+ | `npm --version` |
| Docker | 24+ | `docker --version` |
| Docker Compose | v2+ | `docker compose version` |
| Git | 2.40+ | `git --version` |

---

## 2. Estrutura do Monorepo

O projeto usa uma estrutura baseada em diretórios paralelos gerenciada por um `Makefile` na raiz.

```
saldu/
├── .agents/                 # Configuração harness agentes globais
├── .specify/                # Configuração harness SpecKit
├── apps/                    # Aplicações
│   ├── api/                 # API Spring Boot (Maven)
│   ├── e2e/                 # Testes E2E com Playwright (npm)
│   └── web/                 # App Next.js (npm)
├── docs/                    # Documentação do projeto
│   ├── prd.md
│   ├── design.md
│   └── refs/
│       ├── ddd-pragmatico.md
│       └── setup-ambiente.md
├── infra/                   # Infraestrutura local
│   └── docker-compose.yml
├── package.json             # Orquestração do Monorepo via npm scripts (Root)
└── README.md
```

---

## 3. Arquivos de Infraestrutura (Scaffolding Base)

### 3.1. Scripts npm (Raiz do Projeto)
Crie um arquivo `package.json` na raiz para unificar a orquestração do monorepo de forma nativa e cross-platform:

```bash
npm init -y
npm install -D concurrently
```

Edite o `package.json` raiz para incluir:
```json
{
  "name": "saldu-monorepo",
  "private": true,
  "scripts": {
    "infra:up": "cd infra && docker compose up -d",
    "infra:down": "cd infra && docker compose down",
    "dev:api": "cd apps/api && mvnw spring-boot:run",
    "dev:web": "cd apps/web && npm run dev",
    "dev": "npm run infra:up && concurrently \"npm run dev:api\" \"npm run dev:web\"",
    "test:api": "cd apps/api && mvnw clean validate test",
    "test:web": "cd apps/web && npm run test",
    "test": "concurrently \"npm run test:api\" \"npm run test:web\"",
    "test:e2e": "npm run e2e --prefix apps/test",
  }
}
```

### 3.2. docker-compose.yml (`infra/docker-compose.yml`)
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: saldu-postgres
    environment:
      POSTGRES_DB: saldu
      POSTGRES_USER: saldu
      POSTGRES_PASSWORD: saldu_2026
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./postgres/init.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U saldu"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
```

### 3.3. Init SQL (`infra/postgres/init.sql`)
```sql
-- Configuração para Row-Level Security via isolamento Multi-tenant
ALTER DATABASE saldu SET "app.subscription_id" TO '';

-- Criar extensão para UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

---

## 4. Inicializando os Projetos (Fase 0)

### 4.1. Backend (Spring Boot 4.1.0 + Java 25)
```bash
mkdir -p apps/api
cd apps/api

# Inicializar via Spring Initializr (ou equivalente)
# Maven, Java 25, Jar packaging
# Dependências vitais: Spring Web, Spring Data JPA, Spring Security, PostgreSQL Driver, Flyway, Lombok

# Variáveis de ambiente (para uso no arquivo `src/main/resources/application.yml`)
SPRING_DATASOURCE_URL=
SPRING_DATASOURCE_USERNAME=
SPRING_DATASOURCE_PASSWORD=
JWT_SECRET=
JWT_EXPIRATION=
```

```yaml
# Perfil dev local (apps/api/src/main/resources/application-local.yml)
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/saldu
    username: saldu
    password: saldu_2026
  jpa:
    show-sql: true
    properties:
      hibernate:
        format_sql: true
  flyway:
    baseline-on-migrate: true
jwt:
  secret: saldu-dev-secret-change-in-production
  expiration: 86400000 # 24h
logging:
  level:
    com.saldu: DEBUG
    org.hibernate.SQL: DEBUG
    org.hibernate.type.descriptor.sql.BasicBinder: TRACE
```

### 4.2. Frontend (Next.js 16+ App Router)
```bash
mkdir -p apps/web
cd apps/web

npx create-next-app@latest . \
  --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

npm install @tanstack/react-query zod axios lucide-react

# Variáveis de ambiente locais (apps/web/.env.local)
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### 4.3. E2E (Playwright)
```bash
mkdir -p apps/e2e
cd apps/e2e

npm init playwright@latest -- --quiet

npx playwright install --with-deps

# Variáveis de ambiente locais (apps/e2e/.env)
# Esse arquivo precisa existir, mas pode estar vazio o Backend faz o preenchimento com a url do Testcontainer
E2E_BASE_URL=http://localhost:3000
E2E_DATABASE_URL=postgresql://saldu:saldu_2026@localhost:5432/saldu
```

---

## 5. Fluxo de Trabalho de Desenvolvimento

Com o *scaffolding* estruturado, a rotina de desenvolvimento se resume a:

1. Abrir o terminal na raiz do projeto (`saldu/`)
2. Rodar o comando:
   ```bash
   npm run dev
   ```
3. O comando irá:
   - Subir o Postgres (Docker).
   - Iniciar o Spring Boot na porta `:8080` em paralelo.
   - Iniciar o Next.js na porta `:3000` em paralelo.
4. Acesse o frontend em `http://localhost:3000` e o backend em `http://localhost:8080`.

---

## 6. Troubleshooting Local

| Problema | Solução |
|---|---|
| Porta 5432 em uso | Provável conflito com Postgres local instalado. Pare o serviço host ou troque o mapeamento no `docker-compose.yml`. |
| Flyway migration error | Apague o volume do docker (`docker volume rm infra_postgres_data`) e reinicie o banco para limpar o state do Flyway. |
| CORS error | Certifique-se de que o backend configure o `CorsFilter` permitindo requisições vindas de `http://localhost:3000`. |
| E2E error | Certifique-se de que as variáveis de ambiente `E2E_BASE_URL` e `E2E_DATABASE_URL` estão configuradas corretamente, além das aplicações rodando localmente. |
