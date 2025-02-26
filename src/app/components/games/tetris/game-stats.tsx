import { memo } from "react";

interface GameStatsProps {
  score: number;
  level: number;
  lines: number;
  isGameStarted: boolean;
  gameOver: boolean;
}

const GameStats = memo(function GameStats({
  score,
  level,
  lines,
  isGameStarted,
  gameOver,
}: GameStatsProps) {
  return (
    <div className="mb-6 flex flex-row items-center justify-center gap-8 text-xl text-stone-700">
      <div className="flex flex-col items-center rounded-md bg-stone-100 px-6 py-2 shadow-md">
        <span className="font-bold">Score</span>
        <span className="text-2xl font-bold">{score}</span>
      </div>

      <div className="flex flex-col items-center rounded-md bg-stone-100 px-6 py-2 shadow-md">
        <span className="font-bold">Level</span>
        <span className="text-2xl font-bold">{level}</span>
      </div>

      <div className="flex flex-col items-center rounded-md bg-stone-100 px-6 py-2 shadow-md">
        <span className="font-bold">Lines</span>
        <span className="text-2xl font-bold">{lines}</span>
      </div>
    </div>
  );
});

export default GameStats;
