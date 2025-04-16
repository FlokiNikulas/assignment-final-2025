import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Home from '@/pages/index';
import { useRouter } from 'next/router';
import axios from 'axios';

vi.mock('axios');
vi.mock('next/router', () => ({
  useRouter: vi.fn(),
}));

describe('Home Page', () => {
  it('renders without crashing', () => {
    render(<Home />);
    expect(screen.getByText('Tic Tac Toe #️⃣')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('❌ Your Name (Optional)')
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('⭕ Opponent Name (Optional)')
    ).toBeInTheDocument();
    expect(screen.getByText('See all games')).toBeInTheDocument();
  });

  it('starts a new game when form is submitted', async () => {
    const mockPush = vi.fn();
    (useRouter as any).mockReturnValue({ push: mockPush });

    (axios.post as any).mockResolvedValue({ data: { id: 'game123' } });

    render(<Home />);
    const startButton = screen.getByText('Start Game');

    fireEvent.change(screen.getByPlaceholderText('❌ Your Name (Optional)'), {
      target: { value: 'Alice' },
    });
    fireEvent.change(
      screen.getByPlaceholderText('⭕ Opponent Name (Optional)'),
      { target: { value: 'Bob' } }
    );
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/game/game123');
    });
  });

  it("navigates to the 'See all games' link", () => {
    render(<Home />);
    const link = screen.getByText('See all games');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/games');
  });
});
