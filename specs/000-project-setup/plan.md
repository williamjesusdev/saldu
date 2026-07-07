# Plano de Implementação: Configuração Base e Perfis de Ambiente

**Branch**: `000-project-setup` | **Data**: 2026-07-06 | **Spec**: [spec.md](./spec.md)

**Entrada**: Especificação da feature de `./spec.md`

## Resumo

Estabelecer as configurações de base e a hierarquia estrita de perfis (`base`, `dev`, `dev.local`, `hml`, `prd`) para o frontend (Next.js) e backend (Spring Boot), além de garantir regras de `.gitignore` seguras para overrides locais e execuções automáticas de migration (Flyway).

## Contexto Técnico

**Linguagem/Versão**: Java 25, TypeScript

**Dependências Principais**: Spring Boot 4.1.0, Next.js, Flyway, PostgreSQL

**Testes**: Inicialização correta de contexto Spring e verificação de active profiles.

**Restrições**: Credenciais nos arquivos versionados APENAS para ambiente `dev`. Ambientes `hml` e `prd` NÃO devem ter segredos e devem usar placeholders obrigatórios para variáveis de ambiente.

## Verificação da Constituição

*GATE: Todas as restrições arquiteturais e de domínio atendidas.*

- [x] **VI. Idioma**: Documentação mantida em pt-BR.

## Estrutura do Projeto

### Documentação (esta feature)
```text
specs/000-project-setup/
├── plan.md              # Este arquivo
├── research.md          # Resultado da Fase 0 (Resoluções técnicas)
├── quickstart.md        # Guia de validação
└── contracts/           # Mapping de env vars necessárias
```

### Código Fonte (raiz do repositório)
```text
backend/
├── src/main/resources/
│   ├── application.yml         (base)
│   ├── application-dev.yml     (dev default)
│   ├── application-hml.yml     (aponta p/ DB na nuvem via env vars)
│   └── application-prd.yml     (fail-fast sem env vars)
└── .gitignore                  (deve conter application-*.local.yml)

frontend/
├── .env                        (base)
├── .env.development            (dev)
├── .env.production             (prd)
└── .gitignore                  (deve ignorar *.local)
```

**Decisão de Estrutura**: Adotar padrão nativo de perfis do Spring Boot (`application-{profile}.yml`) com fallback de variáveis de ambiente, e o ecossistema dotenv nativo do Next.js.

## Rastreamento de Complexidade
Sem violações ou aumento injustificado de complexidade.
