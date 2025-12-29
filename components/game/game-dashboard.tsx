"use client"

import { useGameStore } from "@/lib/game/store"
import { InventoryPanel } from "./inventory-panel"
import { DisplayCasePanel } from "./display-case-panel"
import { PropagationPanel } from "./propagation-panel"
import { AuctionPanel } from "./auction-panel"
import { ActivityLog } from "./activity-log"
import { GameHeader } from "./game-header"

export function GameDashboard() {
  const { currentAuction } = useGameStore()

  return (
    <div className="min-h-screen pb-8">
      <GameHeader />

      <main className="container mx-auto px-4 pt-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Large Column (66%) - Display Case & Inventory */}
          <div className="lg:col-span-2 space-y-4">
            <DisplayCasePanel />
            <InventoryPanel />
          </div>

          {/* Small Column (33%) - Propagation & Activity */}
          <div className="space-y-4">
            <PropagationPanel />
            <ActivityLog />
            {currentAuction && <AuctionPanel />}
          </div>
        </div>
      </main>
    </div>
  )
}
