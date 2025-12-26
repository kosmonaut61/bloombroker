"use client"

import { useGameStore } from "@/lib/game/store"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Store, Sprout, Package } from "lucide-react"
import type { Plant } from "@/lib/game/types"

interface PlantSelectorModalProps {
  open: boolean
  onClose: () => void
  targetType: "display" | "propagation"
  targetSlotId: string
}

export function PlantSelectorModal({ open, onClose, targetType, targetSlotId }: PlantSelectorModalProps) {
  const { inventory, moveToDisplay, sendToPropagation } = useGameStore()

  const handleSelectPlant = (plant: Plant) => {
    if (targetType === "display") {
      moveToDisplay(plant.instanceId, targetSlotId)
    } else {
      sendToPropagation(plant.instanceId, targetSlotId)
    }
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="p-0 border-0 bg-transparent shadow-none max-w-md">
        <div className="retro-window">
          {/* Title bar */}
          <div className="retro-title-bar">
            <div className="flex items-center gap-2">
              {targetType === "display" ? (
                <>
                  <Store className="w-4 h-4 text-primary-foreground" />
                  <span className="text-primary-foreground font-bold text-lg">Add to Display Case</span>
                </>
              ) : (
                <>
                  <Sprout className="w-4 h-4 text-primary-foreground" />
                  <span className="text-primary-foreground font-bold text-lg">Send to Propagation</span>
                </>
              )}
            </div>
            <div className="retro-window-controls">
              <div className="retro-window-btn" onClick={onClose}>
                X
              </div>
            </div>
          </div>

          <div className="p-4">
            {inventory.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-xl">Your inventory is empty!</p>
                <p className="text-lg mt-1">Buy plants from auctions to get started.</p>
              </div>
            ) : (
              <ScrollArea className="max-h-[400px] pr-3">
                <div className="space-y-2">
                  {inventory.map((plant) => (
                    <button
                      key={plant.instanceId}
                      onClick={() => handleSelectPlant(plant)}
                      className="w-full p-3 retro-inset hover:bg-primary/10 transition-all text-left group"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-xl truncate">
                            {plant.genus} {plant.species}
                          </p>
                          {plant.variant && (
                            <span className="mt-1 text-sm bg-primary/20 text-primary px-1.5 py-0.5 border border-primary/50">
                              {plant.variant}
                            </span>
                          )}
                          <p className="text-sm text-muted-foreground mt-1">
                            Size: {plant.size} | Health: {plant.healthPercent}%
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-lg font-bold text-primary">{plant.basePrice} GP</p>
                          <p className="text-sm text-muted-foreground">base value</p>
                        </div>
                      </div>
                      {plant.discoveredFlags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {plant.discoveredFlags.map((flag) => (
                            <span
                              key={flag}
                              className={`text-xs px-1.5 py-0.5 border border-foreground ${
                                flag === "rareVariant"
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-destructive text-destructive-foreground"
                              }`}
                            >
                              {flag}
                            </span>
                          ))}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </ScrollArea>
            )}

            <div className="flex justify-end pt-4">
              <button onClick={onClose} className="retro-btn retro-btn-secondary">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
