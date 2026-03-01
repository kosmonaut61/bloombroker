import { MinesweeperGame } from "@/components/minesweeper-game"

export default function Home() {
  return (
    <main className="h-dvh bg-background text-foreground flex flex-col items-center justify-center px-4 py-4 font-mono overflow-hidden select-none">
      <div className="fixed top-4 right-4 z-50 rounded-sm border border-pink-300/50 bg-pink-400/10 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-pink-200 backdrop-blur-sm">
        Dev Branch
      </div>
      <MinesweeperGame />
    </main>
  )
}
