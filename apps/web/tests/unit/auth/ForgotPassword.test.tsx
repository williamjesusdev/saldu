import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import ForgotPasswordPage from '@/app/(auth)/forgot-password/page';

const mockPush = vi.fn();
const mockGet = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => ({
    get: mockGet,
  }),
}));

describe('ForgotPasswordPage Component', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    mockPush.mockClear();
    mockGet.mockClear();
    mockGet.mockReturnValue(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders ForgotPasswordPage correctly', () => {
    render(<ForgotPasswordPage />);
    expect(screen.getByText(/Recuperar Senha/i)).toBeInTheDocument();
    expect(screen.getByTestId('btnSubmit')).toBeInTheDocument();
  });

  it('prevents submission if required fields are empty', async () => {
    const user = userEvent.setup();
    render(<ForgotPasswordPage />);

    await user.click(screen.getByTestId('btnSubmit'));

    expect(fetch).not.toHaveBeenCalled();
    expect(screen.getByTestId('email')).toBeInvalid();
  });

  it('displays loading state during submission', async () => {
    const user = userEvent.setup();
    render(<ForgotPasswordPage />);

    vi.mocked(fetch).mockImplementation(
      () =>
        new Promise((resolve) => setTimeout(() => resolve(new Response(JSON.stringify({}))), 100)),
    );

    await user.type(screen.getByTestId('email'), 'test@test.com');

    const submitBtn = screen.getByTestId('btnSubmit');
    await user.click(submitBtn);

    expect(submitBtn).toHaveTextContent('Enviando...');
    expect(submitBtn).toBeDisabled();

    await waitFor(() => {
      expect(submitBtn).not.toBeDisabled();
    });
  });

  it('renders and submits in reset mode when token parameter is present', async () => {
    const user = userEvent.setup();
    mockGet.mockImplementation((key: string) => {
      if (key === 'token') return 'RESET_TOKEN_123';
      if (key === 'email') return 'reset@saldu.com';
      return null;
    });

    render(<ForgotPasswordPage />);

    expect(screen.getByRole('heading', { name: 'Redefinir Senha' })).toBeInTheDocument();
    expect(screen.getByTestId('token')).toHaveValue('RESET_TOKEN_123');

    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ message: 'Senha redefinida com sucesso.' }), {
        headers: { 'content-type': 'application/json' },
      }),
    );

    await user.type(screen.getByTestId('token'), 'RESET_TOKEN_123');
    await user.type(screen.getByTestId('password'), 'NewPass!123');
    await user.click(screen.getByTestId('btnSubmit'));

    await waitFor(
      () => {
        expect(screen.getByText('Senha redefinida com sucesso.')).toBeInTheDocument();
        expect(mockPush).toHaveBeenCalledWith('/login');
      },
      { timeout: 1000 },
    );
  });

  it('handles successful request', async () => {
    const user = userEvent.setup();
    render(<ForgotPasswordPage />);

    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ message: 'E-mail enviado' }), {
        headers: { 'content-type': 'application/json' },
      }),
    );

    await user.type(screen.getByTestId('email'), 'test@test.com');

    await user.click(screen.getByTestId('btnSubmit'));

    await waitFor(() => {
      expect(screen.getByText('E-mail enviado')).toBeInTheDocument();
    });
  });

  it('handles API error gracefully', async () => {
    const user = userEvent.setup();
    render(<ForgotPasswordPage />);

    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ detail: 'Erro simulado na API' }), {
        status: 400,
        headers: { 'content-type': 'application/json' },
      }),
    );

    await user.type(screen.getByTestId('email'), 'test@test.com');
    await user.click(screen.getByTestId('btnSubmit'));

    await waitFor(() => {
      expect(screen.getByText('Erro simulado na API')).toBeInTheDocument();
    });
  });

  it('handles network error gracefully', async () => {
    const user = userEvent.setup();
    render(<ForgotPasswordPage />);

    vi.mocked(fetch).mockRejectedValueOnce(new Error());

    await user.type(screen.getByTestId('email'), 'test@test.com');
    await user.click(screen.getByTestId('btnSubmit'));

    await waitFor(() => {
      expect(screen.getByText('Erro ao conectar com o servidor.')).toBeInTheDocument();
    });
  });
});
