import { describe, it, expect, vi } from 'vitest';
import type { NextApiRequest, NextApiResponse } from 'next';
import game from '@/pages/api/game/[id]';
import games from '@/pages/api/games';
import newGame from '@/pages/api/new';
import { getGameById, updateGame, getGames } from '@/lib/gameStore';
import { PrismaClient } from '@prisma/client';

// ========== Mocks ==========

// gameStore module
vi.mock('@/lib/gameStore', () => ({
  getGameById: vi.fn(),
  updateGame: vi.fn(),
  getGames: vi.fn(),
}));

// Prisma mock setup
vi.mock('@prisma/client', () => {
  const mockPrisma = {
    game: {
      create: vi.fn().mockResolvedValue({
        id: 'test123',
        player1_name: 'Alice',
        player2_name: 'Bob',
        moves: Array(9).fill(''),
        createdAt: new Date(),
        winner: null,
      }),
    },
  };
  return { PrismaClient: vi.fn(() => mockPrisma) };
});

const prisma = new PrismaClient();

// ========== Tests for /api/game/[id] ==========
describe('GET /api/game/[id]', () => {
  it('should return a game by ID', async () => {
    const mockGame = {
      id: 'game1',
      player1_name: 'Alice',
      player2_name: 'Bob',
      moves: ['X', 'O', '', '', '', '', '', '', ''],
      winner: null,
    };

    (getGameById as any).mockResolvedValue(mockGame);

    const req = { method: 'GET', query: { id: 'game1' } } as any;
    const json = vi.fn();
    const status = vi.fn().mockReturnValue({ json });
    const res = { status } as any;

    await game(req, res);

    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith(mockGame);
  });

  it('should return 404 if game is not found', async () => {
    (getGameById as any).mockResolvedValue(null);

    const req = { method: 'GET', query: { id: 'unknown' } } as any;
    const send = vi.fn();
    const status = vi.fn().mockReturnValue({ send });
    const res = { status } as any;

    await game(req, res);

    expect(status).toHaveBeenCalledWith(404);
    expect(send).toHaveBeenCalledWith('Game not found!');
  });
});

describe('PUT /api/game/[id]', () => {
  it('should update a game', async () => {
    const mockUpdatedGame = {
      id: 'game1',
      player1_name: 'Alice',
      player2_name: 'Bob',
      moves: ['X', 'O', 'X', '', '', '', '', '', ''],
      winner: 'X',
    };

    (updateGame as any).mockResolvedValue(mockUpdatedGame);

    const req = {
      method: 'PUT',
      query: { id: 'game1' },
      body: { moves: ['X', 'O', 'X', '', '', '', '', '', ''], winner: 'X' },
    } as any;
    const json = vi.fn();
    const status = vi.fn().mockReturnValue({ json });
    const res = { status } as any;

    await game(req, res);

    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith(mockUpdatedGame);
  });

  it('should return 405 if method is not allowed', async () => {
    const req = { method: 'DELETE', query: { id: 'game1' } } as any;
    const send = vi.fn();
    const status = vi.fn().mockReturnValue({ send });
    const res = { status } as any;

    await game(req, res);

    expect(status).toHaveBeenCalledWith(405);
    expect(send).toHaveBeenCalledWith('Method not allowed');
  });
});

// ========== Tests for /api/games ==========
describe('GET /api/games', () => {
  it('should return a list of games', async () => {
    const mockGames = [
      {
        id: 'game1',
        player1_name: 'Alice',
        player2_name: 'Bob',
        moves: [],
        winner: null,
      },
      {
        id: 'game2',
        player1_name: 'Charlie',
        player2_name: 'Dana',
        moves: [],
        winner: 'X',
      },
    ];

    (getGames as any).mockResolvedValue(mockGames);

    const req = {} as any;
    const json = vi.fn();
    const status = vi.fn().mockReturnValue({ json });
    const res = { status } as any;

    await games(req, res);

    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith(mockGames);
  });

  it('should return 500 on error', async () => {
    (getGames as any).mockRejectedValue(new Error('Database error'));

    const req = {} as any;
    const send = vi.fn();
    const status = vi.fn().mockReturnValue({ send });
    const res = { status } as any;

    await games(req, res);

    expect(status).toHaveBeenCalledWith(500);
    expect(send).toHaveBeenCalledWith('Something went terribly wrong!');
  });
});

// ========== Tests for /api/new ==========
describe('API - New Game', () => {
  it('creates a new game successfully', async () => {
    const req = {
      body: {
        player1: 'Alice',
        player2: 'Bob',
      },
    } as NextApiRequest;

    const json = vi.fn();
    const status = vi.fn(() => ({ json }));
    const res = {
      status,
    } as unknown as NextApiResponse;

    await newGame(req, res);

    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({
      id: 'test123',
      player1_name: 'Alice',
      player2_name: 'Bob',
      moves: Array(9).fill(''),
      createdAt: expect.any(Date),
      winner: null,
    });
  });

  it('returns 500 on database error', async () => {
    const req = {
      body: {
        player1: 'Alice',
        player2: 'Bob',
      },
    } as NextApiRequest;

    const send = vi.fn();
    const status = vi.fn(() => ({ send }));
    const res = {
      status,
    } as unknown as NextApiResponse;

    vi.spyOn(prisma.game, 'create').mockRejectedValue(
      new Error('Database error')
    );

    await newGame(req, res);

    expect(status).toHaveBeenCalledWith(500);
    expect(send).toHaveBeenCalledWith('Database error!');
  });
});
