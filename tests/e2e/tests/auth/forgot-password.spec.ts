import { expect, test } from '../utils/coverage-fixture';
import { API_URL, setupTestUser } from '../utils/test-helpers';

test.describe('Forgot Password E2E Flow', () => {
  let resetEmail: string;

  test.beforeEach(async ({ request }) => {
    resetEmail = `e2e-reset-${Date.now()}@saldu.com`;
    await setupTestUser(request, resetEmail, 'E2E Reset User');
  });

  test('User can navigate to forgot password page and submit password reset request', async ({
    page,
  }) => {
    await page.goto('/login');
    await expect(page.getByText('Acessar Saldu')).toBeVisible();

    const forgotLink = page.getByTestId('forgotPasswordLink');
    await forgotLink.isVisible();
    await forgotLink.click();

    await expect(page).toHaveURL(/forgot-password/);
    await expect(page.getByText('Recuperar Senha')).toBeVisible();
    await page.getByTestId('email').fill(resetEmail);

    const responsePromise = page.waitForResponse(
      (req) =>
        req.url().includes('/api/v1/auth/password/reset') &&
        !req.url().includes('/verify') &&
        req.request().method() === 'POST',
    );
    await page.getByTestId('btnSubmit').click();

    const response = await responsePromise;
    expect(response.status()).toBe(200);
    await expect(page.getByTestId('messageSpan')).toHaveText(/email sent|email enviado|sucesso/i);
  });

  test('User can verify password reset token and update password using backdoor token endpoint', async ({
    page,
    request,
  }) => {
    await page.goto('/forgot-password');
    await page.getByTestId('email').fill(resetEmail);
    await page.getByTestId('btnSubmit').click();
    await expect(page.getByTestId('messageSpan')).toBeVisible();

    const tokenRes = await request.get(
      `${API_URL}/api/v1/_internal/e2e/password/reset/token?email=${encodeURIComponent(
        resetEmail,
      )}`,
    );
    expect(tokenRes.status()).toBe(200);
    const { token } = await tokenRes.json();
    expect(token).toBeTruthy();

    await page.goto(`/forgot-password?token=${token}&email=${encodeURIComponent(resetEmail)}`);
    await expect(page.getByRole('heading', { name: 'Redefinir Senha' })).toBeVisible();

    const newPassword = 'NewPass!123';
    await page.getByTestId('password').fill(newPassword);

    const verifyPromise = page.waitForResponse(
      (req) =>
        req.url().includes('/api/v1/auth/password/reset/verify') &&
        req.request().method() === 'POST',
    );
    await page.getByTestId('btnSubmit').click();

    const verifyResponse = await verifyPromise;
    expect(verifyResponse.status()).toBe(200);
    await expect(page.getByTestId('messageSpan')).toHaveText(
      /redefinida com sucesso|successfully/i,
    );

    await expect(page).toHaveURL(/login/);

    await page.getByTestId('email').fill(resetEmail);
    await page.getByTestId('password').fill(newPassword);
    await page.getByTestId('btnSubmit').click();

    await expect(page).toHaveURL(/consent|dashboard/);
  });
});
