import React, { useState, useCallback, useEffect } from 'react';
import { Board } from './components/Board';
import { Player, WinResult } from './types';

const WINNING_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

// Helper function to calculate winner
const calculateWinner = (squares: Player[]): WinResult => {
  for (let i = 0; i < WINNING_LINES.length; i++) {
    const [a, b, c] = WINNING_LINES[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], line: WINNING_LINES[i], isDraw: false };
    }
  }

  const isDraw = squares.every((square) => square !== null);
  return { winner: null, line: null, isDraw };
};

// Algoritmo heurístico para la CPU (Sin IA Generativa)
const getComputerMove = (squares: Player[]): number => {
  // Función auxiliar para encontrar movimientos ganadores o de bloqueo
  const findCriticalMove = (player: Player) => {
    for (let i = 0; i < WINNING_LINES.length; i++) {
      const [a, b, c] = WINNING_LINES[i];
      const lineValues = [squares[a], squares[b], squares[c]];
      const playerCount = lineValues.filter(val => val === player).length;
      const emptyCount = lineValues.filter(val => val === null).length;

      if (playerCount === 2 && emptyCount === 1) {
        if (squares[a] === null) return a;
        if (squares[b] === null) return b;
        if (squares[c] === null) return c;
      }
    }
    return null;
  };

  // 1. Intentar ganar
  const winMove = findCriticalMove('O');
  if (winMove !== null) return winMove;

  // 2. Bloquear al jugador para que no gane
  const blockMove = findCriticalMove('X');
  if (blockMove !== null) return blockMove;

  // 3. Tomar el centro si está disponible (estrategia óptima)
  if (squares[4] === null) return 4;

  // 4. Tomar esquinas disponibles
  const corners = [0, 2, 6, 8].filter(i => squares[i] === null);
  if (corners.length > 0) {
    return corners[Math.floor(Math.random() * corners.length)];
  }

  // 5. Tomar lados disponibles
  const sides = [1, 3, 5, 7].filter(i => squares[i] === null);
  if (sides.length > 0) {
    return sides[Math.floor(Math.random() * sides.length)];
  }

  return -1;
};

type GameMode = 'PvP' | 'PvC';

