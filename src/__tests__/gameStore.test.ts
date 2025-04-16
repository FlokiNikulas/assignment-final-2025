import { describe, it, expect, vi } from 'vitest';
import { PrismaClient } from '@prisma/client';
import {
  updateGame,
  createGame,
  getGameById,
  getGames,
} from '../lib/gameStore';

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
      findUnique: vi.fn().mockResolvedValue({
        id: 'test123',
        player1_name: 'Alice',
        player2_name: 'Bob',
        moves: Array(9).fill(''),
        createdAt: new Date(),
        winner: null,
      }),
      findMany: vi.fn().mockResolvedValue([
        {
          id: 'test123',
          player1_name: 'Alice',
          player2_name: 'Bob',
          moves: Array(9).fill(''),
          createdAt: new Date(),
          winner: null,
        },
      ]),
      update: vi.fn().mockResolvedValue({
        id: 'test123',
        player1_name: 'Alice',
        player2_name: 'Bob',
        moves: ['X', '', '', '', '', '', '', '', ''],
        createdAt: new Date(),
        winner: null,
      }),
    },
  };
  return { PrismaClient: vi.fn(() => mockPrisma) };
});

const prisma = new PrismaClient();

describe('GameStore Functions', () => {
  it('should create a game', async () => {
    const game = await createGame('Alice', 'Bob');
    expect(game).toHaveProperty('id');
    expect(game.player1_name).toBe('Alice');
    expect(game.player2_name).toBe('Bob');
    expect(game.moves).toEqual(Array(9).fill(''));
  });

  it('should fetch a game by ID', async () => {
    const game = await getGameById('test123');
    expect(game).toHaveProperty('id', 'test123');
  });

  it('should fetch all games', async () => {
    const games = await getGames();
    expect(games).toHaveLength(1);
  });

  it('should return an empty list when there are no games', async () => {
    vi.spyOn(prisma.game, 'findMany').mockResolvedValueOnce([]);
    const games = await getGames();
    expect(games).toEqual([]);
  });

  it('should update a game with new moves', async () => {
    const updatedMoves = ['X', '', '', '', '', '', '', '', ''];
    const game = await updateGame('test123', updatedMoves);
    expect(game.moves).toEqual(updatedMoves);
  });
});
