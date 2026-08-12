import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import RegisterPage from '@/app/(auth)/register/page';

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

describe('RegisterPage Component', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    mockPush.mockClear();
    mockGet.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders RegisterPage correctly', () => {
    render(<RegisterPage />);
    mockGet.mockReturnValueOnce('INVITE_CODE');
    expect(screen.getByText(/Criar sua conta no Saldu/i)).toBeInTheDocument();
    expect(screen.getByTestId('name')).toBeInTheDocument();
    expect(screen.getByTestId('email')).toBeInTheDocument();
    expect(screen.getByTestId('password')).toBeInTheDocument();
  });

  it('prevents submission if required fields are empty', async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);

    await user.click(screen.getByTestId('btnSubmit'));

    expect(fetch).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(screen.getByText(/Nome é obrigatório/i)).toBeInTheDocument();
    });
  });

  it('displays loading state during submission', async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);

    vi.mocked(fetch).mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve(
                new Response(JSON.stringify({ status: 'PENDING' }), {
                  headers: { 'content-type': 'application/json' },
                }),
              ),
            100,
          ),
        ),
    );

    await user.type(screen.getByTestId('name'), 'Test User');
    await user.type(screen.getByTestId('email'), 'test@test.com');
    await user.type(screen.getByTestId('password'), 'Password123');

    const submitBtn = screen.getByTestId('btnSubmit');
    await user.click(submitBtn);

    expect(submitBtn).toHaveTextContent('Processando...');
    expect(submitBtn).toBeDisabled();

    await waitFor(() => {
      expect(submitBtn).not.toBeDisabled();
    });
  });

  it('handles successful submission (pending approval)', async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);

    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ status: 'PENDING' }), {
        headers: { 'content-type': 'application/json' },
      }),
    );

    await user.type(screen.getByTestId('name'), 'Test User');
    await user.type(screen.getByTestId('email'), 'test@test.com');
    await user.type(screen.getByTestId('password'), 'Password123');

    await user.click(screen.getByTestId('btnSubmit'));

    await waitFor(() => {
      expect(screen.getByText(/Solicitação de cadastro enviada/i)).toBeInTheDocument();
    });
  });

  it('handles successful submission with invite token', async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);

    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({}), {
        headers: { 'content-type': 'application/json' },
      }),
    );

    await user.click(screen.getByTestId('btnUseToken'));

    await user.type(screen.getByTestId('name'), 'Test User');
    await user.type(screen.getByTestId('email'), 'test@test.com');
    await user.type(screen.getByTestId('password'), 'Password123');
    await user.type(screen.getByTestId('token'), 'INVITE_CODE');

    await user.click(screen.getByTestId('btnSubmit'));

    await waitFor(() => {
      expect(screen.getByText(/Conta criada com sucesso! Redirecionando/i)).toBeInTheDocument();
    });

    await waitFor(
      () => {
        expect(mockPush).toHaveBeenCalledWith('/login');
      },
      { timeout: 1000 },
    );
  });

  it('handles API error gracefully', async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);

    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ errors: { email: 'E-mail já está em uso.' } }), {
        status: 400,
        headers: { 'content-type': 'application/json' },
      }),
    );

    await user.type(screen.getByTestId('name'), 'Test User');
    await user.type(screen.getByTestId('email'), 'test@test.com');
    await user.type(screen.getByTestId('password'), 'Password123');

    await user.click(screen.getByTestId('btnSubmit'));

    await waitFor(() => {
      expect(screen.getByText('E-mail já está em uso.')).toBeInTheDocument();
    });
  });

  it('handles network error gracefully', async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);

    vi.mocked(fetch).mockRejectedValueOnce(new Error());

    await user.type(screen.getByTestId('name'), 'Test User');
    await user.type(screen.getByTestId('email'), 'test@test.com');
    await user.type(screen.getByTestId('password'), 'Password123');

    await user.click(screen.getByTestId('btnSubmit'));

    await waitFor(() => {
      expect(screen.getByText('Ocorreu um erro ao processar a solicitação.')).toBeInTheDocument();
    });
  });
});
