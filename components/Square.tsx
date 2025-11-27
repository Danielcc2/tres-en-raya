import React from 'react';
import { Player } from '../types';

interface SquareProps {
  value: Player;
  onClick: () => void;
  isWinningSquare: boolean;
  disabled: boolean;
}

export const Square: React.FC<SquareProps> = ({ value, onClick, isWinningSquare, disabled }) => {
  return (
    <button
      className={`
        h-20 w-20 sm:h-24 sm:w-24 md:h-28 md:w-28
        border-2 border-white/10 rounded-xl
        flex items-center justify-center
        text-4xl sm:text-5xl md:text-6xl font-bold
        transition-all duration-300 ease-out
        hover:bg-white/5 active:scale-95
        ${isWinningSquare ? 'bg-green-500/20 border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.5)]' : 'bg-white/5'}
        ${disabled ? 'cursor-default' : 'cursor-pointer hover:border-white/30'}
        ${value === 'X' ? 'text-game-secondary' : 'text-game-primary'}
      `}
      onClick={onClick}
      disabled={disabled}
    >
      <span className={`transform transition-transform duration-300 ${value ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}>
        {value}
      </span>
    </button>
  );
};