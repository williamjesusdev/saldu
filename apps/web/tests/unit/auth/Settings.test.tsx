import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import SettingsPage from '@/app/(auth)/settings/page';

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

describe('SettingsPage Component', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    mockPush.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders SettingsPage correctly', () => {
    render(<SettingsPage />);
    expect(screen.getByText(/Configurações da Conta/i)).toBeInTheDocument();
    expect(screen.getByTestId('currentPassword')).toBeInTheDocument();
    expect(screen.getByTestId('newPassword')).toBeInTheDocument();
    expect(screen.getByTestId('btnSubmit')).toBeInTheDocument();
    expect(screen.getByTestId('btnDelete')).toBeInTheDocument();
  });

  it('handles successful password change', async () => {
    const user = userEvent.setup();
    render(<SettingsPage />);

    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ message: 'Senha atualizada com sucesso!' }), {
        headers: { 'content-type': 'application/json' },
      }),
    );

    await user.type(screen.getByTestId('currentPassword'), 'OldPass123');
    await user.type(screen.getByTestId('newPassword'), 'NewPass123');
    await user.click(screen.getByTestId('btnSubmit'));

    await waitFor(() => {
      expect(screen.getByText(/Senha atualizada com sucesso!/i)).toBeInTheDocument();
    });

    expect(screen.getByTestId('currentPassword')).toHaveValue('');
    expect(screen.getByTestId('newPassword')).toHaveValue('');
  });

  it('handles API error during password change gracefully', async () => {
    const user = userEvent.setup();
    render(<SettingsPage />);

    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ detail: 'Senha atual incorreta' }), {
        status: 400,
        headers: { 'content-type': 'application/json' },
      }),
    );

    await user.type(screen.getByTestId('currentPassword'), 'WrongPass');
    await user.type(screen.getByTestId('newPassword'), 'NewPass123');
    await user.click(screen.getByTestId('btnSubmit'));

    await waitFor(() => {
      expect(screen.getByText(/Senha atual incorreta/i)).toBeInTheDocument();
    });
  });

  it('handles network error during password change gracefully', async () => {
    const user = userEvent.setup();
    render(<SettingsPage />);

    vi.mocked(fetch).mockRejectedValueOnce(new Error());

    await user.type(screen.getByTestId('currentPassword'), 'WrongPass');
    await user.type(screen.getByTestId('newPassword'), 'NewPass123');
    await user.click(screen.getByTestId('btnSubmit'));

    await waitFor(() => {
      expect(screen.getByText(/Erro ao atualizar a senha/i)).toBeInTheDocument();
    });
  });

  it('handles successful delete account flow', async () => {
    const user = userEvent.setup();
    render(<SettingsPage />);

    await user.click(screen.getByTestId('btnDelete'));
    expect(screen.getByTestId('btnDeleteConfirm')).toBeInTheDocument();

    vi.mocked(fetch)
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({})));

    await user.click(screen.getByTestId('btnDeleteConfirm'));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/login');
    });
  });

  it('cancels delete account flow', async () => {
    const user = userEvent.setup();
    render(<SettingsPage />);

    await user.click(screen.getByTestId('btnDelete'));

    await user.click(screen.getByTestId('btnDeleteCancel'));

    expect(screen.queryByTestId('btnDeleteConfirm')).not.toBeInTheDocument();
    expect(screen.getByTestId('btnDelete')).toBeInTheDocument();
  });

  it('handles API error during delete account gracefully', async () => {
    const user = userEvent.setup();
    render(<SettingsPage />);

    await user.click(screen.getByTestId('btnDelete'));

    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ detail: 'Você não pode excluir a conta.' }), {
        status: 400,
        headers: { 'content-type': 'application/json' },
      }),
    );

    await user.click(screen.getByTestId('btnDeleteConfirm'));

    await waitFor(() => {
      expect(screen.getByText(/Você não pode excluir a conta./i)).toBeInTheDocument();
    });

    expect(screen.queryByTestId('btnDeleteConfirm')).not.toBeInTheDocument();
  });

  it('handles network error during delete account gracefully', async () => {
    const user = userEvent.setup();
    render(<SettingsPage />);

    await user.click(screen.getByTestId('btnDelete'));

    vi.mocked(fetch).mockRejectedValueOnce(new Error());

    await user.click(screen.getByTestId('btnDeleteConfirm'));

    await waitFor(() => {
      expect(screen.getByText(/Erro ao excluir conta/i)).toBeInTheDocument();
    });

    expect(screen.queryByTestId('btnDeleteConfirm')).not.toBeInTheDocument();
  });
});
