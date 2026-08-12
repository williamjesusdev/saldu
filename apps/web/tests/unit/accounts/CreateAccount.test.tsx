import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import CreateAccountPage from '@/app/(app)/accounts/new/page';

import { createDeferredPromise, jsonResponse } from './testHelpers';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => new URLSearchParams(),
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
      <CreateAccountPage />
    </QueryClientProvider>,
  );
};

describe('CreateAccountPage Component', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    mockPush.mockClear();
    queryClient.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the page and the form', () => {
    renderPage();
    expect(screen.getByText('Nova Conta')).toBeInTheDocument();
    expect(screen.getByTestId('btnSubmit')).toBeInTheDocument();
  });

  it('handles successful account creation with loading state and redirect', async () => {
    const user = userEvent.setup();
    const deferred = createDeferredPromise<Response>();
    vi.mocked(fetch).mockReturnValueOnce(deferred.promise);

    renderPage();

    await user.type(screen.getByTestId('name'), 'Minha Conta Nova');
    await user.selectOptions(screen.getByTestId('institution'), 'NUBANK');
    await user.selectOptions(screen.getByTestId('type'), 'CHECKING');
    await user.click(screen.getByTestId('ignoreInTotals'));

    await user.click(screen.getByTestId('btnSubmit'));

    const submitBtn = screen.getByTestId('btnSubmit');
    expect(submitBtn).toHaveTextContent('Criando...');
    expect(submitBtn).toBeDisabled();

    deferred.resolve(jsonResponse({ id: 'mocked-uuid' }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        '/api/v1/accounts',
        expect.objectContaining({ method: 'POST' }),
      );
      expect(mockPush).toHaveBeenCalledWith('/accounts?status=created');
    });
  });

  it('handles error during account creation', async () => {
    const user = userEvent.setup();
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse({ detail: 'Erro Interno do Servidor' }, 500),
    );

    renderPage();

    await user.type(screen.getByTestId('name'), 'Minha Conta Erro');
    await user.selectOptions(screen.getByTestId('institution'), 'NUBANK');
    await user.selectOptions(screen.getByTestId('type'), 'CHECKING');

    await user.click(screen.getByTestId('btnSubmit'));

    await waitFor(() => {
      expect(
        screen.getByText(/Erro ao criar conta: Erro Interno do Servidor/i),
      ).toBeInTheDocument();
    });

    expect(mockPush).not.toHaveBeenCalled();
  });

  it('handles cancel button click', async () => {
    const user = userEvent.setup();
    const backSpy = vi.spyOn(window.history, 'back');

    renderPage();
    await user.click(screen.getByTestId('btnCancel'));

    expect(backSpy).toHaveBeenCalled();
    backSpy.mockRestore();
  });

  it('prevents submission if required fields are empty', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByTestId('btnSubmit'));

    await waitFor(() => {
      expect(screen.getByText(/Nome é obrigatório/i)).toBeInTheDocument();
    });

    expect(fetch).not.toHaveBeenCalled();
  });
});
