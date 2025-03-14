import { useState, useCallback, useEffect } from "react";
import {
  randomTetromino,
  type Tetromino,
  type TetrominoType,
} from "../utils/tetrominos";

// Constants
const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const TICK_SPEED_BASE = 1000; // Base speed in milliseconds

interface GamePiece {
  tetromino: Tetromino;
  pos: { x: number; y: number };
  collided: boolean;
}

// Updated BoardCell interface to include isActive property
export interface BoardCell {
  filled: boolean;
  tetrominoType: TetrominoType;
  isActive?: boolean; // Optional property used in the Board component
}

export const useGameLogic = (isGameStarted: boolean, gameOver: boolean) => {
  // Game state
  const [board, setBoard] = useState<BoardCell[][]>([]);
  const [currentPiece, setCurrentPiece] = useState<GamePiece>({
    tetromino: randomTetromino(),
    pos: { x: 0, y: 0 },
    collided: false,
  });
  const [nextPiece, setNextPiece] = useState<Tetromino>(randomTetromino());
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [level, setLevel] = useState(1);
  const [dropTime, setDropTime] = useState<number | null>(null);

  // Create a clean board - fixed to avoid reference equality issues
  const createEmptyBoard = useCallback((): BoardCell[][] => {
    return Array.from(Array(BOARD_HEIGHT), () =>
      Array.from(Array(BOARD_WIDTH), () => ({
        filled: false,
        tetrominoType: "0" as const,
      })),
    );
  }, []);

  // Reset game to initial state
  const resetGame = useCallback(() => {
    setBoard(createEmptyBoard());
    setCurrentPiece({
      tetromino: randomTetromino(),
      pos: { x: Math.floor(BOARD_WIDTH / 2) - 2, y: 0 },
      collided: false,
    });
    setNextPiece(randomTetromino());
    setScore(0);
    setLines(0);
    setLevel(1);
    setDropTime(TICK_SPEED_BASE);
  }, [createEmptyBoard]);

  // Initialize empty board
  useEffect(() => {
    setBoard(createEmptyBoard());
  }, [createEmptyBoard]);

  // Check for collision
  const checkCollision = useCallback(
    (piece: GamePiece, board: BoardCell[][], movement = { x: 0, y: 0 }) => {
      // Early validation of tetromino shape
      if (!piece.tetromino.shape?.length) {
        return false;
      }

      for (let y = 0; y < piece.tetromino.shape.length; y++) {
        // Check if this row exists in the shape
        const row = piece.tetromino.shape[y];
        if (!row) continue;

        for (let x = 0; x < row.length; x++) {
          // Skip empty squares
          if (row[x] === 0) continue;

          // Calculate new position
          const newX = piece.pos.x + x + movement.x;
          const newY = piece.pos.y + y + movement.y;

          // Check boundaries
          if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) {
            return true;
          }

          // Check if already occupied - using optional chaining to handle out-of-bounds
          if (board[newY]?.[newX]?.filled) {
            return true;
          }
        }
      }
      return false;
    },
    [],
  );

  // Update board with merged pieces - fixed cloning method
  const updateBoard = useCallback(
    (prevBoard: BoardCell[][], piece: GamePiece): BoardCell[][] => {
      // Create a deep copy without JSON parsing
      const newBoard: BoardCell[][] = prevBoard.map((row) =>
        row.map((cell) => ({ ...cell })),
      );

      piece.tetromino.shape.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value !== 0) {
            const boardY = y + piece.pos.y;
            const boardX = x + piece.pos.x;

            // Only update cells within board boundaries
            if (
              boardY >= 0 &&
              boardY < BOARD_HEIGHT &&
              boardX >= 0 &&
              boardX < BOARD_WIDTH
            ) {
              newBoard[boardY]![boardX] = {
                filled: true,
                tetrominoType: piece.tetromino.type,
              };
            }
          }
        });
      });

      return newBoard;
    },
    [],
  );

  // Check and clear completed rows - fixed cloning method
  const clearRows = useCallback(
    (board: BoardCell[][]): BoardCell[][] => {
      let rowsCleared = 0;
      const newBoard = board.reduce((acc: BoardCell[][], row) => {
        if (row.every((cell) => cell.filled)) {
          rowsCleared++;
          // Add an empty row at the top instead
          acc.unshift(
            Array.from(Array(BOARD_WIDTH), () => ({
              filled: false,
              tetrominoType: "0" as const,
            })),
          );
          return acc;
        }
        // Properly clone the row
        acc.push(row.map((cell) => ({ ...cell })));
        return acc;
      }, []);

      // Update score and lines
      if (rowsCleared > 0) {
        // Score based on cleared rows (similar to classic Tetris)
        const linePoints = [40, 100, 300, 1200]; // Points for 1, 2, 3, 4 rows
        setScore(
          (prev) =>
            prev + (linePoints[Math.min(rowsCleared, 4) - 1] ?? 0) * level,
        );
        setLines((prev) => prev + rowsCleared);

        // Level up after every 10 lines
        if (lines + rowsCleared >= level * 10) {
          setLevel((prev) => prev + 1);
          // Increase game speed
          setDropTime(TICK_SPEED_BASE / level - level * 20);
        }
      }

      return newBoard;
    },
    [level, lines],
  );

  // Move tetromino left/right/down - no changes needed
  const movePiece = useCallback(
    (x: number, y: number) => {
      if (!gameOver) {
        const newPos = { x: currentPiece.pos.x + x, y: currentPiece.pos.y + y };
        if (!checkCollision({ ...currentPiece, pos: newPos }, board)) {
          setCurrentPiece((prev) => ({
            ...prev,
            pos: newPos,
            collided: false,
          }));
        } else if (y > 0) {
          // We're moving down and have a collision
          setCurrentPiece((prev) => ({
            ...prev,
            collided: true,
          }));
        }
      }
    },
    [gameOver, currentPiece, board, checkCollision],
  );

  // Rotate tetromino - ensuring we create proper copies
  const rotatePiece = useCallback(() => {
    if (gameOver) return;

    // Deep clone with a more reliable approach
    const clonedPiece: GamePiece = {
      ...currentPiece,
      tetromino: {
        ...currentPiece.tetromino,
        shape: currentPiece.tetromino.shape.map((row) => [...row]),
      },
    };

    // Rotate matrix clockwise
    const rotatedShape = clonedPiece.tetromino.shape?.[0]?.map((_, index) =>
      clonedPiece.tetromino.shape.map((row) => row[row.length - 1 - index]),
    );

    if (rotatedShape) {
      clonedPiece.tetromino.shape = rotatedShape as number[][];
    }

    // Wall kick testing: try different positions if rotation causes collision
    const offset = 1;

    // Original position
    if (!checkCollision(clonedPiece, board)) {
      setCurrentPiece(clonedPiece);
      return;
    }

    // Try moving right
    clonedPiece.pos.x += offset;
    if (!checkCollision(clonedPiece, board)) {
      setCurrentPiece(clonedPiece);
      return;
    }

    // Try moving left
    clonedPiece.pos.x -= offset * 2;
    if (!checkCollision(clonedPiece, board)) {
      setCurrentPiece(clonedPiece);
      return;
    }

    // Revert position and shape if all fails
    clonedPiece.pos.x = currentPiece.pos.x;
  }, [gameOver, currentPiece, board, checkCollision]);

  // Hard drop - no changes needed
  const dropPiece = useCallback(() => {
    if (gameOver) return;

    let newY = currentPiece.pos.y;

    while (
      !checkCollision(
        { ...currentPiece, pos: { ...currentPiece.pos, y: newY + 1 } },
        board,
      )
    ) {
      newY++;
    }

    setCurrentPiece((prev) => ({
      ...prev,
      pos: { ...prev.pos, y: newY },
      collided: true,
    }));
  }, [gameOver, currentPiece, board, checkCollision]);

  // Handle piece collision and generate new pieces
  useEffect(() => {
    if (!isGameStarted || gameOver) return;

    if (currentPiece.collided) {
      // Merge current piece into the board
      const mergedBoard = updateBoard(board, currentPiece);
      // Clear completed rows
      const clearedBoard = clearRows(mergedBoard);

      setBoard(clearedBoard);

      // Generate new tetromino
      setCurrentPiece({
        tetromino: nextPiece,
        pos: { x: Math.floor(BOARD_WIDTH / 2) - 2, y: 0 },
        collided: false,
      });

      // Prepare next tetromino
      setNextPiece(randomTetromino());
    }
  }, [
    isGameStarted,
    gameOver,
    currentPiece.collided,
    board,
    currentPiece,
    nextPiece,
    updateBoard,
    clearRows,
  ]);

  // Auto drop piece at regular intervals - no changes needed
  useEffect(() => {
    if (!isGameStarted || gameOver || !dropTime) return;

    const gameLoop = setInterval(() => {
      movePiece(0, 1);
    }, dropTime);

    return () => clearInterval(gameLoop);
  }, [isGameStarted, gameOver, dropTime, movePiece]);

  // Set drop time based on game state - no changes needed
  useEffect(() => {
    if (isGameStarted && !gameOver) {
      setDropTime(TICK_SPEED_BASE / level);
    } else {
      setDropTime(null);
    }
  }, [isGameStarted, gameOver, level]);

  // Start game - initialize if needed - no changes needed
  useEffect(() => {
    if (isGameStarted && !gameOver && board.length === 0) {
      resetGame();
    }
  }, [isGameStarted, gameOver, board.length, resetGame]);

  return {
    board,
    score,
    level,
    lines,
    currentPiece,
    nextPiece,
    movePiece,
    rotatePiece,
    dropPiece,
    resetGame,
  };
};
