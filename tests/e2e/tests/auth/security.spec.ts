import { expect, test } from '../utils/coverage-fixture';
import { TEST_USER_CREDENTIAL, TEST_USER_EMAIL } from '../utils/test-helpers';

test.describe('Security and Redirects E2E Flow', () => {
  test('Anonymous user is redirected to login when accessing /admin/invites', async ({ page }) => {
    await page.goto('/admin/invites');
    await expect(page).toHaveURL(/login/);
  });

  test('Anonymous user is redirected to login when accessing /dashboard', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/login/);
  });

  test('Anonymous user is redirected to login when accessing /settings', async ({ page }) => {
    await page.goto('/settings');
    await expect(page).toHaveURL(/login/);
  });

  test('Anonymous user is redirected to login when accessing /consent', async ({ page }) => {
    await page.goto('/consent');
    await expect(page).toHaveURL(/login/);
  });

  test('Normal user receives 403 Forbidden when accessing /admin/invites API', async ({ page }) => {
    await page.goto('/login');
    await page.getByTestId('email').fill(TEST_USER_EMAIL);
    await page.getByTestId('password').fill(TEST_USER_CREDENTIAL);
    await page.getByTestId('btnSubmit').click();
    await expect(page).toHaveURL(/consent|dashboard/);

    const apiPromise = page.waitForResponse(
      (req) => req.url().includes('/api/v1/admin/invites') && req.request().method() === 'GET',
    );
    await page.goto('/admin/invites');

    const response = await apiPromise;
    expect(response.status()).toBe(403);
  });
});
