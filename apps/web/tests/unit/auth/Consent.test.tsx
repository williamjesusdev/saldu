import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import ConsentPage from '@/app/(auth)/consent/page';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

vi.mock('@/components/AuthGuard', () => ({
  AuthGuard: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="auth-guard">{children}</div>
  ),
}));

describe('ConsentPage Component', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    mockPush.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders ConsentPage correctly', () => {
    render(<ConsentPage />);
    expect(screen.getByText(/Termos de Uso & Consentimento LGPD/i)).toBeInTheDocument();
    expect(screen.getByTestId('btnConsent')).toBeDisabled();
  });

  it('validates consent checking before submission', async () => {
    const user = userEvent.setup();
    render(<ConsentPage />);

    await user.click(screen.getByTestId('chkConsent'));
    expect(screen.getByTestId('chkConsent')).toBeChecked();
    expect(screen.getByTestId('btnConsent')).not.toBeDisabled();
  });

  it('handles successful consent and redirects', async () => {
    const user = userEvent.setup();
    render(<ConsentPage />);

    vi.mocked(fetch).mockResolvedValueOnce(new Response(JSON.stringify({})));

    await user.click(screen.getByTestId('chkConsent'));
    await user.click(screen.getByTestId('btnConsent'));

    await waitFor(() => {
      expect(screen.getByText(/Consentimento Registrado!/i)).toBeInTheDocument();
    });

    await waitFor(
      () => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard');
      },
      { timeout: 2000 },
    );
  });

  it('handles network error gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const user = userEvent.setup();
    render(<ConsentPage />);

    vi.mocked(fetch).mockRejectedValueOnce(new Error('Network Error'));

    await user.click(screen.getByTestId('chkConsent'));
    await user.click(screen.getByTestId('btnConsent'));

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));
    });

    expect(screen.getByTestId('btnConsent')).not.toBeDisabled();
    consoleSpy.mockRestore();
  });
});
