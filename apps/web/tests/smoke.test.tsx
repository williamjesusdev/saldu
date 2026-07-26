import Home from '@/app/page';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('HomePage Smoke Test', () => {
  it('renders without crashing', () => {
    render(<Home />);
    // Basic assertion to ensure something is rendered
    expect(screen.getByText(/Seu gerenciador de finanças pessoal\./i)).toBeInTheDocument();
  });
});
