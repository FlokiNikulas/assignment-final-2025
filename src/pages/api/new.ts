import '../../config/tracing';
import type { NextApiRequest, NextApiResponse } from 'next';
import { createGame } from '../../lib/gameStore';
import { dogstatsd } from '../../config/tracing';

export default async function newGame(
  req: NextApiRequest,
  res: NextApiResponse
) {
  dogstatsd.increment('api.games.requests');
  dogstatsd.increment('api.games.post.requests');

  try {
    const { player1, player2 } = req.body;
    const game = await createGame(player1, player2);

    // Increment metrics for successful game creation
    dogstatsd.increment('api.games.post.success');

    return res.status(200).json(game);
  } catch (error) {
    // Increment error metrics
    dogstatsd.increment('api.games.post.error');
    dogstatsd.increment('api.database.connection.errors');

    console.error('Error creating game:', error);
    return res.status(500).send('Database error!');
  }
}