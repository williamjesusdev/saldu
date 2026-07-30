# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Monorepo**: Initialized npm workspaces for `apps/api`, `apps/web`, and `tests/e2e`.
- **Backend**: Set up Spring Boot 4.1.0 with Java 25, PostgreSQL, Flyway, and Testcontainers.
- **Frontend**: Created Next.js 16 (App Router) project with TypeScript and Tailwind CSS 4.
- **E2E Tests**: Configured Playwright for automated UI testing.
- **Design Tokens**: Configured Tailwind CSS with custom design tokens for typography, colors, and dark mode support.
- **Infra**: Added local PostgreSQL database configuration via Docker Compose.
- **Scripts**: Unified npm scripts for building, cleaning, formatting, linting, and testing across the monorepo.
