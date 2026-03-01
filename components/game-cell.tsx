"use client"

import type { CellState, GameStatus } from "@/hooks/use-minesweeper"
import { FlowerSvg, GenericFlowerSvg } from "@/components/flower-svg"
import { cn } from "@/lib/utils"

interface GameCellProps {
  cell: CellState
  status: GameStatus
  cellSize: number
  onReveal: (row: number, col: number) => void
  onFlag: (row: number, col: number) => void
  onChord: (row: number, col: number) => void
}

const NUMBER_OPACITY: Record<number, number> = {
  1: 0.35,
  2: 0.55,
  3: 0.75,
  4: 0.85,
  5: 1,
  6: 1,
  7: 1,
  8: 1,
}

// Cactus shown on the detonated cell — the thing the user stepped on
function CactusIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="currentColor"
      className={className}
    >
      <path d="M63.333,59.998v-6.666h10v-6.667h-10v-6.667h10v-6.667h-10c0-2.467-0.716-4.749-1.885-6.731l7.409-7.409l-4.714-4.713
        l-7.408,7.407c-1.052-0.62-2.188-1.1-3.402-1.415V9.999h-6.666V20.47c-1.211,0.314-2.348,0.793-3.398,1.413l-7.409-7.409
        l-4.714,4.715l7.409,7.407c-1.172,1.982-1.888,4.266-1.888,6.735h-10v6.667h10v6.667h-10v6.667h10v6.666H20v6.667h6.667v16.667
        c0,3.682,2.981,6.666,6.666,6.666l33.334,0.004c3.682,0,6.666-2.985,6.666-6.667v-16.67H80v-6.667H63.333z M43.333,33.332
        c0-3.682,2.985-6.667,6.667-6.667s6.667,2.985,6.667,6.667v26.667H43.333V33.332z M66.667,83.335l-33.334-0.003V66.665h33.334
        V83.335z"/>
    </svg>
  )
}

export function GameCell({ cell, status, cellSize, onReveal, onFlag, onChord }: GameCellProps) {
  const fontSize = Math.max(8, Math.floor(cellSize * 0.45))
  const isGameOver = status === "won" || status === "lost"

  const handleClick = () => {
    if (isGameOver) return
    if (cell.isRevealed) {
      onChord(cell.row, cell.col)
    } else {
      onReveal(cell.row, cell.col)
    }
  }

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    if (isGameOver || cell.isRevealed) return
    onFlag(cell.row, cell.col)
  }

  const isMisflagged = status === "lost" && cell.isFlagged && !cell.isFlower

  return (
    <button
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      style={{ width: cellSize, height: cellSize, fontSize }}
      className={cn(
        "relative flex items-center justify-center select-none transition-none font-mono",
        "border border-foreground/10",
        !cell.isRevealed && !cell.isFlagged && "bg-[var(--cell-unrevealed)] hover:bg-secondary cursor-pointer",
        cell.isFlagged && !cell.isRevealed && "bg-[var(--cell-unrevealed)] cursor-pointer",
        cell.isRevealed && !cell.isFlower && "bg-[var(--cell-revealed)] cursor-default",
        cell.isRevealed && cell.isFlower && !cell.isDetonated && "bg-[var(--cell-revealed)] cursor-default",
        cell.isDetonated && "bg-primary cursor-default",
        isMisflagged && "bg-[var(--cell-revealed)]",
      )}
      aria-label={
        cell.isFlagged
          ? "Flagged flower"
          : cell.isRevealed
          ? cell.isFlower
            ? "Flower"
            : `${cell.neighborCount} neighboring flowers`
          : "Hidden cell"
      }
    >
      {/* Flagged — show the flower the player is smelling (variant known) */}
      {cell.isFlagged && !cell.isRevealed && cell.flowerVariantId !== null && (
        <FlowerSvg
          variantId={cell.flowerVariantId}
          className="w-[62%] h-[62%] text-primary"
          opacity={1}
        />
      )}
      {/* Flagged before flowers are placed — generic flower */}
      {cell.isFlagged && !cell.isRevealed && cell.flowerVariantId === null && (
        <GenericFlowerSvg className="w-[62%] h-[62%] text-primary" />
      )}

      {/* Misflagged at game over */}
      {isMisflagged && (
        <span className="text-primary opacity-40 font-bold leading-none">×</span>
      )}

      {/* Detonated cell — the cactus they stepped on */}
      {cell.isDetonated && cell.isRevealed && (
        <CactusIcon className="w-[65%] h-[65%] text-primary-foreground" />
      )}

      {/* Other revealed flowers on loss — dim variant icon */}
      {cell.isRevealed && cell.isFlower && !cell.isDetonated && cell.flowerVariantId !== null && (
        <FlowerSvg
          variantId={cell.flowerVariantId}
          className="w-[60%] h-[60%] text-primary"
          opacity={0.35}
        />
      )}

      {/* Number */}
      {cell.isRevealed && !cell.isFlower && cell.neighborCount > 0 && (
        <span
          className="font-bold leading-none tabular-nums text-foreground"
          style={{ opacity: NUMBER_OPACITY[cell.neighborCount] ?? 1 }}
        >
          {cell.neighborCount}
        </span>
      )}

      {/* Empty revealed — faint dot */}
      {cell.isRevealed && !cell.isFlower && cell.neighborCount === 0 && (
        <span className="w-[10%] h-[10%] rounded-full bg-foreground opacity-10 block" />
      )}

      {/* DEBUG: coordinate label (chess/battleship style — row=letter, col=number) */}
      {!cell.isRevealed && !cell.isFlagged && (
        <span
          className="text-foreground/50 font-mono leading-none"
          style={{ fontSize: Math.max(6, Math.floor(cellSize * 0.28)) }}
        >
          {String.fromCharCode(65 + cell.row)}{cell.col + 1}
        </span>
      )}
    </button>
  )
}
