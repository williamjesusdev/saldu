import { expect, test } from '../utils/coverage-fixture';
import {
  API_URL,
  TEST_SETTINGS_USER_EMAIL,
  TEST_USER_CREDENTIAL,
  csrfHeaders,
  loginProgrammatically,
  setupBrowserState,
  setupTestUser,
} from '../utils/test-helpers';

test.describe.serial('User Settings E2E Flow', () => {
  test.beforeEach(async ({ page, request }) => {
    await setupTestUser(request, TEST_SETTINGS_USER_EMAIL, 'E2E Settings User');
    const token = await loginProgrammatically(
      request,
      TEST_SETTINGS_USER_EMAIL,
      TEST_USER_CREDENTIAL,
    );
    await setupBrowserState(page, token);
  });

  test('User can submit consent and is redirected to dashboard', async ({ page }) => {
    await page.goto('/consent');
    await expect(page.getByText('Termos de Uso & Consentimento LGPD')).toBeVisible();

    const checkbox = page.getByTestId('chkConsent');
    const confirmButton = page.getByTestId('btnConsent');

    await expect(confirmButton).toBeDisabled();
    await checkbox.check();
    await expect(confirmButton).toBeEnabled();

    const consentPromise = page.waitForResponse(
      (req) => req.url().includes('/api/v1/users/me/consent') && req.request().method() === 'POST',
    );
    await confirmButton.click();

    const response = await consentPromise;
    expect(response.status()).toBe(204);

    await expect(page).toHaveURL(/dashboard/);
  });

  test('User can navigate to dashboard and view profile data', async ({ page }) => {
    const profilePromise = page.waitForResponse(
      (req) => req.url().includes('/api/v1/users/me') && req.request().method() === 'GET',
    );
    await page.goto('/dashboard');

    const response = await profilePromise;
    expect(response.status()).toBe(200);

    await expect(page.getByText('E2E Settings User')).toBeVisible();
  });

  test('User can update password via settings', async ({ page, request }) => {
    await page.goto('/settings');

    await page.getByTestId('currentPassword').fill(TEST_USER_CREDENTIAL);
    await page.getByTestId('newPassword').fill('NewSecret123!');

    const passwordPromise = page.waitForResponse(
      (req) => req.url().includes('/api/v1/users/me/password') && req.request().method() === 'POST',
    );
    await page.getByTestId('btnSubmit').click();

    const response = await passwordPromise;
    expect(response.status()).toBe(200);

    await expect(page.getByText(/sucesso|atualizada|success|updated/i)).toBeVisible();

    const loginRes = await request.post(`${API_URL}/api/v1/auth/login`, {
      data: { email: TEST_SETTINGS_USER_EMAIL, password: 'NewSecret123!' },
    });
    expect(loginRes.ok()).toBeTruthy();
    const tokenAfterChange = (await loginRes.json()).token;

    const restoreRes = await request.post(`${API_URL}/api/v1/users/me/password`, {
      headers: csrfHeaders({ Authorization: `Bearer ${tokenAfterChange}` }),
      data: {
        currentPassword: 'NewSecret123!',
        newPassword: TEST_USER_CREDENTIAL,
      },
    });
    expect(restoreRes.ok()).toBeTruthy();
  });

  test('User can submit account deletion and is redirected to login', async ({ page }) => {
    await page.goto('/settings');

    await page.getByTestId('btnDelete').click();

    const confirmDelete = page.getByTestId('btnDeleteConfirm');
    if (await confirmDelete.isVisible()) {
      const deletePromise = page.waitForResponse(
        (req) => req.url().includes('/api/v1/users/me') && req.request().method() === 'DELETE',
      );
      await confirmDelete.click();

      const response = await deletePromise;
      expect(response.status()).toBe(204);
    }

    await expect(page).toHaveURL(/login/);
  });
});
