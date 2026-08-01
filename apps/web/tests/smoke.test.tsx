import Home from '@/app/page';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('HomePage Smoke Test', () => {
  it('renders without crashing', () => {
    render(<Home />);
    expect(
      screen.getByText(/O Saldu redefine o gerenciamento financeiro pessoal./i),
    ).toBeInTheDocument();
  });
});
