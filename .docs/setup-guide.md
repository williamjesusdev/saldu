# Guia de Setup de Ambiente — Saldu

**Escopo:** roadmap operacional para configurar ambiente local, ferramentas e infraestrutura. Complementa o `prd.md` (o quê), o `design.md` (interface) e o `constitution.md` (princípios não-negociáveis) — este documento define *como configurar o ambiente para construir*.

---

## Contas e acessos

- [ ] Conta Google (pessoal) para autenticação no Antigravity
- [ ] Conta GitHub (para o repositório do monorepo e GitHub Actions)
- [ ] Conta Supabase (banco de dados gerenciado)
- [ ] Conta Render (deploy do backend)
- [ ] Conta Vercel (deploy do frontend)

---

## 1. Ferramentas Necessárias

- **Antigravity CLI (`agy`)**: O comando correto agora é `agy` (Gemini CLI descontinuado).
  - macOS/Linux: `curl -fsSL https://antigravity.google/cli/install.sh | bash`
  - Windows: `irm https://antigravity.google/cli/install.ps1 | iex`
  - Autentique via Google OAuth e adicione ao seu PATH.
- **Node.js 20+**
- **Java JDK 25**
- **Docker** e **Docker Compose**
- **uv** ou **pipx** (para instalar o Spec Kit)

---

## 2. GitHub Spec Kit

O Spec Kit já está configurado neste projeto (pasta `.specify/`). Para poder utilizá-lo, instale a ferramenta globalmente:

```bash
pipx install git+https://github.com/github/spec-kit.git
# ou use direto com: uvx --from git+https://github.com/github/spec-kit.git specify <comando>
```

### Fluxo de trabalho do Spec Kit

```
/speckit-constitution → /speckit-specify → /speckit-clarify → 
/speckit-plan → /speckit-checklist → /speckit-tasks → 
/speckit-analyze → /speckit-implement → /speckit-converge
```

A constituição (`.specify/memory/constitution.md`) e os templates já estão definidos no repositório e ditam como o agente vai se comportar.

### Estrutura do monorepo

```
saldu/
├── .docs/
│   ├── prd.md
│   ├── design.md
│   └── setup-guide.md
├── .github/workflows/        # CI/CD
├── .specify/                 # gerado pelo Spec Kit
│   ├── memory/
│   │   └── constitution.md   # gerado por /speckit-constitution
├── backend/
│   ├── src/main/java/...     # Spring Boot 4.1.0 + Java 25
│   ├── src/test/java/...
│   └── pom.xml (ou build.gradle)
├── frontend/
│   ├── app/                  # Next.js App Router
│   └── package.json
├── specs/                    # gerado por feature, conforme o Spec Kit avança
├── .gitignore
├── docker-compose.yml
└── README.md
```

---

## 3. Rodando o Ambiente Local

Backend e frontend rodam localmente fora do Docker para aproveitar hot-reload, enquanto o Postgres roda em container.

1. **Subir Banco de Dados:**
   ```bash
   docker compose up -d
   ```

2. **Rodar o Backend (Spring Boot):**
   ```bash
   cd backend
   ./mvnw spring-boot:run
   ```
   *(O projeto já está configurado com Spring Security, Flyway, PostgreSQL Driver e Testcontainers).*

3. **Rodar o Frontend (Next.js):**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

---

## 4. Infraestrutura de Deploy

O repositório já está estruturado com CI/CD (GitHub Actions) no arquivo `.github/workflows/ci.yml`. Os serviços alvos são:
- **Supabase**: PostgreSQL
- **Render**: Backend Spring Boot (Web Service / Docker)
- **Vercel**: Frontend Next.js

Para deploy automático: as integrações devem ser configuradas conectando as plataformas ao repositório no GitHub.

---

## 5. Git e fluxo de trabalho

### Branching e Pull Requests

- A branch `main` é estável e deployável — **nunca** faça commit direto nela.
- Crie uma branch por feature, nomeada como a pasta gerada em `specs/` (ex: `001-account-transaction`).
- Todo merge passa por Pull Request, o que engatilha o CI/CD (build, testes, lint).
- Use Conventional Commits (`feat:`, `fix:`, `test:`, `docs:`, `chore:`, `refactor:`).

### Ciclo por feature (dia a dia)

1. `/speckit-specify` → gera `specs/00X-nome/spec.md` → commit `docs: spec da feature X`
2. `/speckit-plan` → `plan.md` → commit
3. `/speckit-tasks` → `tasks.md` → commit
4. `/speckit-implement` → agente escreve código + testes → revise cada diff (`request-review` mode) antes de aceitar → commits incrementais
5. Abre PR → CI roda → merge em `main`

### Um cuidado específico

Qualquer edição em `.specify/memory/constitution.md` é uma emenda formal à arquitetura, não um ajuste qualquer. A própria constituição (seção Governance) exige versionamento explícito e revisão dessas mudanças. Trate esse arquivo com mais cerimônia que os demais.

---

## Checklist de saída

- [x] `agy --version` funciona no terminal
- [x] `specify` (ou `uvx ... specify`) roda sem erro
- [x] `constitution.md` escrito e revisado
- [x] `.gitignore` no lugar antes do primeiro `git add`
- [x] Primeiro commit feito com `.specify/` + `.docs/` apenas — sem código ainda
- [x] `docker compose up` sobe o Postgres local
- [ ] `mvn spring-boot:run` sobe o Spring Boot local e conecta no Postgres do Docker
- [ ] `npm run dev` sobe o Next.js local 
- [ ] Contas Render, Supabase e Vercel criadas (mesmo sem nada deployado ainda)
