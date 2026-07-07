# Especificação da Feature: Configuração Base e Perfis de Ambiente

**Branch da Feature**: `000-project-setup`

**Criado em**: 2026-07-06

**Status**: Rascunho

**Entrada**: Inicialização dos projetos, configs iniciais, start das apps, e hierarquia de perfis (base, dev, dev.local, hml, prd).

## Clarifications

### Session 2026-07-06

- Q: Qual deve ser a estratégia para execução das migrações do Flyway no ambiente de produção (prd)? → A: B (Desativar no boot para o perfil prd e rodar via pipeline CI/CD separadamente).

## Cenários de Usuário e Testes *(obrigatório)*

### História de Usuário 1 - Execução do Ambiente Local Padrão (dev) (Prioridade: P1)

Os desenvolvedores precisam inicializar o projeto localmente de forma rápida e reprodutível, sem depender de recursos na nuvem que exijam custos.

**Cenários de Aceite**:
1. **Dado** um novo clone do repositório, **Quando** o desenvolvedor inicia o sistema sem especificar um perfil, **Então** o sistema assume o perfil `dev` por padrão.
2. **Dado** o perfil `dev`, **Então** a aplicação conecta-se automaticamente aos serviços locais padrão (ex: banco no docker local e API rodando localmente).

---

### História de Usuário 2 - Sobrescrita de Configurações Locais (dev.local) (Prioridade: P2)

Alguns desenvolvedores podem precisar apontar seus serviços locais para bancos de dados de teste específicos ou rodar instâncias em portas diferentes, sem o risco de comitar essas mudanças e quebrar o ambiente do resto do time.

**Cenários de Aceite**:
1. **Dado** o ambiente local de um desenvolvedor, **Quando** ele define overrides em um perfil `dev.local` (arquivos de ambiente ou de propriedades), **Então** a aplicação mescla as configurações, dando prioridade aos valores do `dev.local`.
2. **Dado** o fluxo normal de commits, **Quando** o desenvolvedor executa comandos do `git`, **Então** os arquivos do perfil `dev.local` são ignorados (untracked) com segurança.

---

### História de Usuário 3 - Perfis de Nuvem (hml e prd) (Prioridade: P1)

A aplicação deve comportar-se de maneira segura e isolada em ambientes na nuvem, conectando os serviços corretamente.

**Cenários de Aceite**:
1. **Dado** o ambiente de Homologação (HML), **Quando** a aplicação for iniciada com o perfil `hml`, **Então** ela conecta-se aos recursos de infraestrutura publicados correspondentes à homologação.
2. **Dado** o ambiente de Produção (PRD), **Quando** a aplicação for iniciada, **Então** ela DEVE obrigatoriamente consumir credenciais via variáveis de ambiente, usando as variáveis nativas por padrão e sem depender de segredos nos arquivos de configuração.

## Requisitos *(obrigatório)*

### Requisitos Funcionais

- **FR-001**: O sistema DEVE implementar e suportar estritamente a seguinte hierarquia de configurações (aplicável a backend e frontend):
  - **base**: Configurações básicas e comuns compartilhadas entre todos os perfis.
  - **dev** (padrão): Aponta para versões locais do repositório (banco via docker, backend local). É o *fallback* se nada for especificado.
  - **dev.local** (override): Permite mudar URLs de banco e/ou backend no ambiente do desenvolvedor, devendo ser explicitamente ignorado pelo versionamento de código (Git).
  - **hml**: Versão contendo banco de dados e backend na nuvem em estado de staging/homologação.
  - **prd**: Versão de produção que utiliza variáveis de ambiente do SO/Contêiner por padrão para conexões e segredos.
- **FR-002**: O backend DEVE executar scripts de migração estrutural (ex: Flyway) automaticamente na subida dos perfis `dev`, `dev.local` e `hml`. Para o perfil `prd`, a execução no boot DEVE ser desativada, e a migração será executada como um passo explícito no pipeline de CI/CD.
- **FR-003**: Segredos e credenciais de bancos de dados remotos NUNCA devem estar contidos em texto puro em repositório; o ambiente `prd` DEVE falhar (fail-fast) se essas variáveis não forem providas na inicialização.

### Entidades Principais

*(N/A - Esta feature lida apenas com arquitetura de configuração, infraestrutura e deployment).*

## Critérios de Sucesso *(obrigatório)*

### Resultados Mensuráveis

- **SC-001**: A aplicação sobe no perfil `dev` com sucesso apenas rodando o comando padrão de start, sem exigir flags extras de ambiente.
- **SC-002**: Tentar realizar um commit (usando `git add .`) nunca rastreia ou inclui alterações feitas em configs atreladas ao perfil `dev.local`.
- **SC-003**: O ambiente de produção interrompe o boot em menos de 5 segundos se variáveis cruciais (como URL de DB ou Secrets) estiverem ausentes.

## Suposições

- As plataformas de nuvem alvo (Render, Vercel) fornecem suporte nativo injetando variáveis de ambiente em tempo de execução para preencher os valores necessários em `prd`.
