"use client";

import { memo, useEffect } from "react";
import Cell from "./cell";
import { type Tetromino } from "./utils/tetrominos";
import { type BoardCell } from "./hooks/useGameLogic";

interface BoardProps {
  board: BoardCell[][];
  currentPiece: {
    tetromino: Tetromino;
    pos: { x: number; y: number };
    collided: boolean;
  };
  onGameOver: () => void;
}

const Board = memo(function Board({
  board,
  currentPiece,
  onGameOver,
}: BoardProps) {
  const { tetromino, pos } = currentPiece;

  // Check for game over if piece is at the top
  useEffect(() => {
    if (pos.y <= 0 && currentPiece.collided) {
      onGameOver();
    }
  }, [currentPiece.collided, pos.y, onGameOver]);

  // Create a new board representation to include current piece
  const renderBoard = () => {
    // Start with deep copy of the current board
    const boardWithPiece = board.map((row) => row.map((cell) => ({ ...cell })));

    // Add current tetromino to the board
    tetromino.shape.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell !== 0) {
          const boardY = y + pos.y;
          const boardX = x + pos.x;

          // Only update valid board positions
          if (
            boardY >= 0 &&
            boardY < board.length &&
            boardX >= 0 &&
            board[0] &&
            boardX < board[0].length
          ) {
            if (boardWithPiece[boardY]) {
              boardWithPiece[boardY][boardX] = {
                filled: true,
                tetrominoType: tetromino.type,
                isActive: true, // Mark as active piece
              };
            }
          }
        }
      });
    });

    return boardWithPiece;
  };

  const boardWithPiece = renderBoard();

  return (
    <div className="touch-none select-none overflow-hidden rounded-xl border-2 bg-stone-800 p-2 shadow-xl">
      <div
        className="grid gap-0"
        style={{
          gridTemplateRows: `repeat(${board.length}, minmax(0, 1fr))`,
          gridTemplateColumns: `repeat(${board[0]?.length ?? 0}, minmax(0, 1fr))`,
        }}
      >
        {boardWithPiece.map((row, y) =>
          row.map((cell, x) => (
            <Cell
              key={`${y}-${x}`}
              type={cell.filled ? 1 : 0}
              position={[y, x]}
              isPiece={cell?.isActive ?? false}
              tetrominoType={cell.tetrominoType}
            />
          )),
        )}
      </div>
    </div>
  );
});

export default Board;
