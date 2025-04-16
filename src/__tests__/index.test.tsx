import React from 'react';
import '@testing-library/jest-dom';
import {
  describe,
  it,
  expect,
  beforeAll,
  afterEach,
  afterAll,
  vi,
} from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import Home from '../pages/index';
import { calculateWinner, getWhosTurnItIs } from '../utils/gameUtils';
import { server } from './mocks/setupMSW';
import { useRouter } from 'next/router';

// ✅ Mock Next.js useRouter
const mockPush = vi.fn();
vi.mock('next/router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// ✅ Start and stop mock API server
beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  mockPush.mockReset();
});
afterAll(() => server.close());

// ✅ 1. Test Tic-Tac-Toe Winner Logic
describe('calculateWinner', () => {
  it('detects a draw when the board is full and there is no winner', () => {
    const drawBoard = ['X', 'O', 'X', 'X', 'X', 'O', 'O', 'X', 'O'];
    expect(calculateWinner(drawBoard)).toBe('draw');
  });

  it('detects a winner correctly', () => {
    const winningBoard = ['X', 'X', 'X', '', 'O', 'O', '', '', ''];
    expect(calculateWinner(winningBoard)).toBe('X');
  });

  it('returns null if the game is ongoing', () => {
    const ongoingBoard = ['X', 'O', 'X', '', 'O', 'X', '', '', ''];
    expect(calculateWinner(ongoingBoard)).toBe(null);
  });
});

// ✅ 2. Test Turn Calculation Logic
describe('getWhosTurnItIs', () => {
  it('should return X when the game starts', () => {
    const emptyBoard = ['', '', '', '', '', '', '', '', ''];
    expect(getWhosTurnItIs(emptyBoard)).toBe('X');
  });

  it('should return O when X has played first', () => {
    const board = ['X', '', '', '', '', '', '', '', ''];
    expect(getWhosTurnItIs(board)).toBe('O');
  });

  it('should return X if both have played an equal number of times', () => {
    const board = ['X', 'O', '', '', '', '', '', '', ''];
    expect(getWhosTurnItIs(board)).toBe('X');
  });
});

// ✅ 3. Test if Home Page Renders Correctly
describe('Home Page', () => {
  it('renders the title', () => {
    render(<Home />);
    expect(screen.getByText('Tic Tac Toe #️⃣')).toBeInTheDocument();
  });

  it('shows input fields for player names', () => {
    render(<Home />);
    expect(
      screen.getByPlaceholderText('❌ Your Name (Optional)')
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('⭕ Opponent Name (Optional)')
    ).toBeInTheDocument();
  });

  it('shows the start game button', () => {
    render(<Home />);
    expect(
      screen.getByRole('button', { name: /Start Game/i })
    ).toBeInTheDocument();
  });
});

// ✅ 4. Ensure Player Names Are Entered Correctly
describe('Home Page - Input Fields', () => {
  it('allows users to enter player names', () => {
    render(<Home />);
    const player1Input = screen.getByPlaceholderText('❌ Your Name (Optional)');
    const player2Input = screen.getByPlaceholderText(
      '⭕ Opponent Name (Optional)'
    );

    fireEvent.change(player1Input, { target: { value: 'Alice' } });
    fireEvent.change(player2Input, { target: { value: 'Bob' } });

    expect(player1Input).toHaveValue('Alice');
    expect(player2Input).toHaveValue('Bob');
  });
});

// ✅ 5. Ensure Clicking "Start Game" Navigates
describe('Home Page - Start Game Button', () => {
  it('navigates to a valid game page when clicked', async () => {
    render(<Home />);

    const startButton = screen.getByRole('button', { name: /Start Game/i });
    expect(startButton).toBeInTheDocument();

    fireEvent.click(startButton);
    await new Promise((res) => setTimeout(res, 200));

    expect(mockPush).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith(
      expect.stringMatching(/^\/game\/[a-zA-Z0-9]+$/)
    );
  });
});