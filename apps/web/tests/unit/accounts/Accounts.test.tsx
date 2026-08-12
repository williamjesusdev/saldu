import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useSearchParams } from 'next/navigation';

import AccountsPage from '@/app/(app)/accounts/page';

import { createDeferredPromise, createMockAccount, jsonResponse } from './testHelpers';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: vi.fn(() => new URLSearchParams()),
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false, refetchOnWindowFocus: false },
    mutations: { retry: false },
  },
});

const renderPage = () => {
  return render(
    <QueryClientProvider client={queryClient}>
      <AccountsPage />
    </QueryClientProvider>,
  );
};

describe('AccountsPage Component', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    mockPush.mockClear();
    queryClient.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders loading state initially', () => {
    vi.mocked(fetch).mockImplementation(() => new Promise(() => {}));
    renderPage();
    expect(screen.getByText('Carregando contas...')).toBeInTheDocument();
  });

  it('renders error state', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse({ detail: 'Falhou ao carregar contas' }, 500),
    );
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Erro ao carregar contas')).toBeInTheDocument();
      expect(screen.getByText('Falhou ao carregar contas')).toBeInTheDocument();
    });
  });

  it('renders accounts empty list when loaded', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse([]));
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Nenhuma conta encontrada.')).toBeInTheDocument();
    });
  });

  it('renders accounts list when loaded', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse([createMockAccount()]));
    renderPage();
    await waitFor(() => {
      expect(screen.getByTestId('accountName')).toHaveTextContent('Minha Conta Corrente');
    });
  });

  it('handles archiving an account successfully with loading state feedback', async () => {
    const user = userEvent.setup();
    const deferredDelete = createDeferredPromise<Response>();

    vi.mocked(fetch).mockImplementation(async (input, init) => {
      if (init?.method === 'DELETE') {
        return deferredDelete.promise;
      }
      return jsonResponse([
        createMockAccount({
          name: 'Minha Conta Teste',
          institution: 'OTHER',
          type: 'OTHER',
          ignoreInTotals: true,
        }),
      ]);
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByTestId('accountName')).toHaveTextContent('Minha Conta Teste');
      expect(screen.getByText('Ignorada')).toBeInTheDocument();
      expect(screen.getByText('Conta Corrente')).toBeInTheDocument();
    });

    await user.click(screen.getByTestId('btnArchive'));
    const confirmButton = screen.getByTestId('btnConfirmArchive');
    await user.click(confirmButton);

    expect(confirmButton).toHaveTextContent('Arquivando...');
    expect(confirmButton).toBeDisabled();

    deferredDelete.resolve(jsonResponse({}));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        '/api/v1/accounts/mocked-uuid',
        expect.objectContaining({ method: 'DELETE' }),
      );
      expect(screen.getByText(/Conta arquivada com sucesso/i)).toBeInTheDocument();
    });
  });

  it('handles archiving an account with error', async () => {
    const user = userEvent.setup();
    vi.mocked(fetch).mockImplementation(async (input, init) => {
      if (init?.method === 'DELETE') {
        return jsonResponse({ detail: 'Erro Interno do Servidor' }, 500);
      }
      return jsonResponse([createMockAccount()]);
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByTestId('accountName')).toHaveTextContent('Minha Conta Corrente');
    });

    await user.click(screen.getByTestId('btnArchive'));
    await user.click(screen.getByTestId('btnConfirmArchive'));

    await waitFor(() => {
      expect(
        screen.getByText(/Erro ao arquivar conta: Erro Interno do Servidor/i),
      ).toBeInTheDocument();
    });
  });

  it('cancels archiving an account', async () => {
    const user = userEvent.setup();
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse([createMockAccount()]));

    renderPage();

    await waitFor(() => {
      expect(screen.getByTestId('accountName')).toHaveTextContent('Minha Conta Corrente');
    });

    await user.click(screen.getByTestId('btnArchive'));
    await user.click(screen.getByTestId('btnCancelArchive'));

    expect(fetch).not.toHaveBeenCalledWith(
      '/api/v1/accounts/mocked-uuid',
      expect.objectContaining({ method: 'DELETE' }),
    );
    expect(screen.getByTestId('btnArchive')).toBeInTheDocument();
  });

  it('renders initial success message when status=created in search params', async () => {
    vi.mocked(useSearchParams).mockReturnValueOnce(new URLSearchParams('status=created'));
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse([]));

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Conta criada com sucesso.')).toBeInTheDocument();
    });
  });

  it('renders initial success message when status=archived in search params', async () => {
    vi.mocked(useSearchParams).mockReturnValueOnce(new URLSearchParams('status=archived'));
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse([]));

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Conta arquivada com sucesso.')).toBeInTheDocument();
    });
  });
});
