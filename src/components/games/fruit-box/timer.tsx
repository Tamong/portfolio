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

    if (isGameStarted && !gameOver) {
      if (timeLeft > 0) {
        timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      } else {
        // Ensure we call onTimeUp when time reaches 0
        onTimeUp();
      }
    }

    return () => clearTimeout(timerId);
  }, [timeLeft, gameOver, isGameStarted, setTimeLeft, onTimeUp]);

  return <span>Time Remaining: {Math.max(0, timeLeft)}s</span>;
}

export default memo(Timer);
