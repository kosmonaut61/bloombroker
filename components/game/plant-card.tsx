"use client"

import type { Plant } from "@/lib/game/types"
import { calculateEstimatedFMV } from "@/lib/game/utils"
import { PLANT_SEEDS } from "@/lib/game/seed-data"
import { cn } from "@/lib/utils"
import { Sparkles, Bug, Skull, AlertTriangle } from "lucide-react"
import Image from "next/image"

interface PlantCardProps {
  plant: Plant
  compact?: boolean
  onClick?: () => void
  selected?: boolean
  showActions?: boolean
  accuracyBonus?: number
}

export function PlantCard({ plant, compact = false, onClick, selected = false, accuracyBonus = 0 }: PlantCardProps) {
  const estimatedFMV = calculateEstimatedFMV(plant, accuracyBonus)

  const seedMatch = PLANT_SEEDS.find((s) => s.id === plant.seedId)
  console.log("[v0] Plant image debug:", {
    plantId: plant.id,
    seedId: plant.seedId,
    plantImage: plant.image,
    seedMatch: seedMatch ? { id: seedMatch.id, image: seedMatch.image } : "NOT FOUND",
    availableSeedIds: PLANT_SEEDS.map((s) => s.id),
  })

  const plantImage = plant.image || seedMatch?.image || "/placeholder.svg"

  const getConditionIcon = (flag: string) => {
    switch (flag) {
      case "rareVariant":
        return <Sparkles className="w-3 h-3" />
      case "diseased":
        return <Skull className="w-3 h-3" />
      case "pests":
        return <Bug className="w-3 h-3" />
      case "fake":
        return <AlertTriangle className="w-3 h-3" />
      default:
        return null
    }
  }

  const getConditionColor = (flag: string) => {
    switch (flag) {
      case "rareVariant":
        return "bg-primary text-primary-foreground"
      case "healthy":
        return "bg-secondary text-secondary-foreground"
      case "diseased":
      case "pests":
      case "fake":
        return "bg-destructive text-destructive-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  if (compact) {
    return (
      <div
        onClick={onClick}
        className={cn(
          "p-2 bg-card border-2 border-foreground cursor-pointer transition-all hover:bg-muted flex items-center gap-2",
          selected && "ring-2 ring-primary ring-offset-2",
        )}
      >
        <div className="w-10 h-10 shrink-0 retro-inset flex items-center justify-center overflow-hidden bg-background">
          <Image
            src={plantImage || "/placeholder.svg"}
            alt={plant.name || "Plant"}
            width={40}
            height={40}
            className="w-full h-full object-contain"
          />
        </div>
        <div className="flex items-center justify-between gap-2 flex-1 min-w-0">
          <div className="min-w-0">
            <p className="font-medium text-sm truncate">{plant.name || `${plant.genus} ${plant.species}`}</p>
            {plant.variant && <p className="text-xs text-primary font-medium">{plant.variant}</p>}
          </div>
          <span className="shrink-0 bg-primary text-primary-foreground px-2 py-0.5 border-2 border-foreground text-sm font-bold">
            {estimatedFMV} GP
          </span>
        </div>
      </div>
    )
  }

  return (
    <div
      onClick={onClick}
      className={cn(
        "retro-window cursor-pointer transition-all hover:translate-x-0.5 hover:translate-y-0.5",
        selected && "ring-2 ring-primary ring-offset-2",
      )}
    >
      <div className="p-2">
        <div className="space-y-2">
          <div className="aspect-square retro-inset flex items-center justify-center overflow-hidden bg-background p-2 max-w-[80px] sm:max-w-none mx-auto sm:mx-0">
            <Image
              src={plantImage || "/placeholder.svg"}
              alt={plant.name || "Plant"}
              width={120}
              height={120}
              className="w-full h-full object-contain"
            />
          </div>

          {/* Plant info - Using plant.name as primary display */}
          <div>
            <h4 className="font-bold text-base leading-tight">{plant.name || `${plant.genus} ${plant.species}`}</h4>
            {plant.variant && (
              <p className="text-sm text-primary font-medium flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                {plant.variant}
              </p>
            )}
            <p className="text-sm text-muted-foreground">{plant.family}</p>
          </div>

          {/* Price - retro badge */}
          <div className="w-full text-center bg-primary text-primary-foreground py-1 border-2 border-foreground font-bold text-lg">
            ~{estimatedFMV} GP
          </div>

          {/* Discovered conditions */}
          {plant.discoveredFlags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {plant.discoveredFlags.map((flag) => (
                <span
                  key={flag}
                  className={cn(
                    "text-xs px-1.5 py-0.5 border border-foreground flex items-center gap-0.5",
                    getConditionColor(flag),
                  )}
                >
                  {getConditionIcon(flag)}
                  <span className="capitalize">{flag === "rareVariant" ? "Rare" : flag}</span>
                </span>
              ))}
            </div>
          )}

          {/* Tags */}
          <div className="flex flex-wrap gap-1">
            {plant.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-xs px-1.5 py-0.5 bg-muted border border-foreground/50">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
