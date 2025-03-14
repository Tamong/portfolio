"use client";

import { useState, useCallback, useEffect } from "react";
import Board from "./board";
import GameStats from "./game-stats";
import NextPiece from "./next-piece";
import { useGameLogic } from "./hooks/useGameLogic";

export default function Tetris() {
  const [gameOver, setGameOver] = useState(false);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [boardKey, setBoardKey] = useState(0);
  const [statsKey, setStatsKey] = useState(0);

  const {
    board,
    score,
    level,
    lines,
    currentPiece,
    nextPiece,
    movePiece,
    rotatePiece,
    dropPiece,
    resetGame,
  } = useGameLogic(isGameStarted, gameOver);

  const handleGameOver = useCallback(() => {
    setGameOver(true);
  }, []);

  const startGame = useCallback(() => {
    setGameOver(false);
    setIsGameStarted(true);
    resetGame();
  }, [resetGame]);

  const restartGame = useCallback(() => {
    setIsGameStarted(false);
    setGameOver(false);
    setBoardKey((prev) => prev + 1);
    setStatsKey((prev) => prev + 1);

    // Small delay to ensure clean reset
    setTimeout(() => {
      setIsGameStarted(true);
      resetGame();
    }, 0);
  }, [resetGame]);

  // Handle keyboard controls
  useEffect(() => {
    if (!isGameStarted || gameOver) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default scrolling behavior for arrow keys and space
      if (
        ["ArrowLeft", "ArrowRight", "ArrowDown", "ArrowUp", " "].includes(e.key)
      ) {
        e.preventDefault();
      }

      if (e.key === "ArrowLeft") {
        movePiece(-1, 0);
      } else if (e.key === "ArrowRight") {
        movePiece(1, 0);
      } else if (e.key === "ArrowDown") {
        movePiece(0, 1);
      } else if (e.key === "ArrowUp") {
        rotatePiece();
      } else if (e.key === " ") {
        dropPiece();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isGameStarted, gameOver, movePiece, rotatePiece, dropPiece]);

  return (
    <section className="flex min-h-fit flex-col items-center justify-center p-8">
      <h1 className="mb-4 text-4xl font-bold">Tetris</h1>

      <GameStats
        key={statsKey}
        score={score}
        level={level}
        lines={lines}
        isGameStarted={isGameStarted}
        gameOver={gameOver}
      />

      {!isGameStarted ? (
        <button
          onClick={startGame}
          className="rounded-md bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700"
        >
          Start Game
        </button>
      ) : gameOver ? (
        <div className="flex flex-col items-center">
          <div className="mb-4 text-2xl font-bold text-red-500">Game Over!</div>
          <button
            onClick={restartGame}
            className="rounded-md bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700"
          >
            Restart Game
          </button>
        </div>
      ) : (
        <div className="flex flex-row items-start justify-center gap-8">
          <Board
            key={boardKey}
            board={board}
            currentPiece={currentPiece}
            onGameOver={handleGameOver}
          />
          <div className="flex flex-col">
            <NextPiece tetromino={nextPiece} />
            <div className="mt-8">
              <h3 className="mb-2 text-xl font-bold">Controls:</h3>
              <p>← → : Move piece</p>
              <p>↑ : Rotate piece</p>
              <p>↓ : Move down</p>
              <p>Space : Drop piece</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
