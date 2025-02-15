"use client";

import { useState, useCallback } from "react";
import Grid from "@/app/components/games/fruit-box/grid";
import GameStats from "@/app/components/games/fruit-box/game-stats";

export default function Home() {
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [activeCombinations, setActiveCombinations] = useState(0);
  const [gridKey, setGridKey] = useState(0);
  const [statsKey, setStatsKey] = useState(0);

  const handleScoreUpdate = useCallback((points: number) => {
    setScore((prev) => prev + points);
  }, []);

  const handleGameOver = useCallback(() => {
    setGameOver(true);
  }, []);

  const handleActiveCombinationsChange = useCallback((combinations: number) => {
    setActiveCombinations(combinations);
  }, []);

  const startGame = useCallback(() => {
    setGameOver(false);
    setScore(0);
    setIsGameStarted(true);
  }, []);

  const restartGame = useCallback(() => {
    setIsGameStarted(false);
    setGameOver(false);
    setScore(0);
    setGridKey((prev) => prev + 1);
    setStatsKey((prev) => prev + 1);
    // Small delay to ensure clean reset
    setTimeout(() => {
      setIsGameStarted(true);
    }, 0);
  }, []);

  const handleTimeUp = useCallback(() => {
    setGameOver(true);
  }, []);

  return (
    <section className="flex min-h-fit flex-col items-center justify-center p-8">
      <h1 className="mb-4 text-4xl font-bold">Fruit Box Game</h1>
      <GameStats
        key={statsKey}
        score={score}
        isGameStarted={isGameStarted}
        gameOver={gameOver}
        onGameOver={handleGameOver}
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
              key={gridKey}
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
