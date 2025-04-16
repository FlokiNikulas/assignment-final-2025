import { describe, it, expect } from 'vitest';
import {
  calculateWinner,
  getWhosTurnItIs,
  getPlayerNameFromSign,
  getRandomPepTalk,
} from '../utils/gameUtils';
import { pepTalks, Sign } from '../utils/constants';
import { Game } from '@prisma/client';

describe('calculateWinner', () => {
  it('detects a draw when the board is full and there is no winner', () => {
    const drawBoard = ['X', 'O', 'X', 'X', 'X', 'O', 'O', 'X', 'O'];
    expect(calculateWinner(drawBoard)).toBe('draw');
  });

  it('detects a winner correctly', () => {
    const winningBoard = ['X', 'X', 'X', '', 'O', 'O', '', '', ''];
    expect(calculateWinner(winningBoard)).toBe('X');
  });

  it('returns null if the game is ongoing', () => {
    const ongoingBoard = ['X', 'O', 'X', '', 'O', 'X', '', '', ''];
    expect(calculateWinner(ongoingBoard)).toBe(null);
  });
});

describe('getWhosTurnItIs', () => {
  it('should return X when the game starts', () => {
    const emptyBoard = ['', '', '', '', '', '', '', '', ''];
    expect(getWhosTurnItIs(emptyBoard)).toBe(Sign.X);
  });

  it('should return O when X has played first', () => {
    const board = ['X', '', '', '', '', '', '', '', ''];
    expect(getWhosTurnItIs(board)).toBe(Sign.O);
  });

  it('should return X if both have played an equal number of times', () => {
    const board = ['X', 'O', '', '', '', '', '', '', ''];
    expect(getWhosTurnItIs(board)).toBe(Sign.X);
  });
});

describe('getPlayerNameFromSign', () => {
  it("should return Player 1's name when sign is X", () => {
    const game = { player1_name: 'Alice', player2_name: 'Bob' } as Game;
    expect(getPlayerNameFromSign(Sign.X, game)).toBe(`❌ Alice `);
  });

  it("should return Player 2's name when sign is O", () => {
    const game = { player1_name: 'Alice', player2_name: 'Bob' } as Game;
    expect(getPlayerNameFromSign(Sign.O, game)).toBe(`⭕ Bob `);
  });

  it('should return an empty string for an invalid sign', () => {
    const game = { player1_name: 'Alice', player2_name: 'Bob' } as Game;
    expect(getPlayerNameFromSign('Z' as Sign, game)).toBe('');
  });
});

describe('getRandomPepTalk', () => {
  it('should return a valid pep talk from the array', () => {
    const pepTalk = getRandomPepTalk();
    expect(pepTalks).toContain(pepTalk);
  });

  it('should return different pep talks on multiple calls', () => {
    const attempts = 10;
    const pepTalks = new Set();

    for (let i = 0; i < attempts; i++) {
      pepTalks.add(getRandomPepTalk());
    }
    expect(pepTalks.size).toBeGreaterThan(1);
  });
});