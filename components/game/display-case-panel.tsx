"use client"

import { useState } from "react"
import { useGameStore } from "@/lib/game/store"
import { PlantCard } from "./plant-card"
import { CustomerCard } from "./customer-card"
import { PlantSelectorModal } from "./plant-selector-modal"
import { RetroWindow } from "./retro-window"
import { Store, Clock, Plus } from "lucide-react"

export function DisplayCasePanel() {
  const { displaySlots, removeFromDisplay, currentCustomer, customerTimeRemaining, customerInterval, upgrades } =
    useGameStore()

  const [selectorOpen, setSelectorOpen] = useState(false)
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null)

  const adjustedInterval = customerInterval - (upgrades.customerTraffic?.currentLevel ?? 0) * 2000
  const timerProgress = ((adjustedInterval - customerTimeRemaining) / adjustedInterval) * 100

  const occupiedSlots = displaySlots.filter((slot) => slot.plant !== null).length

  const handleSlotClick = (slotId: string) => {
    setSelectedSlotId(slotId)
    setSelectorOpen(true)
  }

  return (
    <>
      <RetroWindow
        title="Display Case"
        icon={<Store className="w-4 h-4" />}
        badge={
          <span className="bg-card text-card-foreground px-2 py-0.5 border-2 border-foreground text-sm">
            {occupiedSlots}/{displaySlots.length} slots
          </span>
        }
      >
        <div className="space-y-4">
          {/* Customer Timer - retro styled */}
          <div className="retro-inset p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg font-medium flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                Next Customer
              </span>
              <span className="text-lg font-bold">{Math.ceil(customerTimeRemaining / 1000)}s</span>
            </div>
            {/* Pixel-style progress bar */}
            <div className="h-4 bg-muted border-2 border-foreground relative overflow-hidden">
              <div className="h-full bg-primary transition-all duration-200" style={{ width: `${timerProgress}%` }} />
            </div>
          </div>

          {/* Current Customer */}
          {currentCustomer && (
            <div className="animate-in slide-in-from-top-2 duration-300">
              <CustomerCard customer={currentCustomer} />
            </div>
          )}

          {/* Display Slots */}
          <div className="grid grid-cols-3 gap-2">
            {displaySlots.map((slot) => (
              <div key={slot.id}>
                {slot.plant ? (
                  <div className="relative group">
                    <PlantCard plant={slot.plant} />
                    <button
                      className="absolute -top-1 -right-1 w-6 h-6 bg-destructive text-destructive-foreground border-2 border-foreground opacity-0 group-hover:opacity-100 transition-opacity text-lg font-bold"
                      onClick={() => removeFromDisplay(slot.id)}
                    >
                      X
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleSlotClick(slot.id)}
                    className="aspect-square w-full retro-inset flex items-center justify-center hover:bg-primary/20 transition-all cursor-pointer group"
                  >
                    <Plus className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </RetroWindow>

      {selectedSlotId && (
        <PlantSelectorModal
          open={selectorOpen}
          onClose={() => {
            setSelectorOpen(false)
            setSelectedSlotId(null)
          }}
          targetType="display"
          targetSlotId={selectedSlotId}
        />
      )}
    </>
  )
}
