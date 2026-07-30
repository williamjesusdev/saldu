<div align="center">

# 💰 Saldu

**Multi-Tenant Personal Financial Management (PFM) System**

[![Node.js](https://img.shields.io/badge/Node.js-22+-43853D?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Java](https://img.shields.io/badge/Java-25-ED8B00?style=flat-square&logo=openjdk&logoColor=white)](https://openjdk.java.net/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-4.1.0-6DB33F?style=flat-square&logo=spring&logoColor=white)](https://spring.io/projects/spring-boot)
[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-316192?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](http://commitizen.github.io/cz-cli/)

*Saldu guarantees absolute precision in financial calculations and strict tenant data isolation.*

[Explore the Docs](./docs/prd.md) · [Report Bug](#) · [Request Feature](#)

</div>

---

## ✨ Features

- 🏢 **Multi-Tenant Architecture**: Strict data isolation with PostgreSQL Row-Level Security (RLS).
- 🧮 **Absolute Precision**: Single-Entry MVP where balance is dynamically calculated based on settled transactions. No negative transactions (uses income/expense absolute values).
- 🧾 **Just-in-Time Invoices**: Invoices are computed on the fly based on payment and closing dates, never persisted as state-machines.
- 🛡️ **Zero Silent Deletes**: Financial integrity maintained via soft deletes (`deleted_at`).
- 🤖 **Agent-First**: Built alongside AI with a strict `AGENTS.md` context document.

## 🏗️ Monorepo Architecture

This project is a monorepo containing everything needed to run Saldu. It is orchestrated via root-level `npm scripts`.

```text
saldu/
└── .specify/        # 🧠 Internal state & constraints for Agents
├── apps/
│   ├── api/         # ☕ Spring Boot 4.1.0 + Java 25 + Flyway (DDD + RLS)
│   └── web/         # ⚛️ Next.js 16 (App Router) + Tailwind CSS 4
├── tests/
│   └── e2e/         # 🎭 Playwright End-to-End tests
├── infra/           # 🐳 Docker Compose (PostgreSQL 16) 
├── docs/            # 📚 PRD, Architecture Designs, and References
├── specs/           # 📝 Specifications and Feature Requirements
```

> **Note to AI Agents:** Before proceeding, you **must** read [`AGENTS.md`](./AGENTS.md) and [`constitution.md`](./.specify/memory/constitution.md) for non-negotiable architectural rules.

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:
- **Node.js** (v22+)
- **Java** (v25)
- **Docker** (v24+)

### Installation & Execution

1. **Install orchestration dependencies:**
   ```bash
   npm run install:all
   ```

2. **Spin up the entire environment (DB, API, Web):**
   ```bash
   npm run dev
   ```

> 📖 *For a detailed environment setup guide, see [setup-ambiente.md](./docs/refs/setup-ambiente.md).*

## 📚 Documentation

Dive deeper into the system's design and requirements:
- **[Product Requirements Document (PRD)](./docs/prd.md)**
- **[System Architecture Design](./docs/design.md)**

## 🤝 Quality & Contribution

This project adheres to **Spec-Driven Development**. 
- Commits must strictly follow the [Conventional Commits](https://www.conventionalcommits.org/) format.
- Code must pass automated quality gates before PR submission:
  ```bash
  npm run format:all
  npm run lint:all
  npm run test:all
  ```

---
<div align="center">
  <i>Built with discipline.</i>
</div>
