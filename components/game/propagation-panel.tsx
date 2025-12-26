"use client"

import { useState } from "react"
import { useGameStore } from "@/lib/game/store"
import { PlantSelectorModal } from "./plant-selector-modal"
import { RetroWindow } from "./retro-window"
import { formatTime } from "@/lib/game/utils"
import { GAME_CONFIG } from "@/lib/game/config"
import { Sprout, Plus, Sparkles } from "lucide-react"

export function PropagationPanel() {
  const { propagationSlots, collectPropagation, upgrades } = useGameStore()

  const [selectorOpen, setSelectorOpen] = useState(false)
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null)

  const mutationChance = GAME_CONFIG.mutationChance * 100 + (upgrades.propagationBench?.currentLevel ?? 0) * 0.5

  const handleSlotClick = (slotId: string) => {
    setSelectedSlotId(slotId)
    setSelectorOpen(true)
  }

  return (
    <>
      <RetroWindow
        title="Propagation Station"
        icon={<Sprout className="w-4 h-4" />}
        badge={
          <span className="bg-card text-card-foreground px-2 py-0.5 border-2 border-foreground text-sm flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            {mutationChance.toFixed(1)}% mutation
          </span>
        }
      >
        <div className="space-y-3">
          {propagationSlots.map((slot) => {
            const now = Date.now()
            const elapsed = slot.startTime ? now - slot.startTime : 0
            const progress = slot.plant ? Math.min(100, (elapsed / slot.duration) * 100) : 0
            const timeRemaining = slot.plant ? Math.max(0, slot.duration - elapsed) : 0

            return (
              <div key={slot.id} className="retro-inset p-3">
                {slot.plant ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0">
                        <p className="font-bold text-lg truncate">
                          {slot.plant.genus} {slot.plant.species}
                        </p>
                        {slot.plant.variant && <p className="text-sm text-primary">{slot.plant.variant}</p>}
                      </div>
                      {slot.isComplete ? (
                        <button
                          onClick={() => collectPropagation(slot.id)}
                          className="retro-btn animate-pulse-glow text-sm py-1 px-3"
                        >
                          Collect!
                        </button>
                      ) : (
                        <span className="text-lg font-bold text-muted-foreground">{formatTime(timeRemaining)}</span>
                      )}
                    </div>
                    {/* Pixel-style progress bar */}
                    <div className="h-4 bg-muted border-2 border-foreground relative overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-200"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    {slot.isComplete && (
                      <p className="text-sm text-primary font-medium text-center">
                        Ready to collect! You'll get the original + a new cutting.
                      </p>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => handleSlotClick(slot.id)}
                    className="w-full flex items-center justify-center py-4 text-muted-foreground hover:text-primary transition-colors cursor-pointer group"
                  >
                    <Plus className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                    <span className="text-lg">Click to add a plant</span>
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </RetroWindow>

      {selectedSlotId && (
        <PlantSelectorModal
          open={selectorOpen}
          onClose={() => {
            setSelectorOpen(false)
            setSelectedSlotId(null)
          }}
          targetType="propagation"
          targetSlotId={selectedSlotId}
        />
      )}
    </>
  )
}
