"use client"

import type React from "react"
import { useGameStore } from "@/lib/game/store"
import { RetroWindow } from "./retro-window"
import { formatGP } from "@/lib/game/utils"
import { ArrowUp, Store, Users, Sprout, BookOpen, Search, ChevronDown, ChevronRight } from "lucide-react"
import { useState } from "react"

const upgradeIcons: Record<string, React.ElementType> = {
  displayExpansion: Store,
  customerTraffic: Users,
  propagationBench: Sprout,
  appraisalGuide: BookOpen,
  inspectionTools: Search,
}

export function UpgradesPanel() {
  const { upgrades, gp, purchaseUpgrade } = useGameStore()
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const upgradesList = Object.values(upgrades)

  return (
    <RetroWindow title="Upgrades" icon={<ArrowUp className="w-4 h-4" />}>
      <div className="space-y-2">
        {upgradesList.map((upgrade) => {
          const Icon = upgradeIcons[upgrade.id] || ArrowUp
          const cost = Math.round(upgrade.baseCost * Math.pow(upgrade.costMultiplier, upgrade.currentLevel))
          const canAfford = gp >= cost
          const isMaxed = upgrade.currentLevel >= upgrade.maxLevel
          const isExpanded = expandedId === upgrade.id

          return (
            <div key={upgrade.id} className="retro-inset">
              {/* Header - clickable to expand */}
              <button
                onClick={() => setExpandedId(isExpanded ? null : upgrade.id)}
                className="w-full p-2 flex items-center gap-2 text-left hover:bg-muted/50 transition-colors"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 shrink-0" />
                ) : (
                  <ChevronRight className="w-4 h-4 shrink-0" />
                )}
                <div className="w-8 h-8 bg-primary/20 flex items-center justify-center border border-foreground/50">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-lg">{upgrade.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Level {upgrade.currentLevel}/{upgrade.maxLevel}
                  </p>
                </div>
              </button>

              {/* Expanded content */}
              {isExpanded && (
                <div className="px-2 pb-2 pt-1 space-y-2 border-t border-foreground/20 ml-6">
                  <p className="text-sm text-muted-foreground">{upgrade.description}</p>
                  {/* Pixel progress bar */}
                  <div className="h-3 bg-muted border-2 border-foreground relative overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${(upgrade.currentLevel / upgrade.maxLevel) * 100}%` }}
                    />
                  </div>
                  {!isMaxed ? (
                    <button
                      onClick={() => purchaseUpgrade(upgrade.id)}
                      disabled={!canAfford}
                      className="retro-btn w-full text-sm py-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Upgrade ({formatGP(cost)})
                    </button>
                  ) : (
                    <div className="w-full text-center bg-secondary text-secondary-foreground py-1 border-2 border-foreground font-bold">
                      Maxed Out!
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </RetroWindow>
  )
}
