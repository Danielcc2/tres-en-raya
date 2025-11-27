import React from 'react';
import { Square } from './Square';
import { Player } from '../types';

interface BoardProps {
  squares: Player[];
  onClick: (i: number) => void;
  winningLine: number[] | null;
  gameOver: boolean;
}

export const Board: React.FC<BoardProps> = ({ squares, onClick, winningLine, gameOver }) => {
  const renderSquare = (i: number) => {
    const isWinningSquare = winningLine?.includes(i) ?? false;
    return (
      <Square
        key={i}
        value={squares[i]}
        onClick={() => onClick(i)}
        isWinningSquare={isWinningSquare}
        disabled={squares[i] !== null || (gameOver && !isWinningSquare)}
      />
    );
  };

  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-3 p-3 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10 shadow-2xl">
      {squares.map((_, i) => renderSquare(i))}
    </div>
  );
};