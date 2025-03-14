import { memo } from "react";
import { type Tetromino } from "./utils/tetrominos";
import Cell from "./cell";

interface NextPieceProps {
  tetromino: Tetromino;
}

const NextPiece = memo(function NextPiece({ tetromino }: NextPieceProps) {
  return (
    <div className="flex flex-col items-center">
      <h3 className="mb-2 text-xl font-bold">Next Piece</h3>
      <div className="overflow-hidden rounded-md border-2 bg-stone-800 p-2 shadow-md">
        <div
          className="grid gap-0 p-1"
          style={{
            gridTemplateRows: `repeat(${tetromino.shape.length}, minmax(0, 1fr))`,
            gridTemplateColumns: `repeat(${tetromino.shape[0]?.length ?? 0}, minmax(0, 1fr))`,
          }}
        >
          {tetromino.shape.map((row, y) =>
            row.map((cell, x) => (
              <Cell
                key={`next-${y}-${x}`}
                type={cell as 0 | 1}
                position={[y, x]}
                isPiece={cell !== 0}
                tetrominoType={cell !== 0 ? tetromino.type : "0"}
              />
            )),
          )}
        </div>
      </div>
    </div>
  );
});

export default NextPiece;
