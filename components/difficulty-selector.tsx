"use client"

import { DIFFICULTIES } from "@/hooks/use-minesweeper"
import { cn } from "@/lib/utils"

interface DifficultySelectorProps {
  current: string
  onChange: (key: string) => void
}

export function DifficultySelector({ current, onChange }: DifficultySelectorProps) {
  return (
    <div className="flex items-center gap-0 border border-foreground w-full">
      {Object.entries(DIFFICULTIES).map(([key, diff], idx) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={cn(
            "flex-1 py-2 text-xs tracking-widest uppercase font-bold transition-colors",
            idx < Object.keys(DIFFICULTIES).length - 1 && "border-r border-foreground",
            current === key
              ? "bg-foreground text-background"
              : "bg-transparent text-foreground hover:bg-foreground/10"
          )}
        >
          {diff.label}
        </button>
      ))}
    </div>
  )
}
