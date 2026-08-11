# Technical Backlog & Technical Debt

Este arquivo rastreia o débito técnico arquitetural, pendências estruturais e melhorias de domínio que devem ser convertidas em tarefas ou issues para as próximas iterações.

---

## Pending Issues to Create

### 1. Frontend Architecture: Vertical Slices & Component Extraction
**Target Module:** `002-user-auth`  
**Description:**  
As páginas do módulo de autenticação (`login/page.tsx`, `register/page.tsx`) atualmente constroem toda a interface do usuário e o estado dos formulários diretamente dentro do próprio arquivo `page.tsx`. Para alinhar com o padrão escalável de Vertical Slices adotado no Saldu, devemos extrair a UI interativa e os formulários para componentes separados dentro de `apps/web/src/components/auth/` e manter os arquivos `page.tsx` estritamente para montagem de layout e roteamento.

**Acceptance Criteria:**
- Criar componentes `LoginForm`, `RegisterForm`, etc. em `apps/web/src/components/auth/`.
- Os arquivos `page.tsx` devem apenas montar a página e importar os componentes.
- Manter o comportamento e a identidade visual inalterados.

### 2. Frontend Validation: Standardize with Zod
**Target Module:** `002-user-auth`  
**Description:**  
O módulo de contas bancárias (`003-bank-accounts`) introduziu esquemas de validação type-safe utilizando a biblioteca Zod. O módulo mais antigo de autenticação (`002-user-auth`) ainda utiliza estado nativo e validação manual. Devemos padronizar os formulários de login e cadastro utilizando esquemas Zod.

**Acceptance Criteria:**
- Refatorar os formulários de Login e Cadastro para utilizar validação de payload com esquemas Zod.

### 3. Security Architecture: CSRF Protection Migration (OWASP Defense in Depth)
**Target Module:** `002-user-auth` / Core Security  
**Description:**  
Atualmente, o Saldu utiliza JWT via cookies `HttpOnly` com a diretiva `SameSite=Lax`. Embora mitigado contra ataques CSRF de origens cruzadas no navegador, o Spring Security possui o CSRF desativado (`http.csrf(AbstractHttpConfigurer::disable)`), gerando alertas estáticos no SonarQube (`java:S4502`). Conforme o estudo registrado em `docs/csrf-migration-evaluation.md`, deve-se adotar a **Rota B (OWASP Defense in Depth)** reativando o repositório de tokens CSRF no Spring Security.

**Acceptance Criteria:**
- Reativar a proteção CSRF no `SecurityConfig.java` utilizando `CookieCsrfTokenRepository.withHttpOnlyFalse()`.
- Atualizar o `apiClient.ts` no frontend (`apps/web`) para ler o cookie `XSRF-TOKEN` e anexar o cabeçalho `X-XSRF-TOKEN` em requisições de mutação (`POST`, `PUT`, `DELETE`).

---

## Next Iteration: Feature Expansions

### 1. Expansão do Catálogo de Bancos Brasileiros & Identidade Visual (Figma Kit)
**Target Module:** `004-bank-catalog-expansion` (Enhancement ao `003-bank-accounts`)  
**Description:**  
Atualmente, o cadastro de contas bancárias suporta um conjunto limitado de instituições (`BB`, `ITAU`, `NUBANK`, `OTHER`). É necessário expandir a enumeração e a interface de seleção para abranger o ecossistema bancário nacional completo, mapeando o kit de logotipos da comunidade Figma ([Brazilian Banks Logos](https://www.figma.com/design/41xSesKNMqUerhaVFdLOfm/Brazilian-Banks-Logos--Community-?node-id=1-54&t=KD2Ypjk7py9GBciB-1)).

**Instituições a Adicionar:**
- **Bancos Tradicionais**: Bradesco (`BRADESCO`), Santander (`SANTANDER`), Caixa Econômica Federal (`CAIXA`), Safra (`SAFRA`), Banrisul (`BANRISUL`).
- **Bancos Digitais & Neobanks**: Banco Inter (`INTER`), BTG Pactual (`BTG`), C6 Bank (`C6`), Banco Original (`ORIGINAL`), Neon (`NEON`), Will Bank (`WILL`), Mercado Pago (`MERCADO_PAGO`), PagBank (`PAGBANK`).
- **Cooperativas de Crédito**: Sicoob (`SICOOB`), Sicredi (`SICREDI`).
- **Corretoras & Meios de Pagamento**: XP Investimentos (`XP`), Stone (`STONE`).

**Acceptance Criteria:**
- Atualizar a enumeração no backend (`AccountType`/`InstitutionEnum`) e adicionar validações de suporte a novos códigos ISPB.
- Importar os SVGs de alta definição do Figma Kit para `apps/web/public/banks/` garantindo rendering responsivo em dark mode.
- Adicionar componente de autocompletar / busca por nome de instituição na UI (`CreateAccountForm` e `EditAccountForm`).
- Manter 100% de cobertura de testes unitários, integração e E2E.

---

## Architectural & Domain Discrepancies (Legacy vs 003-bank-accounts)

Durante a especificação e implementação do módulo `003-bank-accounts`, foram identificadas as seguintes divergências estruturais em relação ao baseline do projeto (`001-project-foundation` e `002-user-auth`):

### 1. Separação Estrita de Saldos e Limites (Cheque Especial)
- **Baseline Anterior (`001`/`002`)**: Previa-se um modelo genérico de saldo acumulativo.
- **Divergência em `003`**: Instituiu-se a separação obrigatória entre `initial_balance` (saldo real da conta) e `credit_limit` (limite extra/cheque especial). Foi imposta a regra de negócio de que o limite de crédito **jamais** deve ser somado ao saldo total do dashboard, sendo exibido unicamente na visão detalhada da conta.

### 2. Invariantes Financeiras & Não aos Valores Negativos
- **Baseline Anterior (`001`/`002`)**: DTOs de entrada não validavam explicitamente o sinal numérico de montantes financeiros.
- **Divergência em `003`**: Foi alinhada a regra dos 5 Mandamentos Absolutos. Adicionou-se a anotação `@PositiveOrZero` nos DTOs Java (`CreateAccountRequest` e `UpdateAccountRequest`) para barrar cadastros ou atualizações com saldos iniciais ou limites negativos, preservando o modelo Single-Entry MVP.

### 3. Padrão de Redirecionamento e Notificação de Sucesso (UX / E2E)
- **Baseline Anterior (`002`)**: O estado de mensagem de alerta (`message`) era mantido no componente da página de formulário antes do redirecionamento.
- **Divergência em `003`**: Como os formulários navegam imediatamente via `router.push()`, a notificação local era descartada com o unmount da página. Padronizou-se o repasse de parâmetros via query string (`/accounts?status=created`, `/accounts?status=archived` e `/accounts/[id]?status=updated`) e leitura centralizada por `useSearchParams()` na página de destino.

### 4. Proteção Física no Banco de Dados contra Soft-Deletes
- **Baseline Anterior (`002`)**: O arquivamento de usuários era controlado via aplicação preenchendo a coluna `deleted_at`.
- **Divergência em `003`**: Para garantir proteção inviolável contra exclusões acidentais ou comandos maliciosos, adicionou-se uma **trigger no PostgreSQL** (`trg_prevent_accounts_hard_delete`) que intercepta e lança exceção em qualquer instrução `DELETE FROM accounts`.
