import { expect, test } from '../utils/coverage-fixture';
import {
  API_URL,
  TEST_ADMIN_EMAIL,
  csrfHeaders,
  loginProgrammatically,
} from '../utils/test-helpers';

test.describe('Registration E2E Flow', () => {
  test('User can navigate to register page and submit registration request', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByText('Acessar Saldu')).toBeVisible();

    const forgotLink = page.getByTestId('registerLink');
    await forgotLink.isVisible();
    await forgotLink.click();

    await expect(page).toHaveURL(/register/);
    await expect(page.getByText('Criar sua conta no Saldu')).toBeVisible();

    await page.getByTestId('name').fill('Teste E2E');
    await page.getByTestId('email').fill(`e2e_register_${Date.now()}@saldu.com`);
    await page.getByTestId('password').fill('Password123!');

    const responsePromise = page.waitForResponse(
      (req) => req.url().includes('/api/v1/auth/register') && req.request().method() === 'POST',
    );
    await page.getByTestId('btnSubmit').click();

    const response = await responsePromise;
    expect(response.status()).toBe(201);

    await expect(page.getByText(/sucesso|enviado|solicitação/i)).toBeVisible();
  });

  test('User can register via invite token and is redirected to login', async ({
    page,
    request,
  }) => {
    const token = await loginProgrammatically(request, TEST_ADMIN_EMAIL);
    const inviteEmail = `invited_${Date.now()}@saldu.com`;
    const inviteResponse = await request.post(`${API_URL}/api/v1/admin/invites`, {
      headers: csrfHeaders({ Authorization: `Bearer ${token}` }),
      data: { email: inviteEmail },
    });
    const inviteData = await inviteResponse.json();
    const inviteToken = inviteData.token;

    await page.goto(`/register?token=${inviteToken}`);
    await expect(page.getByText('Criar sua conta no Saldu')).toBeVisible();

    await page.getByTestId('name').fill('Invited User');
    await page.getByTestId('email').fill(inviteEmail);
    await page.getByTestId('password').fill('Password123!');

    const acceptResponsePromise = page.waitForResponse(
      (req) =>
        req.url().includes('/api/v1/auth/invite/accept') && req.request().method() === 'POST',
    );
    await page.getByTestId('btnSubmit').click();

    const acceptResponse = await acceptResponsePromise;
    expect(acceptResponse.status()).toBe(201);

    await expect(page).toHaveURL(/login/);
  });
});
