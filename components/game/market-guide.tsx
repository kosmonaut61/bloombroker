"use client"

import { useState } from "react"
import { PLANT_SEEDS } from "@/lib/game/seed-data"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, BookOpen } from "lucide-react"
import Image from "next/image"
import { formatGP } from "@/lib/game/utils"

export function MarketGuide({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredPlants = PLANT_SEEDS.filter(
    (plant) =>
      plant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plant.genus.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plant.species.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plant.family.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plant.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="retro-window border-0 shadow-none p-0 max-w-4xl max-h-[90vh]">
        <div className="retro-title-bar -m-6 mb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary-foreground" />
            <DialogTitle className="text-primary-foreground font-bold text-xl">Market Guide</DialogTitle>
          </div>
          <div className="retro-window-controls">
            <div className="retro-window-btn" onClick={() => onOpenChange(false)}>
              X
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              placeholder="Search plants by name, family, genus, species, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 retro-inset text-lg"
            />
          </div>

          {/* Plant count */}
          <div className="text-sm text-muted-foreground">
            Showing {filteredPlants.length} of {PLANT_SEEDS.length} plants
          </div>

          {/* Plant grid */}
          <ScrollArea className="h-[calc(90vh-200px)]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-4">
              {filteredPlants.map((plant) => (
                <div key={plant.id} className="retro-window">
                  <div className="p-3 space-y-3">
                    {/* Header with image and name */}
                    <div className="flex items-start gap-3">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 retro-inset flex items-center justify-center overflow-hidden bg-background p-2">
                        <Image
                          src={plant.image || "/placeholder.svg"}
                          alt={plant.name}
                          width={80}
                          height={80}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg leading-tight">{plant.name}</h3>
                        <p className="text-sm text-muted-foreground">{plant.family}</p>
                        <p className="text-xs text-muted-foreground italic">
                          {plant.genus} {plant.species}
                        </p>
                      </div>
                    </div>

                    {/* Base FMV */}
                    <div className="bg-primary text-primary-foreground py-1.5 px-3 border-2 border-foreground text-center">
                      <span className="font-bold text-lg">Base FMV: {formatGP(plant.baseFMV)}</span>
                    </div>

                    {/* Traits */}
                    <div className="space-y-2">
                      <h4 className="font-bold text-sm border-b border-foreground pb-1">Traits</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="retro-inset p-2">
                          <div className="text-xs text-muted-foreground mb-1">Rarity</div>
                          <div className="font-bold">{plant.baseTraits.rarity}/100</div>
                          <div className="h-2 bg-muted border border-foreground mt-1">
                            <div
                              className="h-full bg-primary"
                              style={{ width: `${plant.baseTraits.rarity}%` }}
                            />
                          </div>
                        </div>
                        <div className="retro-inset p-2">
                          <div className="text-xs text-muted-foreground mb-1">Demand</div>
                          <div className="font-bold">{plant.baseTraits.demand}/100</div>
                          <div className="h-2 bg-muted border border-foreground mt-1">
                            <div
                              className="h-full bg-primary"
                              style={{ width: `${plant.baseTraits.demand}%` }}
                            />
                          </div>
                        </div>
                        <div className="retro-inset p-2">
                          <div className="text-xs text-muted-foreground mb-1">Care Difficulty</div>
                          <div className="font-bold">{plant.baseTraits.careDifficulty}/100</div>
                          <div className="h-2 bg-muted border border-foreground mt-1">
                            <div
                              className="h-full bg-destructive"
                              style={{ width: `${plant.baseTraits.careDifficulty}%` }}
                            />
                          </div>
                        </div>
                        <div className="retro-inset p-2">
                          <div className="text-xs text-muted-foreground mb-1">Propagation Speed</div>
                          <div className="font-bold">{plant.baseTraits.propagationSpeed}/100</div>
                          <div className="h-2 bg-muted border border-foreground mt-1">
                            <div
                              className="h-full bg-secondary"
                              style={{ width: `${plant.baseTraits.propagationSpeed}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Tags */}
                    <div>
                      <h4 className="font-bold text-sm border-b border-foreground pb-1 mb-2">Tags</h4>
                      <div className="flex flex-wrap gap-1">
                        {plant.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-xs px-2 py-1 bg-muted border border-foreground/50 capitalize"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}

