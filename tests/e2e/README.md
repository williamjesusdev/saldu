# Padrões de Testes E2E (Playwright)

Este documento estabelece o padrão rigoroso e coeso de nomenclatura, estrutura e ordem de execução para todas as suítes de teste de ponta a ponta (E2E) no Saldu usando Playwright.

## 1. Padrão de Nomenclatura das Suítes (`test.describe`)

Todo arquivo de teste E2E deve encapsular seus testes em um `test.describe` descrevendo o fluxo completo.

- **Fluxos Completos:** `test.describe('[NomeDoFluxo] E2E Flow', () => { ... })`
  - Exemplo: `test.describe('Login E2E Flow', () => { ... })`
  - Exemplo: `test.describe('Registration E2E Flow', () => { ... })`

Se os testes precisam ser executados em ordem estrita (ex: alterações de configurações no mesmo usuário), utilize `test.describe.serial`.

## 2. Ordem dos Testes e Padrão de Nomenclatura (`test`)

A ordem dos blocos `test` deve seguir a jornada real do usuário. Todas as strings devem estar em **Inglês**.

1. **Navegação e Interface (`navigates and renders...`)**:
   - `test('User can navigate to [page] and it renders correctly', ...)`
   - Verifica se os elementos essenciais da página carregam corretamente para um usuário logado ou deslogado.
2. **Validações Negativas / Segurança (`is redirected if...`, `sees error if...`)**:
   - `test('Anonymous user is redirected to login when accessing [page]', ...)`
   - `test('User sees error with invalid [data]', ...)`
   - Testa comportamentos de segurança, Guards, e mensagens de erro (ex: credenciais inválidas).
3. **Fluxos de Sucesso (`handles successful...`, `can submit...`)**:
   - `test('User can submit [action] and is redirected to [page]', ...)`
   - `test('User can [action]', ...)`
   - Fluxo feliz completo do usuário interagindo com o formulário, acionando a API e vendo os resultados.
4. **Fluxos Especiais / Alternativos (`can [action] via [alternative]`)**:
   - `test('User can register via invite token', ...)`

## 3. Estrutura de Interação com a API (AAA)

Os testes E2E devem sempre validar não apenas a interface, mas os status das requisições via `waitForResponse`.

```typescript
test("User can perform specific action", async ({ page }) => {
  // 1. Arrange: Navegação e Setup
  await page.goto("/page");
  await page.getByTestId("input").fill("data");

  // 2. Act: Prepara para interceptar a resposta e submete
  const responsePromise = page.waitForResponse(
    (req) =>
      req.url().includes("/api/v1/endpoint") &&
      req.request().method() === "POST",
  );
  await page.getByTestId("btnSubmit").click();

  // 3. Assert: Valida API e UI
  const response = await responsePromise;
  expect(response.status()).toBe(200);

  await expect(page.getByText(/success/i)).toBeVisible();
});
```

## 4. Setup e Mocks Globais

- **Banco de Dados Real:** O Playwright se conecta a um banco de dados real em background com Testcontainers.
- **`setupTestUser`:** Use sempre os helpers (`tests/utils/test-helpers.ts`) para autenticar programaticamente, gerar tokens ou preparar o ambiente.
- **Cookies:** Sempre injete o cookie `saldu_token` no contexto da página se o fluxo exigir um usuário logado previamente.
