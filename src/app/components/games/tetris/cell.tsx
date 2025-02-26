import { memo } from "react";
import { TETROMINOS, type TetrominoType } from "./utils/tetrominos";

interface CellProps {
  type: 0 | 1;
  position: [number, number];
  isPiece: boolean;
  tetrominoType: TetrominoType;
}

const Cell = memo(
  function Cell({ type, position, isPiece, tetrominoType }: CellProps) {
    // Always use the tetromino color when the cell is filled
    const color =
      type === 1 || isPiece ? TETROMINOS[tetrominoType].color : "40, 40, 40";

    const opacity = type === 0 && !isPiece ? 0.1 : 0.8;

    return (
      <div
        className="relative h-6 w-6 border-[1px] border-[rgba(0,0,0,0.1)]"
        style={{
          background: `rgba(${color}, ${opacity})`,
          boxShadow:
            type === 1 || isPiece
              ? "inset 0 0 5px rgba(255,255,255,0.5), inset 0 0 10px rgba(0,0,0,0.3)"
              : "none",
        }}
        data-cell={`${position[0]}-${position[1]}`}
      />
    );
  },
  (prevProps, nextProps) => {
    // Check if the component needs to re-render
    return (
      prevProps.type === nextProps.type &&
      prevProps.isPiece === nextProps.isPiece &&
      prevProps.tetrominoType === nextProps.tetrominoType
    );
  },
);

export default Cell;
