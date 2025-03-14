import { memo } from "react";

interface CellProps {
  value: number;
  isSelected: boolean;
  onMouseDown: () => void;
  onMouseEnter: () => void;
  onTouchStart: () => void;
  onTouchMove: () => void;
  position: [number, number];
}

const Cell = memo(
  function Cell({
    value,
    isSelected,
    onMouseDown,
    onMouseEnter,
    onTouchStart,
    onTouchMove,
    position,
  }: CellProps) {
    const [row, col] = position;

    const handleMouseDown = (e: React.MouseEvent) => {
      e.preventDefault();
      onMouseDown();
    };

    const handleTouchStart = (e: React.TouchEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onTouchStart();
    };

    const handleTouchMove = (e: React.TouchEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onTouchMove();
    };

    return (
      <li
        className={`relative flex h-10 w-10 cursor-pointer touch-none select-none items-center justify-center text-lg font-bold ${
          isSelected
            ? "bg-yellow-100"
            : value === 0
              ? "bg-gray-400"
              : "bg-gray-100"
        }`}
        onMouseDown={handleMouseDown}
        onMouseEnter={onMouseEnter}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        data-cell={`${row}-${col}`}
      >
        {value !== 0 && (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="oklch(0.808 0.114 19.571)"
              stroke="oklch(0.808 0.114 19.571)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="absolute mb-1 h-8 w-8"
            >
              <path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z" />
              <path d="M10 2c1 .5 2 2 2 5" />
            </svg>
            <span className="z-10 text-stone-900">{value}</span>
          </>
        )}
      </li>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.value === nextProps.value &&
      prevProps.isSelected === nextProps.isSelected &&
      prevProps.position[0] === nextProps.position[0] &&
      prevProps.position[1] === nextProps.position[1]
    );
  },
);

export default Cell;
