import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import LoginPage from '@/app/(auth)/login/page';
import { AuthProvider } from '@/contexts/AuthContext';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

const renderLoginPage = () =>
  render(
    <AuthProvider>
      <LoginPage />
    </AuthProvider>,
  );

describe('LoginPage Component', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    Storage.prototype.setItem = vi.fn();
    mockPush.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders LoginPage correctly', () => {
    renderLoginPage();
    expect(screen.getByText(/Acessar Saldu/i)).toBeInTheDocument();
    expect(screen.getByTestId('btnSubmit')).toBeInTheDocument();
  });

  it('prevents submission if required fields are empty', async () => {
    const user = userEvent.setup();
    renderLoginPage();

    await user.click(screen.getByTestId('btnSubmit'));

    expect(fetch).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(screen.getByText(/E-mail é obrigatório/i)).toBeInTheDocument();
    });
  });

  it('displays loading state during submission', async () => {
    const user = userEvent.setup();
    renderLoginPage();

    vi.mocked(fetch).mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve(
                new Response(JSON.stringify({ token: 'abc' }), {
                  headers: { 'content-type': 'application/json' },
                }),
              ),
            100,
          ),
        ),
    );

    await user.type(screen.getByTestId('email'), 'test@test.com');
    await user.type(screen.getByTestId('password'), 'Password123');

    const submitBtn = screen.getByTestId('btnSubmit');
    await user.click(submitBtn);

    expect(submitBtn).toHaveTextContent('Entrando...');
    expect(submitBtn).toBeDisabled();

    await waitFor(() => {
      expect(submitBtn).not.toBeDisabled();
    });
  });

  it('handles successful login routing to dashboard', async () => {
    const user = userEvent.setup();
    renderLoginPage();

    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ token: 'mock-jwt-token' }), {
        headers: { 'content-type': 'application/json' },
      }),
    );

    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ hasConsented: true }), {
        headers: { 'content-type': 'application/json' },
      }),
    );

    await user.type(screen.getByTestId('email'), 'test@test.com');
    await user.type(screen.getByTestId('password'), 'Password123');

    await user.click(screen.getByTestId('btnSubmit'));

    await waitFor(() => {
      expect(screen.getByText(/Login efetuado com sucesso/i)).toBeInTheDocument();
    });

    await waitFor(
      () => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard');
      },
      { timeout: 1000 },
    );
  });

  it('handles successful login routing to consent if not consented', async () => {
    const user = userEvent.setup();
    renderLoginPage();

    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ token: 'mock-jwt-token' }), {
        headers: { 'content-type': 'application/json' },
      }),
    );

    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ hasConsented: false }), {
        headers: { 'content-type': 'application/json' },
      }),
    );

    await user.type(screen.getByTestId('email'), 'test@test.com');
    await user.type(screen.getByTestId('password'), 'Password123');

    await user.click(screen.getByTestId('btnSubmit'));

    await waitFor(
      () => {
        expect(mockPush).toHaveBeenCalledWith('/consent');
      },
      { timeout: 1000 },
    );
  });

  it('handles API error gracefully', async () => {
    const user = userEvent.setup();
    renderLoginPage();

    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ detail: 'E-mail ou senha incorretos.' }), {
        status: 401,
        headers: { 'content-type': 'application/json' },
      }),
    );

    await user.type(screen.getByTestId('email'), 'test@test.com');
    await user.type(screen.getByTestId('password'), 'WrongPass123');
    await user.click(screen.getByTestId('btnSubmit'));

    await waitFor(() => {
      expect(screen.getByText('E-mail ou senha incorretos.')).toBeInTheDocument();
    });
  });

  it('handles network error gracefully', async () => {
    const user = userEvent.setup();
    renderLoginPage();

    vi.mocked(fetch).mockRejectedValueOnce(new Error());

    await user.type(screen.getByTestId('email'), 'test@test.com');
    await user.type(screen.getByTestId('password'), 'WrongPass123');
    await user.click(screen.getByTestId('btnSubmit'));

    await waitFor(() => {
      expect(screen.getByText('Ocorreu um erro ao processar a solicitação.')).toBeInTheDocument();
    });
  });
});
