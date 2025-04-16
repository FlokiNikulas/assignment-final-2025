import { describe, it, expect, vi } from 'vitest';
import game from '@/pages/api/game/[id]';
import { getGameById, updateGame } from '@/lib/gameStore';

// Correctly mock the entire gameStore module
vi.mock('@/lib/gameStore', () => ({
  getGameById: vi.fn(),
  updateGame: vi.fn(),
}));

describe('GET /api/game/[id]', () => {
  it('should return a game by ID', async () => {
    const mockGame = {
      id: 'game1',
      player1_name: 'Alice',
      player2_name: 'Bob',
      moves: ['X', 'O', '', '', '', '', '', '', ''],
      winner: null,
    };

    // Use the mock directly
    (getGameById as jest.Mock).mockResolvedValue(mockGame);

    const req = { method: 'GET', query: { id: 'game1' } } as any;
    const json = vi.fn();
    const status = vi.fn().mockReturnValue({ json });
    const res = { status } as any;

    await game(req, res);

    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith(mockGame);
  });

  it('should return 404 if game is not found', async () => {
    (getGameById as jest.Mock).mockResolvedValue(null);

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

    // Use the mock directly
    (updateGame as jest.Mock).mockResolvedValue(mockUpdatedGame);

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
