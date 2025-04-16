import { Game } from '../lib/gameStore';
import { EMOJI, pepTalks, Sign } from './constants';

export function calculateWinner(moves: string[]): string | null {
  const winningCombinations = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (const [a, b, c] of winningCombinations) {
    if (moves[a] && moves[a] === moves[b] && moves[a] === moves[c]) {
      return moves[a];
    }
  }

  if (!moves.includes('')) {
    return 'draw';
  }

  return null;
}

export function getPlayerNameFromSign(
  sign: Sign | string,
  game: Game
): Sign | string {
  if (sign === Sign.O) {
    return `${EMOJI[sign]} ${game?.player2_name} `;
  } else if (sign === Sign.X) {
    return `${EMOJI[sign]} ${game?.player1_name} `;
  }
  return '';
}

export function getWhosTurnItIs(moves: Sign[] | string[]): Sign | string {
  const numberOfX = moves.filter((move) => move === Sign.X).length;
  const numberOfO = moves.filter((move) => move === Sign.O).length;
  if (numberOfX === 0) {
    return Sign.X;
  }
  if (numberOfX > numberOfO) {
    return Sign.O;
  } else {
    return Sign.X;
  }
}

export function getRandomPepTalk() {
  return pepTalks[Math.floor(Math.random() * pepTalks.length)];
}
