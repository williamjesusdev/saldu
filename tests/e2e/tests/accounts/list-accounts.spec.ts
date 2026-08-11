import { expect, test } from '../utils/coverage-fixture';
import {
  API_URL,
  loginProgrammatically,
  setupBrowserState,
  TEST_USER_CREDENTIAL,
  TEST_USER_EMAIL,
} from '../utils/test-helpers';

test.describe('Account Listing E2E Flow', () => {
  let userToken: string;
  const uniqueId = Date.now();
  const normalAccountName = `Conta Corrente Inter ${uniqueId}`;
  const ignoredAccountName = `Poupança Secreta ${uniqueId}`;

  test.beforeEach(async ({ page, request }) => {
    userToken = await loginProgrammatically(request, TEST_USER_EMAIL, TEST_USER_CREDENTIAL);
    await setupBrowserState(page, userToken);

    // Create a normal account for testing
    await request.post(`${API_URL}/api/v1/accounts`, {
      headers: { Authorization: `Bearer ${userToken}` },
      data: {
        name: normalAccountName,
        institution: 'OTHER',
        type: 'CHECKING',
        initialBalance: 1500.5,
        creditLimit: 0,
        ignoreInTotals: false,
        investmentAccount: false,
      },
    });

    // Create an ignored account for testing
    await request.post(`${API_URL}/api/v1/accounts`, {
      headers: { Authorization: `Bearer ${userToken}` },
      data: {
        name: ignoredAccountName,
        institution: 'BB',
        type: 'SAVINGS',
        initialBalance: 5000.0,
        creditLimit: 0,
        ignoreInTotals: true,
        investmentAccount: false,
      },
    });
  });

  test('User can view a list of accounts with balances and logos', async ({ page }) => {
    await page.goto('/accounts');

    // Wait for the heading
    await expect(page.getByRole('heading', { name: 'Contas bancárias' })).toBeVisible();

    // Validate the normal account
    const normalAccountItem = page.locator('li').filter({ hasText: normalAccountName });
    await expect(normalAccountItem).toBeVisible();
    await expect(normalAccountItem.getByText('1.500,50')).toBeVisible();
    await expect(normalAccountItem.locator('img[alt="OTHER logo"]')).toBeVisible();

    // Validate the ignored account
    const ignoredAccountItem = page.locator('li').filter({ hasText: ignoredAccountName });
    await expect(ignoredAccountItem).toBeVisible();
    await expect(ignoredAccountItem.getByText('5.000,00')).toBeVisible();
    await expect(ignoredAccountItem.getByText('Ignorada')).toBeVisible();
    await expect(ignoredAccountItem.locator('img[alt="BB logo"]')).toBeVisible();
  });
});
