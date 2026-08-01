import { APIRequestContext, expect, Page } from '@playwright/test';

const API_URL = process.env.E2E_API_URL || 'http://localhost:8080';
const WEB_URL = process.env.E2E_WEB_URL || 'http://localhost:3000';

const TEST_SUBSCRIPTION_ID = '00000000-0000-0000-0000-000000000000';
const TEST_USER_CREDENTIAL = 'E2eSecret!123';
const TEST_USER_EMAIL = 'e2e-user@saldu.com';
const TEST_ADMIN_EMAIL = 'e2e-admin@saldu.com';
const TEST_SETTINGS_USER_EMAIL = 'e2e-settings-user@saldu.com';

const ENDPOINTS = {
  LOGIN: `${API_URL}/api/v1/auth/login`,
  ADMIN_INVITES: `${API_URL}/api/v1/admin/invites`,
  ACCEPT_INVITE: `${API_URL}/api/v1/auth/invite/accept`,
} as const;

export {
  API_URL,
  TEST_ADMIN_EMAIL,
  TEST_SETTINGS_USER_EMAIL,
  TEST_SUBSCRIPTION_ID,
  TEST_USER_CREDENTIAL,
  TEST_USER_EMAIL,
  WEB_URL,
};

export async function loginProgrammatically(
  request: APIRequestContext,
  email: string = TEST_USER_EMAIL,
  password: string = TEST_USER_CREDENTIAL,
): Promise<string> {
  const response = await request.post(ENDPOINTS.LOGIN, {
    data: { email, password },
  });

  if (!response.ok()) {
    const errorText = await response.text();
    console.error(`Login failed for ${email}: ${response.status()} ${errorText}`);
  }

  expect(response.ok()).toBeTruthy();
  const data = await response.json();
  return data.token;
}

export async function setupBrowserState(page: Page, token: string) {
  await page.context().addCookies([{ name: 'saldu-token', value: token, url: WEB_URL }]);

  await page.addInitScript(() => {
    localStorage.setItem('isAuthenticated', 'true');
  });
}

export async function setupTestUser(
  request: APIRequestContext,
  email: string,
  name: string = 'E2E User',
): Promise<string> {
  const loginRes = await request.post(ENDPOINTS.LOGIN, {
    data: { email, password: TEST_USER_CREDENTIAL },
  });

  if (loginRes.ok()) {
    const data = await loginRes.json();
    return data.token;
  }

  const adminToken = await loginProgrammatically(request, TEST_ADMIN_EMAIL, TEST_USER_CREDENTIAL);

  const inviteRes = await request.post(ENDPOINTS.ADMIN_INVITES, {
    headers: { Authorization: `Bearer ${adminToken}` },
    data: { email },
  });

  const inviteData = await inviteRes.json();
  await request.post(ENDPOINTS.ACCEPT_INVITE, {
    data: {
      name,
      email,
      password: TEST_USER_CREDENTIAL,
      token: inviteData.token,
    },
  });

  return loginProgrammatically(request, email, TEST_USER_CREDENTIAL);
}
