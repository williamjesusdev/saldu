import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import AdminInvitesPage from '@/app/admin/invites/page';
import { useAuth } from '@/contexts/AuthContext';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/admin/invites',
}));

vi.mock('@/components/AuthGuard', () => ({
  AuthGuard: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(() => ({
    user: { role: 'PLATFORM_ADMIN' },
    isAuthenticated: true,
  })),
}));

describe('AdminInvitesPage Component', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());

    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('renders AdminInvitesPage correctly', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ title: 'Erro de conexão.' }), {
        status: 400,
        headers: { 'content-type': 'application/json' },
      }),
    );

    render(<AdminInvitesPage />);
    expect(await screen.findByText(/Gestão de Convites/i)).toBeInTheDocument();
    expect(screen.getByTestId('btnSubmit')).toBeInTheDocument();

    expect(await screen.findByText(/Nenhum token ativo no momento./i)).toBeInTheDocument();
    consoleSpy.mockRestore();
  });

  it('handles successful invite generation', async () => {
    const user = userEvent.setup();

    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({ content: null, page: { number: 0, totalPages: 1, size: 20 } }),
        {
          headers: { 'content-type': 'application/json' },
        },
      ),
    );

    render(<AdminInvitesPage />);

    await screen.findByText(/Nenhum token ativo no momento./i);

    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          id: 'uuid-1',
          token: 'NEW-TOKEN-123',
          email: 'invite@test.com',
          expiresAt: new Date().toISOString(),
          used: true,
        }),
        { headers: { 'content-type': 'application/json' } },
      ),
    );

    await user.type(screen.getByTestId('email'), 'invite@test.com');
    await user.click(screen.getByTestId('btnSubmit'));

    await waitFor(() => {
      expect(screen.getByText('NEW-TOKEN-123')).toBeInTheDocument();
    });
  });

  it('handles API error gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const user = userEvent.setup();

    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ content: [], page: { number: 0, totalPages: 1, size: 20 } }), {
        headers: { 'content-type': 'application/json' },
      }),
    );

    render(<AdminInvitesPage />);
    await screen.findByText(/Nenhum token ativo no momento./i);

    vi.mocked(fetch)
      .mockRejectedValueOnce(new Error('API error'))
      .mockRejectedValueOnce(new Error());

    await user.type(screen.getByTestId('email'), 'invite@test.com');
    await user.click(screen.getByTestId('btnSubmit'));

    await user.click(screen.getByTestId('btnSubmit'));

    await waitFor(() => {
      expect(screen.getByTestId('btnSubmit')).not.toBeDisabled();
    });

    expect(screen.queryByText('NEW-TOKEN-123')).not.toBeInTheDocument();
    consoleSpy.mockRestore();
  });

  it('handles successful token copy to clipboard', async () => {
    const user = userEvent.setup();

    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          content: [{ id: 'uuid-2', token: 'COPY-TOKEN-123', expiresAt: new Date().toISOString() }],
          page: { number: 0, totalPages: 1, size: 20 },
        }),
        { headers: { 'content-type': 'application/json' } },
      ),
    );

    render(<AdminInvitesPage />);

    const mockWriteText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: mockWriteText },
      writable: true,
      configurable: true,
    });

    const copyBtn = await screen.findByTestId('btnCopy');
    await user.click(copyBtn);

    expect(mockWriteText).toHaveBeenCalledWith('COPY-TOKEN-123');

    expect(await screen.findByText(/Copiado!/i)).toBeInTheDocument();

    await waitFor(
      () => {
        expect(copyBtn).toBeInTheDocument();
        expect(screen.queryByText(/Copiado!/i)).not.toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  });

  it('handles successful pagination', async () => {
    const user = userEvent.setup();

    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          content: [{ id: 'uuid-3', token: 'TOKEN-PAGE-1', expiresAt: new Date().toISOString() }],
          page: { number: 0, totalPages: 3, size: 20 },
        }),
        { headers: { 'content-type': 'application/json' } },
      ),
    );

    render(<AdminInvitesPage />);

    expect(await screen.findByText('TOKEN-PAGE-1')).toBeInTheDocument();

    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          content: [{ id: 'uuid-4', token: 'TOKEN-PAGE-2', expiresAt: new Date().toISOString() }],
          page: { number: 1, totalPages: 3, size: 20 },
        }),
        { headers: { 'content-type': 'application/json' } },
      ),
    );

    const nextBtn = screen.getByTestId('btnNext');
    await user.click(nextBtn);

    expect(await screen.findByText('TOKEN-PAGE-2')).toBeInTheDocument();

    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          content: [{ id: 'uuid-3', token: 'TOKEN-PAGE-1', expiresAt: new Date().toISOString() }],
          page: { number: 0, totalPages: 3, size: 20 },
        }),
        { headers: { 'content-type': 'application/json' } },
      ),
    );

    const prevBtn = screen.getByTestId('btnPrev');
    await user.click(prevBtn);

    expect(await screen.findByText('TOKEN-PAGE-1')).toBeInTheDocument();
  });

  it('handles network error gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    vi.mocked(fetch).mockRejectedValueOnce(new Error('Fetch error'));

    render(<AdminInvitesPage />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));
    });
    consoleSpy.mockRestore();
  });

  it('handles successful invite refresh', async () => {
    const user = userEvent.setup();

    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ content: [], page: { number: 0, totalPages: 1, size: 20 } }), {
        headers: { 'content-type': 'application/json' },
      }),
    );

    render(<AdminInvitesPage />);

    await screen.findByText(/Nenhum token ativo no momento./i);

    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          content: [
            { id: 'uuid-5', token: 'REFRESHED-TOKEN', expiresAt: new Date().toISOString() },
          ],
          page: { number: 0, totalPages: 1, size: 20 },
        }),
        { headers: { 'content-type': 'application/json' } },
      ),
    );

    const refreshBtn = screen.getByTestId('btnRefresh');
    await user.click(refreshBtn);

    expect(await screen.findByText('REFRESHED-TOKEN')).toBeInTheDocument();
  });

  it('handles successful filter change', async () => {
    const user = userEvent.setup();

    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ content: [], page: { number: 0, totalPages: 1, size: 20 } }), {
        headers: { 'content-type': 'application/json' },
      }),
    );

    render(<AdminInvitesPage />);

    await screen.findByText(/Nenhum token ativo no momento./i);

    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          content: [{ id: 'uuid-5', token: 'PENDING-TOKEN', expiresAt: new Date().toISOString() }],
          page: { number: 0, totalPages: 1, size: 20 },
        }),
        { headers: { 'content-type': 'application/json' } },
      ),
    );

    const statusFilterSelect = screen.getByTestId('selStatusFilter');
    await user.selectOptions(statusFilterSelect, 'PENDING');

    expect(await screen.findByText('PENDING-TOKEN')).toBeInTheDocument();
  });

  it('does not fetch invites if not authenticated', async () => {
    const user = userEvent.setup();
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
      checkAuth: vi.fn(),
    });

    render(<AdminInvitesPage />);

    const refreshBtn = screen.getByTestId('btnRefresh');
    await user.click(refreshBtn);

    expect(fetch).not.toHaveBeenCalled();
  });
});
