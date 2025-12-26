"use client"

import { useGameStore } from "@/lib/game/store"
import { InventoryPanel } from "./inventory-panel"
import { DisplayCasePanel } from "./display-case-panel"
import { PropagationPanel } from "./propagation-panel"
import { AuctionPanel } from "./auction-panel"
import { UpgradesPanel } from "./upgrades-panel"
import { ActivityLog } from "./activity-log"
import { GameHeader } from "./game-header"

export function GameDashboard() {
  const { currentAuction } = useGameStore()

  return (
    <div className="min-h-screen pb-8">
      <GameHeader />

      <main className="container mx-auto px-4 pt-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Column - Inventory */}
          <div className="space-y-4">
            <InventoryPanel />
            <UpgradesPanel />
          </div>

          {/* Center Column - Display Case & Customers */}
          <div className="space-y-4">
            <DisplayCasePanel />
            <ActivityLog />
          </div>

          {/* Right Column - Propagation & Auctions */}
          <div className="space-y-4">
            <PropagationPanel />
            {currentAuction && <AuctionPanel />}
          </div>
        </div>
      </main>
    </div>
  )
}
