export type Player = 'X' | 'O' | null;

export interface SquareState {
  value: Player;
}

export interface GameState {
  history: SquareState[][];
  currentMove: number;
}

export interface WinResult {
  winner: Player;
  line: number[] | null;
  isDraw: boolean;
}