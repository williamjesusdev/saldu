# Feature Specification: Autenticação e Gestão de Acesso

**Feature Branch**: `002-user-auth`

**Created**: Julho 2026

**Status**: Draft

**Input**: User description: "Autenticação por e-mail e senha, com alteração de senha. Acesso controlado por convite (token, convite direto, ou cadastro aberto com aprovação). Único papel de admin para gerenciar acessos. Isolamento multi-tenant (subscription por usuário)."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Cadastro e Isolamento (Priority: P1)

Como um novo usuário convidado (via e-mail ou token), eu quero me cadastrar usando e-mail e senha, para que eu possa ter meu ambiente financeiro isolado e privado (minha própria subscription).

**Why this priority**: É a base do produto multi-tenant. Sem isolamento de dados e autenticação segura, outras funcionalidades não podem existir de forma confiável.

**Independent Test**: Pode ser testado criando um novo usuário e verificando no banco se a ele foi assinalada uma `subscription_id` única, garantindo que ele consiga fazer login com sucesso.

**Acceptance Scenarios**:

1. **Given** um token de convite válido, **When** eu preencho e-mail, senha e nome e submeto, **Then** minha conta é criada com minha própria subscription e eu sou redirecionado para a plataforma autenticado.
2. **Given** um formulário de cadastro, **When** eu informo uma senha fraca (ex: sem letras maiúsculas), **Then** eu vejo um erro de validação.

---

### User Story 2 - Login e Recuperação/Alteração de Senha (Priority: P1)

Como um usuário existente, eu quero fazer login com e-mail e senha, e poder alterar minha senha no futuro, para manter minha conta segura e acessível.

**Why this priority**: Usuários precisam conseguir retornar à plataforma e gerenciar a segurança da própria conta.

**Independent Test**: Pode ser testado fazendo login com uma conta recém-criada e posteriormente usando o fluxo de alteração de senha autenticado.

**Acceptance Scenarios**:

1. **Given** credenciais válidas, **When** eu submeto o formulário de login, **Then** eu acesso a plataforma e um JWT com meu `subscription_id` é armazenado.
2. **Given** o painel de configurações, **When** eu informo minha senha atual e a nova senha, **Then** a senha é atualizada com sucesso.

---

### User Story 3 - Gestão de Acesso Admin (Priority: P2)

Como administrador (Platform Admin), eu quero gerar links de convite e aprovar cadastros abertos, para controlar quem tem acesso à fase beta do produto.

**Why this priority**: O sistema é fechado. O admin precisa de uma forma autônoma de trazer novos usuários sem mexer no banco de dados.

**Independent Test**: Pode ser testado logando como admin, gerando um token de convite e utilizando-o anonimamente para criar uma conta.

**Acceptance Scenarios**:

1. **Given** o painel admin, **When** eu solicito a geração de um novo convite, **Then** recebo um link com um token de uso único.
2. **Given** um usuário que se cadastrou sem convite (via fila de aprovação), **When** eu aprovo o cadastro no painel admin, **Then** o usuário recebe acesso liberado à plataforma.

### Edge Cases

- **Token expirado ou inválido**: Se um usuário tentar usar um link de convite expirado, já utilizado ou inválido, o sistema deve bloquear o acesso ao formulário de cadastro e exibir mensagem clara.
- **E-mail já cadastrado**: Se um usuário tentar se cadastrar (via convite ou fila) com um e-mail já existente, o sistema não deve revelar a existência no endpoint público para evitar enumeração de contas, mas deve falhar amigavelmente.
- **Aprovação pendente**: Usuários na fila de aprovação que tentarem fazer login receberão erro 401 "Account pending approval".

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema DEVE autenticar usuários exclusivamente via e-mail e senha usando JWT.
- **FR-002**: O sistema DEVE garantir o isolamento absoluto de dados atrelando cada novo usuário a uma `subscription_id` própria no momento do cadastro.
- **FR-003**: O sistema DEVE validar senhas com no mínimo 8 caracteres, exigindo pelo menos 1 letra maiúscula e 1 número.
- **FR-004**: O sistema DEVE suportar um papel fixo de `platformAdmin` para o dono do produto.
- **FR-005**: O sistema DEVE permitir cadastro apenas via token de convite válido OU através de aprovação manual do admin (cadastro aberto pendente).
- **FR-006**: O sistema DEVE invalidar tokens de convite após o primeiro uso bem-sucedido.
- **FR-007**: O sistema DEVE permitir que um usuário autenticado altere sua própria senha mediante validação da senha atual.
- **FR-008**: O admin DEVE poder gerar tokens de convite (validade 7 dias).
- **FR-009**: O admin DEVE poder aprovar/recusar cadastros abertos.
- **FR-010**: O sistema DEVE propagar subscription_id via JWT claim → ThreadLocal → Hibernate filter
- **FR-011**: O sistema DEVE implementar Row-Level Security no Postgres
- **FR-012**: O sistema DEVE registrar tentativas de login (sucesso e falha) para auditoria via AuditService centralizado e reutilizável, inicialmente via console/stdout (SLF4J)
- **FR-013**: O sistema DEVE coletar consentimento explícito do usuário antes do primeiro uso (LGPD)
- **FR-014**: O sistema DEVE registrar timestamp do consentimento no registro do usuário
- **FR-015**: O sistema DEVE garantir que o AuditService seja extensível para armazenamento futuro em banco de dados
- **FR-016**: O código DEVE seguir princípios DRY, SOLID e KISS em toda a aplicação, verificado por revisão dedicada

### Key Entities

- **User**: Representa o indivíduo que acessa o sistema. Carrega credenciais, dados básicos de perfil e a flag de `platformAdmin`.
- **Subscription**: Representa o ambiente (tenant) do usuário. Todo o isolamento financeiro deriva dessa entidade.
- **InviteToken**: Entidade que armazena tokens de uso único gerados pelo admin para permitir cadastros externos.
- **AccessRequest**: Representa um pedido de cadastro na fila de espera, aguardando aprovação do admin.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Tempo médio para criação e autenticação de um novo usuário via convite é inferior a 1 minuto.
- **SC-002**: Tentativas de acesso cross-tenant (usuário A tentando ler dados do usuário B via manipulação de requisição) resultam 100% das vezes em erro 403 (Forbidden) ou 404 (Not Found).
- **SC-003**: Nenhuma senha é exposta em texto plano em logs, requisições HTTP (responses) ou banco de dados (hash forte via BCrypt ou Argon2).
- **SC-004**: Admin consegue gerar convite e compartilhar link em menos de 30 segundos.
- **SC-005**: Token de convite expira automaticamente após 7 dias sem intervenção manual.
- **SC-006**: Zero violações de DRY, SOLID e KISS identificadas na revisão de código.

## Assumptions

- O primeiro admin (dono do produto) será criado via script de seed/fixtura, não via fluxo de convite.
- O projeto não terá Single Sign-On (Google/Apple) no MVP, apenas e-mail e senha.
- A comunicação transacional por e-mail (envio de confirmações) será integrada no futuro (ex: AWS SES/Resend), mas no MVP inicial o foco é geração de links e aprovação via painel (copiar link/aprovar).
- A sessão será mantida no frontend usando Cookies HTTP-Only ou armazenamento seguro com base em JWT de tempo curto de vida + Refresh Token.
- LGPD: consentimento explícito será coletado no primeiro login após cadastro.
- Rate limiting será implementado via filtro customizado usando algoritmo sliding window (ex: 5 requests por minuto).
