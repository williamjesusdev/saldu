import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import AppLayout from '@/app/(app)/layout';

vi.mock('@/components/AuthGuard', () => ({
  AuthGuard: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="mock-auth-guard">{children}</div>
  ),
}));

describe('AppLayout Component', () => {
  it('renders children wrapped in AuthGuard', () => {
    render(
      <AppLayout>
        <div data-testid="child-content">App Content</div>
      </AppLayout>,
    );

    expect(screen.getByTestId('mock-auth-guard')).toBeInTheDocument();
    expect(screen.getByTestId('child-content')).toBeInTheDocument();
  });
});
