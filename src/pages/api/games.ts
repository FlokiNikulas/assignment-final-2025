import '../../config/tracing';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getGames } from '../../lib/gameStore';
import { dogstatsd } from '../../config/tracing';

export default async function games(req: NextApiRequest, res: NextApiResponse) {
  dogstatsd.increment('api.games.requests');
  dogstatsd.increment('api.games.get.requests');

  try {
    const startTime = Date.now();
    const games = await getGames();
    const duration = Date.now() - startTime;

    // Increment metrics for successful fetch
    dogstatsd.increment('api.games.get.success');

    return res.status(200).json(games);
  } catch (error) {
    // Increment error metrics
    dogstatsd.increment('api.games.get.error');
    dogstatsd.increment('api.database.connection.errors');

    console.error('Error fetching games:', error);
    return res.status(500).send('Something went terribly wrong!');
  }
}