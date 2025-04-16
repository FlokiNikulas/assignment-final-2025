import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Board from '@/components/Board';
import { BoardHeader } from '@/components/BoardHeader';
import { GameRow } from '@/components/GameRow';
import Cell from '@/components/Cell';
import { WinnerAnnouncement } from '@/components/WinnerAnnouncement';
import { Sign } from '@/utils/constants';
import { Game } from '@/lib/gameStore';
import * as gameUtils from '@/utils/gameUtils';
import Link from 'next/link';

// ========== Mocks ==========
vi.mock('next/link', () => ({
  default: ({
    href,
    children,
  }: {
    href: string;
    children: React.ReactNode;
  }) => <a href={href}>{children}</a>,
}));

vi.mock('@/components/WinnerAnnouncement', () => ({
  WinnerAnnouncement: () => <div>Winner: Alice</div>,
}));

// ========== Board Component Tests ==========
describe('Board Component', () => {
  it('renders 9 cells', () => {
    const mockOnMove = vi.fn();
    render(<Board moves={Array(9).fill('')} onMove={mockOnMove} />);
    const cells = document.querySelectorAll("div[class*='cell']");
    expect(cells).toHaveLength(9);
  });

  it('calls onMove when a cell is clicked', () => {
    const mockOnMove = vi.fn();
    render(<Board moves={Array(9).fill('')} onMove={mockOnMove} />);
    const cells = document.querySelectorAll("div[class*='cell']");
    fireEvent.click(cells[0]);
    expect(mockOnMove).toHaveBeenCalledTimes(1);
  });

  it('does not call onMove when cell is already occupied', () => {
    const mockOnMove = vi.fn();
    const moves = ['X', '', '', '', '', '', '', '', ''];
    render(<Board moves={moves} onMove={mockOnMove} />);
    const cells = document.querySelectorAll("div[class*='cell']");
    fireEvent.click(cells[0]);
    expect(mockOnMove).not.toHaveBeenCalled();
  });

  it('does not call onMove when the game is read-only', () => {
    const mockOnMove = vi.fn();
    render(<Board moves={Array(9).fill('')} onMove={mockOnMove} readOnly />);
    const cells = document.querySelectorAll(
      "div[class*='cell'], div[class*='miniCell']"
    );
    fireEvent.click(cells[0]);
    expect(mockOnMove).not.toHaveBeenCalled();
  });

  it('does not call onMove when the game has a winner', () => {
    const mockOnMove = vi.fn();
    const moves = ['X', 'X', 'X', '', '', '', '', '', ''];
    render(<Board moves={moves} onMove={mockOnMove} />);
    const cells = document.querySelectorAll("div[class*='cell']");
    fireEvent.click(cells[4]);
    expect(mockOnMove).not.toHaveBeenCalled();
  });
});

// ========== BoardHeader Component Tests ==========
describe('BoardHeader Component', () => {
  const mockGame: Game = {
    id: 'test123',
    player1_name: 'Alice',
    player2_name: 'Bob',
    moves: ['X', '', '', '', '', '', '', '', ''],
    createdAt: new Date(),
    winner: null,
  };

  beforeEach(() => {
    vi.spyOn(gameUtils, 'getRandomPepTalk').mockReturnValue(
      'Show them what you got!'
    );
    vi.spyOn(gameUtils, 'calculateWinner').mockReturnValue(null);
    vi.spyOn(gameUtils, 'getWhosTurnItIs').mockReturnValue(Sign.X);
    vi.spyOn(gameUtils, 'getPlayerNameFromSign').mockReturnValue('❌ Alice');
  });

  it("renders the next player's turn when the game is ongoing", () => {
    render(<BoardHeader game={mockGame} />);
    expect(screen.getByText('Show them what you got!')).toBeInTheDocument();
    expect(screen.getByText('❌ Alice')).toBeInTheDocument();
  });

  it('renders the winner announcement when there is a winner', () => {
    vi.spyOn(gameUtils, 'calculateWinner').mockReturnValue(Sign.X);
    render(<BoardHeader game={mockGame} />);
    expect(screen.getByText('Winner: Alice')).toBeInTheDocument();
  });

  it('displays a random pep talk message', () => {
    render(<BoardHeader game={mockGame} />);
    expect(screen.getByText('Show them what you got!')).toBeInTheDocument();
  });
});

