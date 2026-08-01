import { expect, test } from '../utils/coverage-fixture';
import { TEST_USER_CREDENTIAL, TEST_USER_EMAIL } from '../utils/test-helpers';

test.describe('Login E2E Flow', () => {
  test('User can submit login and is redirected to consent or dashboard', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByText('Acessar Saldu')).toBeVisible();

    await page.getByTestId('email').fill(TEST_USER_EMAIL);
    await page.getByTestId('password').fill(TEST_USER_CREDENTIAL);

    const responsePromise = page.waitForResponse(
      (req) => req.url().includes('/api/v1/auth/login') && req.request().method() === 'POST',
    );
    await page.getByTestId('btnSubmit').click();

    const response = await responsePromise;
    expect(response.status()).toBe(200);

    await expect(page).toHaveURL(/consent|dashboard/);
  });

  test('User sees error with invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.getByTestId('email').fill('wrongemail@saldu.com');
    await page.getByTestId('password').fill('wrongpassword');

    const responsePromise = page.waitForResponse(
      (req) => req.url().includes('/api/v1/auth/login') && req.request().method() === 'POST',
    );
    await page.getByTestId('btnSubmit').click();

    const response = await responsePromise;
    expect(response.status()).toBe(401);

    await expect(page.getByText(/invalid|pending|inválidas|pendente/i)).toBeVisible();
  });

  test('User can logout via Header and session is destroyed', async ({ page }) => {
    await page.goto('/login');
    await page.getByTestId('email').fill(TEST_USER_EMAIL);
    await page.getByTestId('password').fill(TEST_USER_CREDENTIAL);
    await page.getByTestId('btnSubmit').click();
    await expect(page).toHaveURL(/consent|dashboard/);

    const logoutPromise = page.waitForResponse(
      (req) => req.url().includes('/api/v1/auth/logout') && req.request().method() === 'POST',
    );
    await page.getByTestId('btnLogout').click();

    const response = await logoutPromise;
    expect(response.status()).toBe(204);

    await page.goto('/dashboard');
    await expect(page).toHaveURL(/login/);
  });
});
