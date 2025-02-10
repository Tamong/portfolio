import { memo } from "react";
import Timer from "./timer";

interface GameStatsProps {
  score: number;
  timeLeft: number;
  setTimeLeft: (time: number) => void;
  isGameStarted: boolean;
  gameOver: boolean;
  onTimeUp: () => void;
  activeCombinations: number;
}

const GameStats = memo(function GameStats({
  score,
  timeLeft,
  setTimeLeft,
  isGameStarted,
  gameOver,
  onTimeUp,
  activeCombinations,
}: GameStatsProps) {
  return (
    <div className="mb-4 flex flex-col items-center text-xl">
      <span className="mr-4">Score: {score}/170</span>
      <Timer
        timeLeft={timeLeft}
        setTimeLeft={setTimeLeft}
        isGameStarted={isGameStarted}
        gameOver={gameOver}
        onTimeUp={onTimeUp}
      />
      <span>Combos Left: {activeCombinations}</span>
    </div>
  );
});

export default GameStats;
