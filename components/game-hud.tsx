"use client"

import { RotateCcw, Clock } from "lucide-react"
import type { GameStatus } from "@/hooks/use-minesweeper"
import { cn } from "@/lib/utils"

interface GameHudProps {
  status: GameStatus
  flagCount: number
  flowerCount: number
  score: number
  elapsed: number
  onReset: () => void
}

function FlowerIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="2" />
      <ellipse cx="12" cy="6" rx="2" ry="3" />
      <ellipse cx="12" cy="18" rx="2" ry="3" />
      <ellipse cx="6" cy="12" rx="3" ry="2" />
      <ellipse cx="18" cy="12" rx="3" ry="2" />
      <ellipse cx="7.76" cy="7.76" rx="2" ry="3" transform="rotate(45 7.76 7.76)" />
      <ellipse cx="16.24" cy="16.24" rx="2" ry="3" transform="rotate(45 16.24 16.24)" />
      <ellipse cx="16.24" cy="7.76" rx="2" ry="3" transform="rotate(-45 16.24 7.76)" />
      <ellipse cx="7.76" cy="16.24" rx="2" ry="3" transform="rotate(-45 7.76 16.24)" />
    </svg>
  )
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
}

export function GameHud({ status, flagCount, flowerCount, score, elapsed, onReset }: GameHudProps) {
  const remaining = flowerCount - flagCount

  return (
    <div className="flex flex-col w-full border-b border-foreground shrink-0">

      {/* Row 1: title + reset */}
      <div className="flex items-center justify-between px-3 pt-2 pb-1 gap-2">
        <div className="flex flex-col leading-none min-w-0">
          <span className="text-sm font-bold tracking-tight text-foreground truncate">
            stop, smell flowers
          </span>
          <span className="text-[9px] text-foreground/35 tracking-widest mt-0.5">
            minesweeper
          </span>
        </div>

        <button
          onClick={onReset}
          className={cn(
            "flex items-center gap-1 px-2 py-0.5 border border-foreground text-[10px] font-bold tracking-widest uppercase transition-colors shrink-0",
            "hover:bg-foreground hover:text-background",
            (status === "won" || status === "lost") && "bg-foreground text-background"
          )}
          aria-label="Reset game"
        >
          {status === "won" ? (
            <span>nice.</span>
          ) : status === "lost" ? (
            <span>oops.</span>
          ) : (
            <>
              <RotateCcw className="w-3 h-3" strokeWidth={2} />
              <span>reset</span>
            </>
          )}
        </button>
      </div>

      {/* Row 2: stats */}
      <div className="flex items-center gap-4 px-3 pb-2">
        <div className="flex items-center gap-1 tabular-nums">
          <span className="text-[9px] text-foreground/40 uppercase tracking-widest">pts</span>
          <span className="text-xs font-bold text-foreground">{String(score).padStart(4, "0")}</span>
        </div>
        <div className="flex items-center gap-1 tabular-nums">
          <FlowerIcon className="w-3 h-3 text-foreground/60" />
          <span className="text-xs font-bold text-foreground">{String(remaining).padStart(3, "0")}</span>
        </div>
        <div className="flex items-center gap-1 tabular-nums">
          <Clock className="w-3 h-3 text-foreground/60" strokeWidth={1.5} />
          <span className="text-xs font-bold text-foreground">{formatTime(elapsed)}</span>
        </div>
      </div>

    </div>
  )
}
