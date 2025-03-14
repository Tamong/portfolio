export type TetrominoType = "I" | "J" | "L" | "O" | "S" | "T" | "Z" | "0";

export interface Tetromino {
  shape: number[][];
  color: string;
  type: TetrominoType;
}

// Changed from index signature to Record type
type TetrominoShapeMap = Record<
  TetrominoType,
  {
    shape: number[][];
    color: string;
  }
>;

export const TETROMINOS: TetrominoShapeMap = {
  "0": { shape: [[0]], color: "0, 0, 0" },
  I: {
    shape: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    color: "80, 227, 230", // cyan
  },
  J: {
    shape: [
      [0, 1, 0],
      [0, 1, 0],
      [1, 1, 0],
    ],
    color: "36, 95, 223", // blue
  },
  L: {
    shape: [
      [0, 1, 0],
      [0, 1, 0],
      [0, 1, 1],
    ],
    color: "223, 173, 36", // orange
  },
  O: {
    shape: [
      [1, 1],
      [1, 1],
    ],
    color: "223, 217, 36", // yellow
  },
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0],
    ],
    color: "48, 211, 56", // green
  },
  T: {
    shape: [
      [0, 0, 0],
      [1, 1, 1],
      [0, 1, 0],
    ],
    color: "132, 61, 198", // purple
  },
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0],
    ],
    color: "227, 78, 78", // red
  },
};

export const randomTetromino = (): Tetromino => {
  const tetrominos: TetrominoType[] = ["I", "J", "L", "O", "S", "T", "Z"];
  const randTetromino =
    tetrominos[Math.floor(Math.random() * tetrominos.length)];
  if (!randTetromino) {
    throw new Error("Failed to generate a random tetromino");
  }
  return {
    ...TETROMINOS[randTetromino],
    type: randTetromino,
  };
};
