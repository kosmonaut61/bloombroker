"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useMinesweeper, DIFFICULTIES } from "@/hooks/use-minesweeper"
import { GameBoard } from "@/components/game-board"
import { GameHud } from "@/components/game-hud"
import { FlowerFoundModal } from "@/components/flower-found-modal"
import type { FlowerVariant } from "@/lib/flowers"

// Mobile breakpoint — below this width use portrait grid
const MOBILE_BREAKPOINT = 768
// Fixed bar reserve (HUD ~68px + footer ~34px + borders ~3px)
const BAR_RESERVE = 105

// Inner game component — receives difficulty and cellSize as props, fully controlled
function GameInstance({
  difficultyKey,
  cellSize,
}: {
  difficultyKey: string
  cellSize: number
}) {
  const { grid, status, flagCount, flowerCount, score, elapsed, reveal, flag, chord, reset, cols, rows } =
    useMinesweeper(difficultyKey)

  const [foundFlower, setFoundFlower] = useState<FlowerVariant | null>(null)

  const handleFlag = useCallback(
    (row: number, col: number) => {
      flag(row, col, (variant) => setFoundFlower(variant))
    },
    [flag]
  )

  const gridW = cellSize * cols
  const gridH = cellSize * rows

  return (
    <div
      className="relative flex flex-col border border-foreground shrink-0 overflow-hidden"
      style={{ width: gridW + 2, boxSizing: "border-box" }}
    >
      {/* Top bar */}
      <GameHud
        status={status}
        flagCount={flagCount}
        flowerCount={flowerCount}
        score={score}
        elapsed={elapsed}
        onReset={reset}
      />

      {/* Grid — exact pixel dimensions */}
      <div style={{ width: gridW, height: gridH, flexShrink: 0 }}>
        <GameBoard
          grid={grid}
          status={status}
          cols={cols}
          rows={rows}
          cellSize={cellSize}
          onReveal={reveal}
          onFlag={handleFlag}
          onChord={chord}
        />
      </div>

      {/* Hint bar — becomes a restart prompt when game is lost */}
      {status === "lost" ? (
        <button
          onClick={reset}
          className="flex items-center justify-center w-full px-3 py-2 border-t border-foreground text-[10px] text-foreground tracking-wide shrink-0 font-mono font-bold uppercase hover:bg-foreground hover:text-background transition-colors"
        >
          stepped on a cactus — click to restart
        </button>
      ) : (
        <div className="flex items-center justify-between px-3 py-2 border-t border-foreground text-[10px] text-foreground/40 tracking-wide shrink-0 font-mono">
          <span>tap/click — reveal</span>
          <span>long press/right click — flag</span>
        </div>
      )}

      {/* Flower discovery modal */}
      {foundFlower && (
        <FlowerFoundModal
          variant={foundFlower}
          onDismiss={() => setFoundFlower(null)}
        />
      )}
    </div>
  )
}

// Outer wrapper — detects breakpoint, computes cellSize, renders GameInstance with key
export function MinesweeperGame() {
  const measureRef = useRef<HTMLDivElement>(null)
  const [difficultyKey, setDifficultyKey] = useState<string | null>(null)
  const [cellSize, setCellSize] = useState(0)

  useEffect(() => {
    function compute() {
      const el = measureRef.current
      if (!el) return
      const w = el.clientWidth
      const h = el.clientHeight

      const isMobile = w < MOBILE_BREAKPOINT
      const key = isMobile ? "mobile" : "medium"
      const { cols, rows } = DIFFICULTIES[key]

      const byW = Math.floor(w / cols)
      const byH = Math.floor((h - BAR_RESERVE) / rows)
      const size = Math.max(1, Math.min(byW, byH))

      setDifficultyKey(key)
      setCellSize(size)
    }
    compute()
    const ro = new ResizeObserver(compute)
    if (measureRef.current) ro.observe(measureRef.current)
    return () => ro.disconnect()
  }, [])

  return (
    <div ref={measureRef} className="w-full h-full flex items-start justify-center">
      {difficultyKey && cellSize > 0 && (
        <GameInstance key={difficultyKey} difficultyKey={difficultyKey} cellSize={cellSize} />
      )}
    </div>
  )
}
