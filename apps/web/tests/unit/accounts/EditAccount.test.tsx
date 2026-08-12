import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import EditAccountPage from '@/app/(app)/accounts/[id]/edit/page';

import { createDeferredPromise, createMockAccount, jsonResponse } from './testHelpers';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({
    id: 'mocked-uuid',
  }),
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
      <EditAccountPage />
    </QueryClientProvider>,
  );
};

describe('EditAccountPage Component', () => {
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
    expect(screen.getByText('Carregando dados da conta...')).toBeInTheDocument();
  });

  it('renders error state', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse({ detail: 'Falhou ao carregar dados da conta' }, 500),
    );
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Erro ao carregar conta')).toBeInTheDocument();
      expect(screen.getByText('Falhou ao carregar dados da conta')).toBeInTheDocument();
    });
  });

  it('renders edit form when loaded, shows loading state during submission and handles successful update', async () => {
    const user = userEvent.setup();
    const deferredPut = createDeferredPromise<Response>();

    vi.mocked(fetch).mockImplementation(async (input, init) => {
      if (init?.method === 'PUT') {
        return deferredPut.promise;
      }
      return jsonResponse(createMockAccount());
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByDisplayValue('Minha Conta Corrente')).toBeInTheDocument();
    });

    const nameInput = screen.getByTestId('name');
    await user.clear(nameInput);
    await user.type(nameInput, 'Nova Conta Alterada');

    const submitButton = screen.getByTestId('btnSubmit');
    await user.click(submitButton);

    expect(submitButton).toHaveTextContent('Salvando...');
    expect(submitButton).toBeDisabled();

    deferredPut.resolve(jsonResponse({}));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        '/api/v1/accounts/mocked-uuid',
        expect.objectContaining({ method: 'PUT' }),
      );
      expect(mockPush).toHaveBeenCalledWith('/accounts/mocked-uuid?status=updated');
    });
  });

  it('handles error during account update', async () => {
    const user = userEvent.setup();
    vi.mocked(fetch).mockImplementation(async (input, init) => {
      if (init?.method === 'PUT') {
        return jsonResponse({ detail: 'Erro Interno do Servidor' }, 500);
      }
      return jsonResponse(createMockAccount());
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByDisplayValue('Minha Conta Corrente')).toBeInTheDocument();
    });

    await user.click(screen.getByTestId('ignoreInTotals'));
    await user.click(screen.getByTestId('btnSubmit'));

    await waitFor(() => {
      expect(
        screen.getByText(/Erro ao atualizar conta: Erro Interno do Servidor/i),
      ).toBeInTheDocument();
    });

    expect(mockPush).not.toHaveBeenCalled();
  });

  it('handles cancel button click', async () => {
    const user = userEvent.setup();
    const backSpy = vi.spyOn(window.history, 'back');
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse(createMockAccount()));

    renderPage();
    await waitFor(() => {
      expect(screen.getByDisplayValue('Minha Conta Corrente')).toBeInTheDocument();
    });

    await user.click(screen.getByTestId('btnCancel'));

    expect(backSpy).toHaveBeenCalled();
    backSpy.mockRestore();
  });

  it('prevents submission if required fields are empty', async () => {
    const user = userEvent.setup();
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse({
        id: 'mocked-uuid',
        name: 'Minha Conta Minima',
        institution: 'BB',
        type: 'CHECKING',
      }),
    );

    renderPage();

    await waitFor(() => {
      expect(screen.getByDisplayValue('Minha Conta Minima')).toBeInTheDocument();
    });

    const nameInput = screen.getByTestId('name');
    await user.clear(nameInput);

    await user.click(screen.getByTestId('btnSubmit'));

    await waitFor(() => {
      expect(screen.getByText(/Nome é obrigatório/i)).toBeInTheDocument();
    });

    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
