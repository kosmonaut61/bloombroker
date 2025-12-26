"use client"

import { useState } from "react"
import { useGameStore } from "@/lib/game/store"
import { ScrollArea } from "@/components/ui/scroll-area"
import { PlantCard } from "./plant-card"
import { PlantDetailModal } from "./plant-detail-modal"
import { RetroWindow } from "./retro-window"
import type { Plant } from "@/lib/game/types"
import { Package, Search } from "lucide-react"

export function InventoryPanel() {
  const { inventory, displaySlots, propagationSlots, moveToDisplay, sendToPropagation } = useGameStore()
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  const filteredInventory = inventory.filter(
    (plant) =>
      plant.genus.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plant.species.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plant.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const emptyDisplaySlot = displaySlots.find((slot) => slot.plant === null)
  const emptyPropSlot = propagationSlots.find((slot) => slot.plant === null)

  return (
    <>
      <RetroWindow
        title="Inventory"
        icon={<Package className="w-4 h-4" />}
        badge={
          <span className="bg-card text-card-foreground px-2 py-0.5 border-2 border-foreground text-sm">
            {inventory.length} plants
          </span>
        }
      >
        <div className="space-y-3">
          {/* Search - retro styled */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              placeholder="Search plants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 retro-inset text-lg"
            />
          </div>

          {/* Plant grid */}
          <ScrollArea className="h-[400px]">
            {filteredInventory.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-lg">
                {inventory.length === 0 ? "No plants yet! Buy some at auction." : "No plants match your search."}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pr-4">
                {filteredInventory.map((plant) => (
                  <PlantCard key={plant.instanceId} plant={plant} onClick={() => setSelectedPlant(plant)} />
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </RetroWindow>

      {/* Plant Detail Modal */}
      <PlantDetailModal
        plant={selectedPlant}
        open={!!selectedPlant}
        onClose={() => setSelectedPlant(null)}
        actions={
          selectedPlant ? (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (emptyDisplaySlot) {
                    moveToDisplay(selectedPlant.instanceId, emptyDisplaySlot.id)
                    setSelectedPlant(null)
                  }
                }}
                disabled={!emptyDisplaySlot}
                className="retro-btn flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add to Display
              </button>
              <button
                onClick={() => {
                  if (emptyPropSlot) {
                    sendToPropagation(selectedPlant.instanceId, emptyPropSlot.id)
                    setSelectedPlant(null)
                  }
                }}
                disabled={!emptyPropSlot}
                className="retro-btn retro-btn-secondary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Propagate
              </button>
            </div>
          ) : null
        }
      />
    </>
  )
}
