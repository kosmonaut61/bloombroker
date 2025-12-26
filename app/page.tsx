"use client"

import { useEffect, useState } from "react"
import { useGameStore } from "@/lib/game/store"
import { SplashScreen } from "@/components/game/splash-screen"
import { GameDashboard } from "@/components/game/game-dashboard"

export default function Home() {
  const { gameStarted, tick } = useGameStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Game tick loop
  useEffect(() => {
    if (!gameStarted) return

    const interval = setInterval(() => {
      tick()
    }, 250)

    return () => clearInterval(interval)
  }, [gameStarted, tick])

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-2xl font-bold">Loading...</div>
      </div>
    )
  }

  if (!gameStarted) {
    return <SplashScreen />
  }

  return <GameDashboard />
}