export default function App() {
  const [history, setHistory] = useState<Player[][]>([Array(9).fill(null)]);
  const [currentMove, setCurrentMove] = useState(0);
  const [gameMode, setGameMode] = useState<GameMode>('PvC');
  const [isComputerThinking, setIsComputerThinking] = useState(false);
  
  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove];
  const { winner, line: winningLine, isDraw } = calculateWinner(currentSquares);

  const handlePlay = useCallback((i: number) => {
    // Nota: Eliminamos isComputerThinking de aquí para que la CPU pueda ejecutar su movimiento
    // El usuario ya está bloqueado por la propiedad 'disabled' en los botones del tablero
    if (calculateWinner(currentSquares).winner || currentSquares[i]) {
      return;
    }

    const nextSquares = currentSquares.slice();
    nextSquares[i] = xIsNext ? 'X' : 'O';

    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }, [currentSquares, currentMove, history, xIsNext]);

  // Efecto para el turno de la CPU
  useEffect(() => {
    if (gameMode === 'PvC' && !xIsNext && !winner && !isDraw) {
      setIsComputerThinking(true);
      const timer = setTimeout(() => {
        const move = getComputerMove(currentSquares);
        if (move !== -1) {
          handlePlay(move);
        }
        setIsComputerThinking(false);
      }, 600); // Pequeño retraso para naturalidad
      return () => clearTimeout(timer);
    }
  }, [gameMode, xIsNext, winner, isDraw, currentSquares, handlePlay]);

  const jumpTo = (move: number) => {
    setCurrentMove(move);
    setIsComputerThinking(false); // Reset thinking state if jumping
  };

  const resetGame = (newMode?: GameMode) => {
    setHistory([Array(9).fill(null)]);
    setCurrentMove(0);
    setIsComputerThinking(false);
    if (newMode) setGameMode(newMode);
  };

  const getStatusMessage = () => {
    if (winner) return `🎉 ¡Ganó ${winner === 'X' && gameMode === 'PvC' ? 'el Jugador' : winner === 'O' && gameMode === 'PvC' ? 'la CPU' : winner}!`;
    if (isDraw) return '¡Empate!';
    if (gameMode === 'PvC') {
      return xIsNext ? 'Tu turno (X)' : 'Pensando...';
    }
    return `Siguiente: ${xIsNext ? 'X' : 'O'}`;
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center py-10 px-4 selection:bg-indigo-500/30">
      
      {/* Header */}
      <header className="mb-8 text-center">
        <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-game-secondary to-game-primary bg-clip-text text-transparent pb-2">
          Tres en Raya
        </h1>
        <p className="text-slate-400 text-sm md:text-base mt-2">
          Clásico juego de estrategia
        </p>

        {/* Mode Selector */}
        <div className="mt-6 inline-flex bg-slate-800/50 p-1 rounded-xl border border-white/10 backdrop-blur-sm">
          <button
            onClick={() => gameMode !== 'PvP' && resetGame('PvP')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
              gameMode === 'PvP' 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
            </svg>
            Local (1v1)
          </button>
          <button
            onClick={() => gameMode !== 'PvC' && resetGame('PvC')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
              gameMode === 'PvC' 
                ? 'bg-pink-600 text-white shadow-lg shadow-pink-500/20' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 4.4A1 1 0 0116 14H6a3 3 0 01-3-3V6zm5.5 1.5a1 1 0 10-2 0 1 1 0 002 0zM7 10a1 1 0 110-2 1 1 0 010 2zm3.5 1.5a1 1 0 10-2 0 1 1 0 002 0zM10 10a1 1 0 110-2 1 1 0 010 2zm3.5 1.5a1 1 0 10-2 0 1 1 0 002 0zM13 10a1 1 0 110-2 1 1 0 010 2z" clipRule="evenodd" />
            </svg>
            Contra CPU
          </button>
        </div>
      </header>

      {/* Main Game Area */}
      <main className="flex flex-col md:flex-row gap-8 items-start max-w-4xl w-full justify-center">
        
        {/* Left Column: Board & Controls */}
        <div className="flex flex-col items-center gap-6 w-full md:w-auto">
          
          {/* Status Badge */}
          <div className={`
            px-6 py-3 rounded-full font-bold text-lg shadow-lg backdrop-blur-md transition-colors duration-300 border min-w-[200px] text-center
            ${winner 
              ? 'bg-green-500/20 border-green-500/50 text-green-400' 
              : isDraw 
                ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400'
                : 'bg-white/5 border-white/10 text-white'
            }
          `}>
            {getStatusMessage()}
          </div>

          <Board 
            squares={currentSquares} 
            onClick={handlePlay} 
            winningLine={winningLine}
            gameOver={!!winner || isDraw || (gameMode === 'PvC' && !xIsNext)}
          />

          <button
            onClick={() => resetGame()}
            className="w-full py-3 px-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-semibold transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform group-hover:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reiniciar Partida
          </button>
        </div>

        {/* Right Column: History */}
        <div className="w-full md:w-64 bg-white/5 rounded-2xl p-4 border border-white/10 backdrop-blur-sm h-fit max-h-[500px] overflow-hidden flex flex-col">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Historial
          </h2>
          
          <div className="overflow-y-auto space-y-2 pr-1 custom-scrollbar flex-1">
            {history.map((_, move) => {
              const isCurrentMove = move === currentMove;
              return (
                <button
                  key={move}
                  onClick={() => jumpTo(move)}
                  disabled={isComputerThinking}
                  className={`
                    w-full text-left px-4 py-3 rounded-lg text-sm transition-all border
                    ${isCurrentMove 
                      ? 'bg-indigo-600 border-indigo-500 shadow-lg shadow-indigo-500/20 text-white font-bold' 
                      : 'bg-slate-800/50 border-slate-700/50 hover:bg-slate-700 text-slate-300'
                    }
                    ${isComputerThinking ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  <div className="flex justify-between items-center">
                    <span>
                      {move === 0 ? '🏁 Inicio' : `Movimiento #${move}`}
                    </span>
                    {isCurrentMove && (
                      <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

      </main>

      <footer className="mt-12 text-slate-500 text-sm">
        Desarrollado por DanielCC
      </footer>

      {/* Custom Scrollbar Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </div>
  );
}
