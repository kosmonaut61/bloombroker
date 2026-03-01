"use client"

import { GameCell } from "@/components/game-cell"
import type { CellState, GameStatus } from "@/hooks/use-minesweeper"

interface GameBoardProps {
  grid: CellState[][]
  status: GameStatus
  cols: number
  rows: number
  cellSize: number
  onReveal: (row: number, col: number) => void
  onFlag: (row: number, col: number) => void
  onChord: (row: number, col: number) => void
}

export function GameBoard({ grid, status, cols, rows, cellSize, onReveal, onFlag, onChord }: GameBoardProps) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
        gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
        width: cellSize * cols,
        height: cellSize * rows,
        touchAction: "none",
        WebkitUserSelect: "none",
        userSelect: "none",
        WebkitTouchCallout: "none",
      }}
    >
      {grid.flat().map((cell) => (
        <GameCell
          key={`${cell.row}-${cell.col}`}
          cell={cell}
          status={status}
          cellSize={cellSize}
          onReveal={onReveal}
          onFlag={onFlag}
          onChord={onChord}
        />
      ))}
    </div>
  )
}
