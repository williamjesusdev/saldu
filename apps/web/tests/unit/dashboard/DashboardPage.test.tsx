import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import DashboardPage from '@/app/dashboard/page';
import * as AuthContext from '@/contexts/AuthContext';

import { createMockAccount, jsonResponse } from '../accounts/testHelpers';

vi.mock('@/components/AuthGuard', () => ({
  AuthGuard: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false, refetchOnWindowFocus: false },
  },
});

const renderPage = () => {
  return render(
    <QueryClientProvider client={queryClient}>
      <DashboardPage />
    </QueryClientProvider>,
  );
};

describe('DashboardPage Component', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    queryClient.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders DashboardPage correctly for standard user', async () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      user: {
        id: '1',
        name: 'João Silva',
        email: 'john@test.com',
        role: 'USER',
        hasConsented: true,
      },
      login: vi.fn(),
      logout: vi.fn(),
      checkAuth: vi.fn(),
    });

    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse([
        createMockAccount({ type: 'CHECKING' }),
        createMockAccount({ id: '2', name: 'Conta 2', type: 'CHECKING' }),
      ]),
    );

    renderPage();

    expect(screen.getByText(/Olá, João Silva/i)).toBeInTheDocument();
    expect(screen.getByText('Saldo Total Consolidado')).toBeInTheDocument();
    expect(screen.getByTestId('settingsLink')).toBeInTheDocument();
    expect(screen.getByTestId('accountsLink')).toBeInTheDocument();
    expect(screen.queryByTestId('invitesLink')).not.toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Minha Conta Corrente')).toBeInTheDocument();
      expect(screen.getByText('Conta 2')).toBeInTheDocument();
    });
  });

  it('displays admin link and fallback greeting when user has no name and is PLATFORM_ADMIN', async () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      user: {
        id: '1',
        name: '',
        email: 'admin@test.com',
        role: 'PLATFORM_ADMIN',
        hasConsented: true,
      },
      login: vi.fn(),
      logout: vi.fn(),
      checkAuth: vi.fn(),
    });

    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse([]));

    renderPage();

    expect(screen.getByText(/Olá, Bem-vindo/i)).toBeInTheDocument();
    expect(screen.getByTestId('invitesLink')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Nenhuma conta cadastrada ainda/i)).toBeInTheDocument();
    });
  });

  it('displays error state when fetching accounts fails', async () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      user: { id: '1', name: 'User', email: 'user@test.com', role: 'USER', hasConsented: true },
      login: vi.fn(),
      logout: vi.fn(),
      checkAuth: vi.fn(),
    });

    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ detail: 'Erro' }, 500));

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Erro ao carregar contas.')).toBeInTheDocument();
    });
  });

  it('renders correctly with single checking account and fallback defaults', async () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      user: { id: '1', name: 'User', email: 'user@test.com', role: 'USER', hasConsented: true },
      login: vi.fn(),
      logout: vi.fn(),
      checkAuth: vi.fn(),
    });

    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse([
        {
          id: '1',
          name: 'Single Account',
          institution: 'BB',
          type: 'CHECKING',
        },
      ]),
    );

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('1 corrente')).toBeInTheDocument();
      expect(screen.getByText('Single Account')).toBeInTheDocument();
    });
  });
});
