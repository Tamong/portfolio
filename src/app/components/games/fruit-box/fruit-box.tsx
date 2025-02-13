"use client";

import { useState, useCallback } from "react";
import Grid from "@/app/components/games/fruit-box/grid";
import GameStats from "@/app/components/games/fruit-box/game-stats";

export default function Home() {
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [activeCombinations, setActiveCombinations] = useState(0);

  const handleScoreUpdate = useCallback((points: number) => {
    setScore((prev) => prev + points);
  }, []);

  const handleGameOver = useCallback(() => {
    setGameOver(true);
  }, []);

  const handleActiveCombinationsChange = useCallback((combinations: number) => {
    setActiveCombinations(combinations);
  }, []);

  const startGame = () => {
    setIsGameStarted(true);
    setGameOver(false);
    setScore(0);
    setTimeLeft(120);
  };

  const restartGame = () => {
    setGameOver(false);
    setScore(0);
    setTimeLeft(120);
    setIsGameStarted(true);
  };

  const handleTimeUp = useCallback(() => {
    setGameOver(true);
  }, []);

  return (
    <section className="flex min-h-fit flex-col items-center justify-center p-8">
      <h1 className="mb-4 text-4xl font-bold">Fruit Box Game</h1>
      <GameStats
        score={score}
        timeLeft={timeLeft}
        setTimeLeft={setTimeLeft}
        isGameStarted={isGameStarted}
        gameOver={gameOver}
        onTimeUp={handleTimeUp}
        activeCombinations={activeCombinations}
      />
      {!isGameStarted ? (
        <button onClick={startGame}>Start Game</button>
      ) : gameOver ? (
        <div className="flex flex-col items-center">
          <div className="mb-4 text-2xl font-bold text-red-500">Game Over!</div>
          <button onClick={restartGame}>Restart Game</button>
        </div>
      ) : (
        <>
          <div className="mb-8">
            <Grid
              onScoreUpdate={handleScoreUpdate}
              onGameOver={handleGameOver}
              onActiveCombinationsChange={handleActiveCombinationsChange}
            />
          </div>
        </>
      )}
    </section>
  );
}
