# Feature Specification: Auth & Security Refactor

**Feature Branch**: `[004-auth-security-refactor]`

**Created**: 2026-08-11

**Status**: Draft

**Input**: User description: "analise o backlog e determine como podemos atuar nele para correta completude, antes de continuar com os vertical slices e a base se torne maior" (Refatoração estrutural do módulo 002-user-auth e segurança CSRF).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Extração de Componentes e Validação com Zod (Priority: P1)

Como um desenvolvedor da plataforma Saldu, desejo que as páginas de autenticação (`login` e `register`) estejam aderentes ao padrão de Vertical Slices e validação rigorosa (Zod), para que a manutenibilidade do frontend permaneça previsível, segura e testável à medida que a base cresce.

**Why this priority**: É a fundação do frontend do projeto (Vertical Slices), padronizando a autenticação com as mesmas regras já implementadas em contas bancárias.

**Independent Test**: Pode ser testado executando a suíte de testes de UI e validando manualmente que o login e cadastro continuam funcionando perfeitamente sem erros visuais ou de roteamento, com os logs de validação Zod bloqueando inputs inválidos.

**Acceptance Scenarios**:

1. **Given** que o usuário preenche o formulário de login com dados inválidos, **When** ele tenta submeter, **Then** o formulário deve exibir mensagens de erro locais validadas via Zod, sem recarregar a página e sem realizar requests desnecessários à API.
2. **Given** que o usuário está na página de login, **When** inspecionamos o código fonte, **Then** os formulários devem estar extraídos para `apps/web/src/components/auth/LoginForm.tsx` e `RegisterForm.tsx`, mantendo `page.tsx` apenas para roteamento e montagem de layout (Server Components).

---

### User Story 2 - Ativação da Proteção CSRF (Priority: P1)

Como um analista de segurança, desejo que o sistema backend exija e valide um token CSRF legítimo para qualquer mutação de estado (POST, PUT, DELETE), e que o frontend envie esse token automaticamente via cabeçalhos seguros, para que o sistema esteja aderente ao padrão OWASP Defense in Depth e resolva o alerta estático de segurança do SonarQube.

**Why this priority**: Segurança da informação é um pilar não negociável do Saldu. Vulnerabilidades CSRF podem comprometer a integridade de dados financeiros e violar as regras de Auditoria e Privacidade.

**Independent Test**: Pode ser testado inspecionando os cabeçalhos de rede no navegador (o frontend envia o token corretamente) e tentando forjar um `POST` sem esse cabeçalho via ferramenta externa (ex: cURL), o qual o backend deverá rejeitar com erro de segurança.

**Acceptance Scenarios**:

1. **Given** uma requisição de mutação autêntica originada pela UI web, **When** o frontend faz a requisição, **Then** o cliente HTTP da aplicação deve ler o token do cookie CSRF e anexá-lo automaticamente ao cabeçalho.
2. **Given** uma tentativa de requisição de mutação sem o token CSRF válido, **When** a requisição atinge o backend, **Then** a requisição deve ser bloqueada com status `403 Forbidden` ou equivalente.

### Edge Cases

- O que acontece quando o cookie CSRF original não existe na primeira tentativa de requisição protegida? O frontend precisa de um endpoint prévio para emissão ou o interceptor gerenciará retentativas?
- Como o framework de UI se comporta ao exibir erros de schema customizados com Zod para campos não diretamente controlados no formulário?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST separar a camada interativa (estado, formulário, chamadas de API) das páginas do módulo `002-user-auth`, transferindo-as para a pasta dedicada de componentes.
- **FR-002**: O sistema MUST validar entradas de usuários no frontend nos formulários de autenticação usando schemas tipados e previsíveis.
- **FR-003**: O backend MUST reativar a proteção nativa de CSRF, expondo o token unicamente para leitura pelo script do mesmo domínio (Sem flag HttpOnly no cookie CSRF, mas mantendo a restrição no cookie de sessão primário).
- **FR-004**: O frontend MUST injetar automaticamente o cabeçalho anti-CSRF exigido pelo backend nas requisições mutáveis.

### Key Entities

N/A - Esta feature não introduz entidades de banco de dados novas, operando sobre componentes estruturais e middlewares de rede.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Refatoração concluída sem introduzir novas falhas — 100% da suíte de testes de E2E e unitários existentes continua executando com sucesso (Verde).
- **SC-002**: Relatório de análise estática de segurança atesta o fechamento da vulnerabilidade CSRF reportada (`java:S4502`).
- **SC-003**: Testes externos que não possuam o token CSRF têm taxa de bloqueio (Rejeição `4xx`) de 100%.

## Assumptions

- O comportamento da aplicação para o usuário final, visualmente e em experiência de uso, permanecerá o mesmo.
- Como se trata de um débito técnico focado em segurança e estrutura, terminologias técnicas (CSRF, cookies, headers) foram utilizadas em nível mais baixo que o convencional para clareza da solução técnica a ser planejada.
