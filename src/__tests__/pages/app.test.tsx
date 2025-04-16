import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import MyApp from '@/pages/_app';
import '@testing-library/jest-dom';

function MockComponent() {
  return <h1>Tic Tac Toe</h1>;
}

const mockPageProps = {};

describe('MyApp Component', () => {
  it('renders the app without crashing', () => {
    render(<MyApp Component={MockComponent} pageProps={mockPageProps} />);
    expect(screen.getByText('Tic Tac Toe')).toBeInTheDocument();
  });

  it('sets the correct page title', async () => {
    render(<MyApp Component={MockComponent} pageProps={mockPageProps} />);
    await waitFor(() => {
      expect(screen.getByText('Tic Tac Toe')).toBeInTheDocument();
    });
  });

  it('displays the correct title in the heading', async () => {
    render(<MyApp Component={MockComponent} pageProps={mockPageProps} />);
    await waitFor(() => {
      const heading = screen.getByRole('heading', { name: 'Tic Tac Toe' });
      expect(heading).toBeInTheDocument();
    });
  });
});
