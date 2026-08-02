import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import DashboardPage from '@/app/dashboard/page';
import * as AuthContext from '@/contexts/AuthContext';

vi.mock('@/components/AuthGuard', () => ({
  AuthGuard: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('DashboardPage Component', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders DashboardPage correctly', () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      user: { id: '1', name: '', email: 'john@test.com', role: 'USER', hasConsented: true },
      login: vi.fn(),
      logout: vi.fn(),
      checkAuth: vi.fn(),
    });

    render(<DashboardPage />);

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText(/Olá, Bem-vindo à sua área logada/i)).toBeInTheDocument();
    expect(screen.queryByTestId('invitesLink')).not.toBeInTheDocument();
    expect(screen.getByTestId('settingsLink')).toBeInTheDocument();
  });

  it('displays admin link when user is PLATFORM_ADMIN', () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      isLoading: false,
      isAuthenticated: true,
      user: {
        id: '1',
        name: 'Admin',
        email: 'admin@test.com',
        role: 'PLATFORM_ADMIN',
        hasConsented: true,
      },
      login: vi.fn(),
      logout: vi.fn(),
      checkAuth: vi.fn(),
    });

    render(<DashboardPage />);

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByTestId('invitesLink')).toBeInTheDocument();
  });
});
