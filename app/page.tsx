import { MinesweeperGame } from "@/components/minesweeper-game"

export default function Home() {
  return (
    <main className="h-dvh bg-background text-foreground flex flex-col items-center justify-center px-4 py-4 font-mono overflow-hidden select-none">
      <MinesweeperGame />
    </main>
  )
}
