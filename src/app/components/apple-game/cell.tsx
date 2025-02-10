import { memo } from "react";

interface CellProps {
  value: number;
  isSelected: boolean;
  onMouseDown: () => void;
  onMouseEnter: () => void;
  onMouseUp: () => void;
}

function Cell({
  value,
  isSelected,
  onMouseDown,
  onMouseEnter,
  onMouseUp,
}: CellProps) {
  return (
    <li
      className={`relative flex h-10 w-10 cursor-pointer select-none items-center justify-center text-lg font-bold ${
        isSelected
          ? "bg-yellow-100"
          : value === 0
            ? "bg-gray-400"
            : "bg-gray-100"
      }`}
      onMouseDown={onMouseDown}
      onMouseEnter={onMouseEnter}
      onMouseUp={onMouseUp}
    >
      {value !== 0 && (
        <>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="rgb(239 68 68)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="absolute mb-1 h-8 w-8 opacity-50"
          >
            <path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z" />
            <path d="M10 2c1 .5 2 2 2 5" />
          </svg>
          <span className="z-10 text-stone-900">{value}</span>
        </>
      )}
    </li>
  );
}

export default memo(Cell);
