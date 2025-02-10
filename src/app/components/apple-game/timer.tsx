import { memo, useEffect } from "react";

interface TimerProps {
  timeLeft: number;
  setTimeLeft: (time: number) => void;
  isGameStarted: boolean;
  gameOver: boolean;
  onTimeUp: () => void;
}

function Timer({
  timeLeft,
  setTimeLeft,
  isGameStarted,
  gameOver,
  onTimeUp,
}: TimerProps) {
  useEffect(() => {
    let timerId: NodeJS.Timeout;
    if (isGameStarted && timeLeft > 0 && !gameOver) {
      timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0 && isGameStarted) {
      onTimeUp();
    }
    return () => clearTimeout(timerId);
  }, [timeLeft, gameOver, isGameStarted, setTimeLeft, onTimeUp]);

  return <span>Time Remaining: {timeLeft}s</span>;
}

export default memo(Timer);
