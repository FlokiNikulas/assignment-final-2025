import { http, HttpResponse } from 'msw';

// Mock handlers for API routes
export const handlers = [
  http.post('/api/new', async ({ request }) => {
    const body = (await request.json()) as {
      player1_name?: string;
      player2_name?: string;
    };
    const player1_name = body.player1_name || 'Player 1';
    const player2_name = body.player2_name || 'Player 2';
    return HttpResponse.json(
      { id: 'test123', player1_name, player2_name },
      { status: 201 }
    );
  }),

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

  http.get('/api/game/:id', async ({ params }) => {
    const gameId = params.id;
    // Mock response for a specific game ID
    const gameData = {
      id: gameId,
      moves: ['X', '', '', '', '', '', '', '', ''],
      winner: null,
    };
    return HttpResponse.json(gameData, { status: 200 });
  }),

  http.put('/api/game/:id', async ({ request, params }) => {
    const gameId = params.id;
    const body = (await request.json()) as {
      moves?: string[];
      winner?: string;
    };
    const moves = body.moves ?? Array(9).fill('');
    const winner = body.winner ?? null;
    return HttpResponse.json({ id: gameId, moves, winner }, { status: 200 });
  }),
];