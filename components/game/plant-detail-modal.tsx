"use client"

import type { Plant } from "@/lib/game/types"
import { calculateEstimatedFMV, calculateActualValue } from "@/lib/game/utils"
import { PLANT_SEEDS } from "@/lib/game/seed-data"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Sparkles, Bug, Skull, AlertTriangle, Heart, Zap, Star, TrendingUp } from "lucide-react"
import type { ReactNode } from "react"

interface PlantDetailModalProps {
  plant: Plant | null
  open: boolean
  onClose: () => void
  actions?: ReactNode
  showActualValue?: boolean
}

export function PlantDetailModal({ plant, open, onClose, actions, showActualValue = false }: PlantDetailModalProps) {
  if (!plant) return null

  const estimatedFMV = calculateEstimatedFMV(plant)
  const actualValue = calculateActualValue(plant)

  // Get plant image with fallback
  const seedMatch = PLANT_SEEDS.find((s) => s.id === plant.seedId)
  const plantImage = plant.image || seedMatch?.image || "/placeholder.svg"

  const traits = [
    { name: "Rarity", value: plant.traits.rarity, icon: Star, color: "bg-primary" },
    { name: "Demand", value: plant.traits.demand, icon: TrendingUp, color: "bg-primary" },
    { name: "Care Difficulty", value: plant.traits.careDifficulty, icon: Zap, color: "bg-muted" },
    { name: "Propagation Speed", value: plant.traits.propagationSpeed, icon: Sparkles, color: "bg-primary" },
    { name: "Health", value: plant.traits.health, icon: Heart, color: "bg-secondary" },
  ]

  const getConditionIcon = (flag: string) => {
    switch (flag) {
      case "rareVariant":
        return <Sparkles className="w-4 h-4" />
      case "diseased":
        return <Skull className="w-4 h-4" />
      case "pests":
        return <Bug className="w-4 h-4" />
      case "fake":
        return <AlertTriangle className="w-4 h-4" />
      default:
        return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="p-0 border-0 bg-transparent shadow-none max-w-md">
        <div className="retro-window">
          {/* Title bar */}
          <div className="retro-title-bar">
            <span className="text-primary-foreground font-bold text-lg">
              {plant.genus} {plant.species}
              {plant.variant && <span className="ml-2 text-sm">({plant.variant})</span>}
            </span>
            <div className="retro-window-controls">
              <div className="retro-window-btn" onClick={onClose}>
                X
              </div>
            </div>
          </div>

          <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
            {/* Plant image */}
            <div className="aspect-video retro-inset flex items-center justify-center overflow-hidden bg-background p-2">
              <img
                src={plantImage}
                alt={`${plant.genus} ${plant.species}`}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Taxonomy */}
            <div className="retro-inset p-3">
              <p className="text-lg">
                <span className="text-muted-foreground">Family:</span> <span className="font-bold">{plant.family}</span>
              </p>
              <p className="text-lg">
                <span className="text-muted-foreground">Genus:</span> <span className="font-bold">{plant.genus}</span>
              </p>
              <p className="text-lg">
                <span className="text-muted-foreground">Species:</span>{" "}
                <span className="font-bold">{plant.species}</span>
              </p>
            </div>

            {/* Value */}
            <div className="flex items-center justify-between bg-primary text-primary-foreground p-3 border-2 border-foreground">
              <span className="font-bold text-lg">Estimated Value</span>
              <span className="font-bold text-2xl">~{estimatedFMV} GP</span>
            </div>

            {showActualValue && (
              <div className="flex items-center justify-between bg-secondary text-secondary-foreground p-3 border-2 border-foreground">
                <span className="font-bold text-lg">Actual Value</span>
                <span className="font-bold text-2xl">{actualValue} GP</span>
              </div>
            )}

            {/* Traits */}
            <div className="space-y-2">
              <h4 className="font-bold text-lg">Traits</h4>
              {traits.map((trait) => (
                <div key={trait.name} className="space-y-1">
                  <div className="flex items-center justify-between text-lg">
                    <span className="flex items-center gap-1.5">
                      <trait.icon className="w-4 h-4 text-muted-foreground" />
                      {trait.name}
                    </span>
                    <span className="font-bold">{trait.value}/100</span>
                  </div>
                  {/* Pixel progress bar */}
                  <div className="h-3 bg-muted border-2 border-foreground relative overflow-hidden">
                    <div className={`h-full ${trait.color} transition-all`} style={{ width: `${trait.value}%` }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Conditions */}
            <div className="space-y-2">
              <h4 className="font-bold text-lg">Discovered Conditions</h4>
              <div className="flex flex-wrap gap-2">
                {plant.discoveredFlags.map((flag) => (
                  <span
                    key={flag}
                    className={`
                      px-2 py-1 border-2 border-foreground flex items-center gap-1 text-lg
                      ${flag === "rareVariant" ? "bg-primary text-primary-foreground" : ""}
                      ${flag === "healthy" ? "bg-secondary text-secondary-foreground" : ""}
                      ${["diseased", "pests", "fake"].includes(flag) ? "bg-destructive text-destructive-foreground" : ""}
                    `}
                  >
                    {getConditionIcon(flag)}
                    <span className="capitalize">{flag === "rareVariant" ? "Rare Variant" : flag}</span>
                  </span>
                ))}
                {plant.conditionFlags.length > plant.discoveredFlags.length && (
                  <span className="px-2 py-1 border-2 border-dashed border-foreground text-muted-foreground text-lg">
                    ? Unknown conditions
                  </span>
                )}
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <h4 className="font-bold text-lg">Tags</h4>
              <div className="flex flex-wrap gap-1.5">
                {plant.tags.map((tag) => (
                  <span key={tag} className="text-sm px-2 py-0.5 bg-muted border border-foreground">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Actions */}
            {actions && <div className="pt-2">{actions}</div>}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
