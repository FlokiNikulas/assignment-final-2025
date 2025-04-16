import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import GameList from '@/pages/games';
import Home from '@/pages/index';
import MyApp from '@/pages/_app';
import GamePage from '@/pages/game/[id]';
import '@testing-library/jest-dom';
import { server } from '../mocks/setupMSW';
import { http, HttpResponse } from 'msw';
import { act } from 'react-dom/test-utils';
import { useRouter } from 'next/router';
import axios from 'axios';

// ========== MSW HANDLERS ==========
server.use(
  // Game list handler
  http.get('/api/games', async () => {
    return HttpResponse.json([
      {
        id: 'game1',
        player1_name: 'Alice',
        player2_name: 'Bob',
        moves: ['X', 'O', '', '', '', '', '', '', ''],
        winner: null,
      },
      {
        id: 'game2',
        player1_name: 'Charlie',
        player2_name: 'Dana',
        moves: ['X', 'X', 'X', '', '', '', '', '', ''],
        winner: 'X',
      },
    ]);
  }),

  // Single game fetch
  http.get('/api/game/:id', async ({ params }) => {
    return HttpResponse.json({
      id: params.id,
      moves: ['X', '', '', '', '', '', '', '', ''],
      winner: null,
    });
  }),

  // Single game update
  http.put('/api/game/:id', async ({ params, request }) => {
    const { moves }: { moves: string[] } = (await request.json()) as {
      moves: string[];
    };
    return HttpResponse.json({
      id: params.id,
      moves,
      winner: 'X',
    });
  })
);

// ========== MOCKS ==========
vi.mock('axios');
vi.mock('next/router', () => ({
  useRouter: vi.fn(() => ({
    query: { id: 'test123' },
    push: vi.fn(),
  })),
}));

// ========== Game List Tests ==========
describe('Game List Page', () => {
  it('renders the game list title', () => {
    render(<GameList />);
    expect(screen.getByText('🎱 All games')).toBeInTheDocument();
  });

  it('fetches and displays the list of games', async () => {
    render(<GameList />);

    await waitFor(() => {
      expect(screen.getByText(/Alice/)).toBeInTheDocument();
      expect(screen.getByText(/Bob/)).toBeInTheDocument();
      expect(screen.getByText(/Charlie/)).toBeInTheDocument();
      expect(screen.getByText(/Dana/)).toBeInTheDocument();
    });
  });
});

// ========== Home Page Tests ==========
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

// ========== _app.tsx Tests ==========
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

// ========== Game Page Tests ==========
describe('Game Page', () => {
  it('renders loading message initially', () => {
    render(<GamePage />);
    expect(screen.getByText('Loading..🔃')).toBeInTheDocument();
  });

  it('fetches and displays the game board', async () => {
    render(<GamePage />);
    await waitFor(() => {
      const cells = screen.getAllByTestId(/^cell-/);
      expect(cells).toHaveLength(9);
      expect(cells[0]).toHaveTextContent('❌');
    });
  });

  it('handles a move and updates the board', async () => {
    render(<GamePage />);
    const cells = await screen.findAllByTestId(/^cell-/);
    expect(cells).toHaveLength(9);

    act(() => {
      fireEvent.click(cells[1]);
    });

    await waitFor(() => {
      expect(cells[1]).toHaveTextContent('⭕');
    });
  });
});