import { expect, test } from '../utils/coverage-fixture';
import {
  API_URL,
  loginProgrammatically,
  setupBrowserState,
  TEST_USER_CREDENTIAL,
  TEST_USER_EMAIL
} from '../utils/test-helpers';

test.describe('Account Edit and Archive E2E Flow', () => {
  let userToken: string;
  let accountId: string;

  test.beforeEach(async ({ page, request }) => {
    userToken = await loginProgrammatically(request, TEST_USER_EMAIL, TEST_USER_CREDENTIAL);
    await setupBrowserState(page, userToken);

    const createRes = await request.post(`${API_URL}/api/v1/accounts`, {
      headers: { Authorization: `Bearer ${userToken}` },
      data: {
        name: 'Conta Corrente a Editar',
        institution: 'ITAU',
        type: 'CHECKING',
        initialBalance: 100.0,
        creditLimit: 0.0,
        ignoreInTotals: false,
        investmentAccount: false,
      },
    });
    const accountData = await createRes.json();
    accountId = accountData.id;
  });

  test('User can edit an existing bank account', async ({ page }) => {
    await page.goto(`/accounts/${accountId}/edit`);

    await expect(page.getByRole('heading', { name: 'Editar Conta' })).toBeVisible();

    await page.getByTestId('institution').selectOption('BB');
    await page.getByTestId('name').fill('Conta Corrente BB Atualizada');

    const responsePromise = page.waitForResponse(
      (req) =>
        req.url().includes(`/api/v1/accounts/${accountId}`) && req.request().method() === 'PUT',
    );

    await page.getByTestId('btnSubmit').click();

    const response = await responsePromise;
    expect([200, 204]).toContain(response.status());

    await expect(page).toHaveURL(/accounts/);

    await expect(page.getByText(/sucesso|atualizada/i).first()).toBeVisible();
  });

  test('User can archive an existing bank account', async ({ page }) => {
    await page.goto(`/accounts/${accountId}`);

    const archiveButton = page.getByTestId('btnArchive');
    await expect(archiveButton).toBeVisible();

    await archiveButton.click();

    const confirmButton = page.getByTestId('btnConfirmArchive');
    await expect(confirmButton).toBeVisible();

    const responsePromise = page.waitForResponse(
      (req) =>
        req.url().includes(`/api/v1/accounts/${accountId}`) && req.request().method() === 'DELETE',
    );

    await confirmButton.click();

    const response = await responsePromise;
    expect([200, 204]).toContain(response.status());

    await expect(page).toHaveURL(/accounts(\?.*)?$/);

    await expect(page.getByText(/arquivada|removida/i)).toBeVisible();
  });
});
