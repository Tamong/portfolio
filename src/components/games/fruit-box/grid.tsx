"use client";

import { useState, useEffect, useCallback, useMemo, memo } from "react";
import Cell from "./cell";
import React from "react";

interface GridProps {
  onScoreUpdate: (points: number) => void;
  onGameOver: () => void;
  onActiveCombinationsChange: (combinations: number) => void;
}

interface SelectionBox {
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
}

const Grid = memo(function Grid({
  onScoreUpdate,
  onGameOver,
  onActiveCombinationsChange,
}: GridProps) {
  const [grid, setGrid] = useState<number[][]>([]);
  const [selectionBox, setSelectionBox] = useState<SelectionBox | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const initializeGrid = useCallback(() => {
    // First generate the grid with random numbers
    const newGrid = Array(10)
      .fill(null)
      .map(() =>
        Array(17)
          .fill(null)
          .map(() => Math.floor(Math.random() * 9) + 1),
      );

    // Calculate total sum
    const totalSum = newGrid.reduce(
      (sum, row) => sum + row.reduce((rowSum, cell) => rowSum + cell, 0),
      0,
    );

    // Adjust the last cell to make total sum a multiple of 10
    const lastRow = newGrid.length - 1;
    const lastCol = newGrid[0] ? newGrid[0].length - 1 : 0;
    const currentLastValue = newGrid[lastRow]?.[lastCol] ?? 0;
    const remainder = totalSum % 10;

    if (remainder !== 0) {
      const adjustment =
        remainder <= currentLastValue ? -remainder : 10 - remainder;
      if (newGrid[lastRow]) {
        newGrid[lastRow][lastCol] = Math.max(1, currentLastValue + adjustment);
      }
    }

    setGrid(newGrid);
    return newGrid;
  }, []);

  useEffect(() => {
    const newGrid = initializeGrid();
    const { count } = getActiveCombinations(newGrid);
    onActiveCombinationsChange(count);
  }, [initializeGrid, onActiveCombinationsChange]);

  useEffect(() => {
    const { count } = getActiveCombinations(grid);
    onActiveCombinationsChange(count);
    if (count === 0 && grid.length > 0) {
      onGameOver();
    }
  }, [grid, onActiveCombinationsChange, onGameOver]);

  const getSelectedCells = useCallback(
    (box: SelectionBox) => {
      const cells = [];
      const minRow = Math.min(box.startRow, box.endRow);
      const maxRow = Math.max(box.startRow, box.endRow);
      const minCol = Math.min(box.startCol, box.endCol);
      const maxCol = Math.max(box.startCol, box.endCol);

      for (let row = minRow; row <= maxRow; row++) {
        for (let col = minCol; col <= maxCol; col++) {
          if (grid[row]?.[col] !== 0) {
            cells.push({ row, col });
          }
        }
      }
      return cells;
    },
    [grid],
  );

  const removeSelection = useCallback(
    (cellsToRemove: { row: number; col: number }[]) => {
      const newGrid = grid.map((row) => [...row]);
      cellsToRemove.forEach(({ row, col }) => {
        if (newGrid[row]) {
          newGrid[row][col] = 0; // Use 0 to represent a blank cell
        }
      });
      setGrid(newGrid);
    },
    [grid],
  );

  const handleMouseDown = useCallback((row: number, col: number) => {
    setIsDragging(true);
    setSelectionBox({ startRow: row, startCol: col, endRow: row, endCol: col });
  }, []);

  const handleMouseEnter = useCallback(
    (row: number, col: number) => {
      if (isDragging) {
        setSelectionBox((prev) => ({
          ...prev!,
          endRow: row,
          endCol: col,
        }));
      }
    },
    [isDragging],
  );

  const handleMouseUp = useCallback(() => {
    if (!isDragging) return;

    if (selectionBox) {
      const selectedCells = getSelectedCells(selectionBox);
      const sum = selectedCells.reduce(
        (acc, { row, col }) => acc + (grid[row]?.[col] ?? 0),
        0,
      );
      if (sum === 10) {
        onScoreUpdate(selectedCells.length);
        removeSelection(selectedCells);
      }
    }
    setIsDragging(false);
    setSelectionBox(null);
  }, [
    isDragging,
    grid,
    selectionBox,
    onScoreUpdate,
    getSelectedCells,
    removeSelection,
  ]);

  const handleTouchStart = useCallback((row: number, col: number) => {
    setIsDragging(true);
    setSelectionBox({ startRow: row, startCol: col, endRow: row, endCol: col });
  }, []);

  const handleTouchMove = useCallback(
    (row: number, col: number) => {
      if (isDragging) {
        setSelectionBox((prev) => ({
          ...prev!,
          endRow: row,
          endCol: col,
        }));
      }
    },
    [isDragging],
  );

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        // Get all elements under the mouse position using elementsFromPoint
        const elements = document.elementsFromPoint(e.clientX, e.clientY);
        // Find the first element with data-cell attribute
        const cellElement = elements.find((el) => el.hasAttribute("data-cell"));

        if (cellElement?.hasAttribute("data-cell")) {
          const [row, col] = cellElement
            .getAttribute("data-cell")!
            .split("-")
            .map(Number);
          if (row !== undefined && col !== undefined) {
            handleMouseEnter(row, col);
          }
        }
      }
    };

    const handleGlobalMouseUp = () => {
      handleMouseUp();
    };

    const handleGlobalTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (isDragging) {
        const touch = e.touches[0];
        if (!touch) return;

        // Get all elements under the touch point
        const elements = document.elementsFromPoint(
          touch.clientX,
          touch.clientY,
        );
        // Find the first element with data-cell attribute
        const cellElement = elements.find((el) => el.hasAttribute("data-cell"));

        if (cellElement?.hasAttribute("data-cell")) {
          const [row, col] = cellElement
            .getAttribute("data-cell")!
            .split("-")
            .map(Number);
          if (row !== undefined && col !== undefined) {
            handleTouchMove(row, col);
          }
        }
      }
    };

    const handleGlobalTouchEnd = () => {
      handleMouseUp();
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleGlobalMouseMove);
      document.addEventListener("mouseup", handleGlobalMouseUp);
      document.addEventListener("touchmove", handleGlobalTouchMove, {
        passive: false,
      });
      document.addEventListener("touchend", handleGlobalTouchEnd);
      document.addEventListener("touchcancel", handleGlobalTouchEnd);
    }

    return () => {
      document.removeEventListener("mousemove", handleGlobalMouseMove);
      document.removeEventListener("mouseup", handleGlobalMouseUp);
      document.removeEventListener("touchmove", handleGlobalTouchMove);
      document.removeEventListener("touchend", handleGlobalTouchEnd);
      document.removeEventListener("touchcancel", handleGlobalTouchEnd);
    };
  }, [isDragging, handleMouseEnter, handleMouseUp, handleTouchMove]);

  const getActiveCombinations = (grid: number[][]) => {
    if (!grid.length) return { count: 0, list: [] };

    let count = 0;
    const list: string[] = [];
    const directions: [number, number][] = [
      [0, 1], // horizontal
      [1, 0], // vertical
      [1, 1], // diagonal down-right
      [-1, 1], // diagonal up-right
    ];

    const isValidRectangle = (cells: { row: number; col: number }[]) => {
      const minRow = Math.min(...cells.map((c) => c.row));
      const maxRow = Math.max(...cells.map((c) => c.row));
      const minCol = Math.min(...cells.map((c) => c.col));
      const maxCol = Math.max(...cells.map((c) => c.col));

      // Check if all cells in the rectangle are either part of our combination or empty (0)
      for (let r = minRow; r <= maxRow; r++) {
        for (let c = minCol; c <= maxCol; c++) {
          if (
            grid[r]?.[c] !== 0 &&
            !cells.some((cell) => cell.row === r && cell.col === c)
          ) {
            return false;
          }
        }
      }
      return true;
    };

    for (let row = 0; row < grid.length; row++) {
      for (let col = 0; grid[row]?.length && col < grid[row]!.length; col++) {
        for (const [dx, dy] of directions) {
          let sum = 0;
          let cellCount = 0;
          const combination: string[] = [];
          const cells: { row: number; col: number }[] = [];

          for (let i = 0; i < 4 && cellCount < 4; i++) {
            const newRow = row + i * dx;
            const newCol = col + i * dy;
            if (
              newRow < 0 ||
              newRow >= grid.length ||
              newCol < 0 ||
              newCol >= (grid[0]?.length ?? 0)
            ) {
              break;
            }
            if ((grid[newRow]?.[newCol] ?? -1) === 0) {
              continue;
            }
            sum += grid[newRow]?.[newCol] ?? 0;
            cellCount++;
            cells.push({ row: newRow, col: newCol });
            combination.push(
              `${String.fromCharCode(65 + newCol)}${newRow + 1}`,
            );
            if (sum === 10 && cellCount > 1) {
              if (isValidRectangle(cells)) {
                count++;
                list.push(combination.join("+"));
              }
              break;
            }
          }
        }
      }
    }
    return { count, list };
  };

  const isSelected = useCallback(
    (row: number, col: number) => {
      if (!selectionBox) return false;
      const { startRow, startCol, endRow, endCol } = selectionBox;
      const minRow = Math.min(startRow, endRow);
      const maxRow = Math.max(startRow, endRow);
      const minCol = Math.min(startCol, endCol);
      const maxCol = Math.max(startCol, endCol);
      return row >= minRow && row <= maxRow && col >= minCol && col <= maxCol;
    },
    [selectionBox],
  );

  const renderCell = useCallback(
    (value: number, rowIndex: number, colIndex: number) => (
      <Cell
        key={`${rowIndex}-${colIndex}`}
        value={value}
        isSelected={isSelected(rowIndex, colIndex)}
        onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
        onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
        onTouchStart={() => handleTouchStart(rowIndex, colIndex)}
        onTouchMove={() => handleTouchMove(rowIndex, colIndex)}
        position={[rowIndex, colIndex]}
      />
    ),
    [
      handleMouseDown,
      handleMouseEnter,
      handleTouchStart,
      handleTouchMove,
      isSelected,
    ],
  );

  return useMemo(
    () => (
      <ol
        className="grid touch-none select-none grid-cols-[repeat(17,_minmax(0,_1fr))] overflow-hidden rounded-xl border-2 bg-stone-100 p-2 shadow-xl"
        onContextMenu={(e) => e.preventDefault()} // Prevent context menu on long press
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchEnd={handleMouseUp}
        onTouchCancel={handleMouseUp}
      >
        {grid.map((row, rowIndex) => (
          <React.Fragment key={`row-${rowIndex}`}>
            {row.map((cell, colIndex) => renderCell(cell, rowIndex, colIndex))}
          </React.Fragment>
        ))}
      </ol>
    ),
    [grid, renderCell, handleMouseUp],
  );
});

export default Grid;
