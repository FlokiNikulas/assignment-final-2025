import { describe, it, expect, vi } from 'vitest';
import type { NextApiRequest, NextApiResponse } from 'next';
import newGame from '@/pages/api/new';
import { PrismaClient } from '@prisma/client';

// Mock Prisma Client
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

    // Simulate a database error
    vi.spyOn(prisma.game, 'create').mockRejectedValue(
      new Error('Database error')
    );

    await newGame(req, res);

    expect(status).toHaveBeenCalledWith(500);
    expect(send).toHaveBeenCalledWith('Database error!');
  });
});
