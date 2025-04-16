import { PrismaClient } from '@prisma/client';
import { Sign } from '../utils/constants';

const prisma = new PrismaClient();

export interface Game {
  id: string;
  player1_name?: string | null;
  player2_name?: string | null;
  moves: Sign[] | string[];
  createdAt?: Date;
  winner?: string | null;
}

// Create a new game
export async function createGame(
  player1?: string,
  player2?: string
): Promise<Game> {
  const game = await prisma.game.create({
    data: {
      player1_name: player1 || 'Player 1',
      player2_name: player2 || 'Player 2',
      moves: Array(9).fill(''),
    },
  });
  return game;
}

// Get game by ID
export async function getGameById(gameId: string): Promise<Game | null> {
  return await prisma.game.findUnique({ where: { id: gameId } });
}

// Update a game (e.g., after a move)
export async function updateGame(
  gameId: string,
  moves: string[],
  winner?: string
): Promise<Game> {
  return await prisma.game.update({
    where: { id: gameId },
    data: { moves, winner },
  });
}

// Get all games
export async function getGames(): Promise<Game[]> {
  return await prisma.game.findMany();
}
