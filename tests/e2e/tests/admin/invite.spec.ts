import { expect, test } from '../utils/coverage-fixture';
import { TEST_ADMIN_EMAIL, loginProgrammatically, setupBrowserState } from '../utils/test-helpers';

test.describe('Admin Invites E2E Flow', () => {
  test.beforeEach(async ({ page, request }) => {
    const token = await loginProgrammatically(request, TEST_ADMIN_EMAIL);
    await setupBrowserState(page, token);
  });

  test('User can navigate to admin invites page and generate invite', async ({ page }) => {
    const invitesPromise = page.waitForResponse(
      (req) => req.url().includes('/api/v1/admin/invites') && req.request().method() === 'GET',
    );
    await page.goto('/admin/invites');

    const invitesResponse = await invitesPromise;
    expect(invitesResponse.status()).toBe(200);

    await expect(page.getByText(/Painel Admin|Gestão de Convites/)).toBeVisible();

    const emailInput = page.getByTestId('email');
    if (await emailInput.isVisible()) {
      await emailInput.fill(`new-invite-${Date.now()}@saldu.com`);
    }

    const postInvitePromise = page.waitForResponse(
      (req) => req.url().includes('/api/v1/admin/invites') && req.request().method() === 'POST',
    );
    await page.getByTestId('btnSubmit').click();

    const postResponse = await postInvitePromise;
    expect(postResponse.status()).toBe(201);
  });
});
