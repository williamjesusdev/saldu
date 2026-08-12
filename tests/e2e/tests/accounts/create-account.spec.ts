import { expect, test } from '../utils/coverage-fixture';
import {
  loginProgrammatically,
  setupBrowserState,
  TEST_USER_CREDENTIAL,
  TEST_USER_EMAIL,
} from '../utils/test-helpers';

test.describe('Account Creation E2E Flow', () => {
  test.beforeEach(async ({ page, request }) => {
    const token = await loginProgrammatically(request, TEST_USER_EMAIL, TEST_USER_CREDENTIAL);
    await setupBrowserState(page, token);
  });

  test('User can create a new bank account with all fields', async ({ page }) => {
    await page.goto('/accounts/new');

    await expect(page.getByRole('heading', { name: 'Nova Conta' })).toBeVisible();

    await page.getByTestId('name').fill('Minha Conta Nubank');
    await page.getByTestId('institution').selectOption('NUBANK');
    await page.getByTestId('type').selectOption('CHECKING');
    await page.getByTestId('initialBalance').fill('100.00');
    await page.getByTestId('creditLimit').fill('500.00');

    await page.getByTestId('ignoreInTotals').check();

    const responsePromise = page.waitForResponse(
      (req) => req.url().includes('/api/v1/accounts') && req.request().method() === 'POST',
    );

    await page.getByTestId('btnSubmit').click();

    const response = await responsePromise;
    expect(response.status()).toBe(201);

    await expect(page).toHaveURL(/accounts(\?.*)?$/);

    await expect(page.getByText(/sucesso|criada/i)).toBeVisible();
  });

  test('User sees validation error when submitting without required name', async ({ page }) => {
    await page.goto('/accounts/new');

    await expect(page.getByRole('heading', { name: 'Nova Conta' })).toBeVisible();

    await page.getByTestId('btnSubmit').click();

    await expect(page.getByText('Nome é obrigatório')).toBeVisible();
  });
});
