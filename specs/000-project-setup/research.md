# Fase 0: Pesquisa e Resoluções

## Decisões Técnicas Consolidadas

Nenhuma ambiguidade identificada. A hierarquia de ambientes foi definida estritamente na especificação (`base`, `dev`, `dev.local`, `hml`, `prd`).

### 1. Spring Boot Profiles (Backend)
- **Decisão**: Utilizaremos `application.yml` para a configuração `base`, e arquivos específicos `application-{profile}.yml` para os demais.
- **Prioridade dev.local**: Para `dev.local`, adicionaremos `*-dev.local.yml` no `.gitignore`. Desenvolvedores que quiserem usá-lo precisarão criar um arquivo `application-dev.local.yml` e ativar o perfil na sua própria IDE ou terminal (ex: `SPRING_PROFILES_ACTIVE=dev,dev.local`). Isso garante mescla correta e segura sem sujar o controle de versão.
- **Ativação Default (Dev)**: Configuraremos o `application.yml` (base) para ter `spring.profiles.active: dev` por padrão. Assim, qualquer run sem parâmetros levanta o ambiente de dev local.

### 2. Next.js Environment Variables (Frontend)
- **Decisão**: O Next.js nativamente suporta arquivos específicos por ambiente.
- **Mapeamento**:
  - `base` -> `.env`
  - `dev` -> `.env.development`
  - `dev.local` -> `.env.development.local` (já ignorado pelo template Next.js padrão no Git)
  - `hml` / `prd` -> Variáveis injetadas diretamente na plataforma da nuvem (Vercel injeta isso nativamente para Preview branches e Production).

### 3. Migrations Automáticas (Flyway)
- **Decisão**: O Flyway será habilitado por padrão em todos os perfis (`spring.flyway.enabled=true`), garantindo que tanto o DB local (Postgres no Docker) quanto o de Nuvem rodem os scripts SQL mais novos no boot up da aplicação.