// ========== Cell Component Tests ==========
describe('Cell Component', () => {
  it('renders without crashing', () => {
    render(<Cell onClick={vi.fn()} number={0} value="" />);
    const cell = document.querySelector("div[class*='cell']");
    expect(cell).toBeInTheDocument();
  });

  it('renders X when value is Sign.X', () => {
    render(<Cell onClick={vi.fn()} number={0} value={Sign.X} />);
    const cell = document.querySelector("div[class*='cell']");
    expect(cell).toBeInTheDocument();
    expect(cell).toHaveTextContent('❌');
  });

  it('renders O when value is Sign.O', () => {
    render(<Cell onClick={vi.fn()} number={0} value={Sign.O} />);
    const cell = document.querySelector("div[class*='cell']");
    expect(cell).toBeInTheDocument();
    expect(cell).toHaveTextContent('⭕');
  });

  it('calls onClick when clicked, even when readOnly is true', () => {
    const mockOnClick = vi.fn();
    render(<Cell onClick={mockOnClick} number={0} value="" readOnly />);
    const cell = document.querySelector("div[class*='miniCell']");
    fireEvent.click(cell!);
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });
});

// ========== GameRow Component Tests ==========
describe('GameRow Component', () => {
  const mockGame: Game = {
    id: 'game123',
    player1_name: 'Alice',
    player2_name: 'Bob',
    moves: ['X', '', '', '', 'O', '', '', '', 'X'],
    createdAt: new Date('2023-01-01T12:00:00Z'),
    winner: null,
  };

  it('renders without crashing', () => {
    render(<GameRow game={mockGame} />);
    expect(screen.getByText(/Alice/)).toBeInTheDocument();
    expect(screen.getByText(/Bob/)).toBeInTheDocument();
  });

  it('displays the winner correctly', () => {
    vi.spyOn(gameUtils, 'calculateWinner').mockReturnValue(Sign.X);
    render(<GameRow game={mockGame} />);
    expect(
      screen.getByText(
        (content) => content.includes('Alice') && content.includes('🎉')
      )
    ).toBeInTheDocument();
  });

  it('displays the formatted creation date', () => {
    render(<GameRow game={mockGame} />);
    expect(screen.getByText(/Created:/)).toBeInTheDocument();
  });

  it('renders a link to the game page', () => {
    render(<GameRow game={mockGame} />);
    const linkElement = screen.getByRole('link');
    expect(linkElement).toHaveAttribute('href', '/game/game123');
  });
});

// ========== WinnerAnnouncement Component Tests ==========
describe('WinnerAnnouncement Component', () => {
  const mockGame: Game = {
    id: 'game123',
    player1_name: 'Alice',
    player2_name: 'Bob',
    moves: ['X', 'O', 'X', 'O', 'X', 'O', 'X', 'O', 'X'],
    createdAt: new Date('2023-01-01T12:00:00Z'),
    winner: null,
  };

  it('renders the winner correctly when X wins', () => {
    render(<WinnerAnnouncement winner={Sign.X} game={mockGame} />);
    expect(
      screen.getByText(
        (content) => content.includes('Alice') && content.includes('Won')
      )
    ).toBeInTheDocument();
  });

  it('renders the winner correctly when O wins', () => {
    render(<WinnerAnnouncement winner={Sign.O} game={mockGame} />);
    expect(
      screen.getByText(
        (content) => content.includes('Bob') && content.includes('Won')
      )
    ).toBeInTheDocument();
  });

  it("renders 'It's a Draw!' correctly", () => {
    render(<WinnerAnnouncement winner="draw" game={mockGame} />);
    expect(screen.getByText('Its a Draw!')).toBeInTheDocument();
  });
});
