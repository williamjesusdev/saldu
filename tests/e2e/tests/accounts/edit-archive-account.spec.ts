import { expect, test } from '../utils/coverage-fixture';
import {
  API_URL,
  loginProgrammatically,
  setupBrowserState,
  TEST_USER_CREDENTIAL,
  TEST_USER_EMAIL,
} from '../utils/test-helpers';

test.describe('Account Edit and Archive E2E Flow', () => {
  let userToken: string;
  let accountId: string;

  test.beforeEach(async ({ page, request }) => {
    userToken = await loginProgrammatically(request, TEST_USER_EMAIL, TEST_USER_CREDENTIAL);
    await setupBrowserState(page, userToken);

    // Create an account for testing
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

    // Wait for the form to be visible
    await expect(page.getByRole('heading', { name: 'Editar Conta' })).toBeVisible();

    // Change the institution
    await page.getByTestId('institution').selectOption('BB'); // Banco do Brasil

    // Change the account name
    await page.getByTestId('name').fill('Conta Corrente BB Atualizada');

    // Intercept the PUT API call
    const responsePromise = page.waitForResponse(
      (req) =>
        req.url().includes(`/api/v1/accounts/${accountId}`) && req.request().method() === 'PUT',
    );

    // Submit the form
    await page.getByTestId('btnSubmit').click();

    // Wait for the response and assert status
    const response = await responsePromise;
    expect([200, 204]).toContain(response.status());

    // Expect to be redirected to account details or accounts list
    await expect(page).toHaveURL(/accounts/);

    // Expect success message
    await expect(page.getByText(/sucesso|atualizada/i)).toBeVisible();
  });

  test('User can archive an existing bank account', async ({ page }) => {
    // Navigate directly to the details page of the account
    await page.goto(`/accounts/${accountId}`);

    // Ensure the archive/delete button is visible
    const archiveButton = page.getByTestId('btnArchive');
    await expect(archiveButton).toBeVisible();

    // Click on archive button
    await archiveButton.click();

    // Most systems have a confirmation dialog.
    // Wait for the confirmation modal/dialog and click confirm
    const confirmButton = page.getByTestId('btnConfirmArchive');
    await expect(confirmButton).toBeVisible();

    // Intercept the DELETE API call
    const responsePromise = page.waitForResponse(
      (req) =>
        req.url().includes(`/api/v1/accounts/${accountId}`) && req.request().method() === 'DELETE',
    );

    await confirmButton.click();

    // Wait for response
    const response = await responsePromise;
    expect([200, 204]).toContain(response.status());

    // Expect to be redirected back to the accounts list
    await expect(page).toHaveURL(/accounts(\?.*)?$/);

    // Expect success message
    await expect(page.getByText(/arquivada|removida/i)).toBeVisible();
  });
});
