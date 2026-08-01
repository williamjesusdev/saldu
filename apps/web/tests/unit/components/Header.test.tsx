import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Header } from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import { UserResponse } from '@/types/api';

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

describe('Header Component', () => {
  const mockLogout = vi.fn();

  beforeEach(() => {
    mockLogout.mockClear();
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: false,
      user: null,
      isLoading: false,
      login: vi.fn(),
      logout: mockLogout,
      checkAuth: vi.fn(),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders correctly and shows unauthenticated state initially', async () => {
    render(<Header />);
    expect(screen.getByText('Saldu')).toBeInTheDocument();
    expect(screen.getByText('Entrar')).toBeInTheDocument();
    expect(screen.getByText('Começar grátis')).toBeInTheDocument();
  });

  it('shows authenticated navigation when user is logged in', async () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      user: { role: 'PLATFORM_ADMIN' } as UserResponse,
      isLoading: false,
      login: vi.fn(),
      logout: mockLogout,
      checkAuth: vi.fn(),
    });

    render(<Header />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Convites')).toBeInTheDocument();
    expect(screen.getByTestId('btnLogout')).toBeInTheDocument();
  });

  it('calls logout function from context when clicking logout', async () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      user: null,
      isLoading: false,
      login: vi.fn(),
      logout: mockLogout,
      checkAuth: vi.fn(),
    });

    render(<Header />);
    fireEvent.click(screen.getByTestId('btnLogout'));
    expect(mockLogout).toHaveBeenCalled();
  });
});
