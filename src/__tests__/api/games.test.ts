import { describe, it, expect, vi } from 'vitest';
import { getGames } from '@/lib/gameStore';
import games from '@/pages/api/games';

vi.mock('@/lib/gameStore', () => ({
  getGames: vi.fn(),
}));

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

    getGames.mockResolvedValue(mockGames);

    const req = {} as any;
    const json = vi.fn();
    const status = vi.fn().mockReturnValue({ json });
    const res = { status } as any;

    await games(req, res);

    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith(mockGames);
  });

  it('should return 500 on error', async () => {
    getGames.mockRejectedValue(new Error('Database error'));

    const req = {} as any;
    const send = vi.fn();
    const status = vi.fn().mockReturnValue({ send });
    const res = { status } as any;

    await games(req, res);

    expect(status).toHaveBeenCalledWith(500);
    expect(send).toHaveBeenCalledWith('Something went terribly wrong!');
  });
});
