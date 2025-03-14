import { memo, useState, useEffect } from "react";
import Timer from "./timer";

interface GameStatsProps {
  score: number;
  isGameStarted: boolean;
  gameOver: boolean;
  onGameOver: () => void;
  activeCombinations: number;
}

const GameStats = memo(function GameStats({
  score,
  isGameStarted,
  gameOver,
  onGameOver,
  activeCombinations,
}: GameStatsProps) {
  const [timeLeft, setTimeLeft] = useState(120);

  useEffect(() => {
    if (isGameStarted && !gameOver) {
      setTimeLeft(120);
    }
  }, [isGameStarted, gameOver]);

  useEffect(() => {
    // End game when time runs out
    if (timeLeft <= 0 && isGameStarted && !gameOver) {
      onGameOver();
    }
  }, [timeLeft, isGameStarted, gameOver, onGameOver]);

  return (
    <div className="mb-4 flex flex-col items-center text-xl">
      <span className="mr-4">Score: {score}/170</span>
      <Timer
        timeLeft={timeLeft}
        setTimeLeft={setTimeLeft}
        isGameStarted={isGameStarted}
        gameOver={gameOver}
        onTimeUp={onGameOver}
      />
      <span>Combos Left: {activeCombinations}</span>
    </div>
  );
});

export default GameStats;
