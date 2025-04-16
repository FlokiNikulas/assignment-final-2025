import '../../../config/tracing';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getGameById, updateGame } from '../../../lib/gameStore';
import { dogstatsd } from '../../../config/tracing';

export default async function game(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === 'GET') {
    dogstatsd.increment('api.games.requests');
    dogstatsd.increment('api.games.get.requests');

    try {
      const game = await getGameById(id as string);
      if (!game) {
        dogstatsd.increment('api.games.get.notfound');
        return res.status(404).send('Game not found!');
      }

      // Increment success metrics
      dogstatsd.increment('api.games.get.success');
      return res.status(200).json(game);
    } catch (error) {
      // Increment error metrics
      dogstatsd.increment('api.games.get.error');
      dogstatsd.increment('api.database.connection.errors');

      console.error('Error getting game:', error);
      return res.status(500).send('Database error!');
    }
  }

  if (req.method === 'PUT') {
    dogstatsd.increment('api.games.requests');
    dogstatsd.increment('api.games.put.requests');

    try {
      const { moves, winner } = req.body;
      const updatedGame = await updateGame(id as string, moves, winner);

      // Increment success metrics
      dogstatsd.increment('api.games.put.success');
      dogstatsd.increment('api.games.moves.count');

      return res.status(200).json(updatedGame);
    } catch (error) {
      // Increment error metrics
      dogstatsd.increment('api.games.put.error');
      dogstatsd.increment('api.database.connection.errors');

      console.error('Error updating game:', error);
      return res.status(500).send('Database error!');
    }
  }

  // Increment metric for unsupported methods
  dogstatsd.increment('api.games.methodnotallowed');
  return res.status(405).send('Method not allowed');
}
