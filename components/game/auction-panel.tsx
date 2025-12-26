"use client"

import type React from "react"
import { useState } from "react"
import { useGameStore } from "@/lib/game/store"
import { calculateEstimatedFMV, formatTime } from "@/lib/game/utils"
import { Gavel, Eye, ShieldQuestion, Leaf, Sparkles, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

export function AuctionPanel() {
  const { currentAuction, gp, buyFromAuction, passAuction, inspectPlant, inspectionActionsRemaining } = useGameStore()
  const [inspectionResults, setInspectionResults] = useState<string[]>([])
  const [isInspecting, setIsInspecting] = useState(false)

  if (!currentAuction) return null

  const { plant, seller, askingPrice, claimedConditions, startTime, duration } = currentAuction
  const now = Date.now()
  const elapsed = now - startTime
  const progress = Math.min(100, (elapsed / duration) * 100)
  const timeRemaining = Math.max(0, duration - elapsed)

  const estimatedFMV = calculateEstimatedFMV(plant)
  const canAfford = gp >= askingPrice

  const getSellerColor = (honesty: number) => {
    if (honesty >= 0.8) return "text-secondary"
    if (honesty >= 0.5) return "text-primary"
    return "text-destructive"
  }

  const handleInspect = (action: string) => {
    const { result } = inspectPlant(action)
    setInspectionResults((prev) => [...prev, result])
  }

  return (
    <div className="retro-window animate-in slide-in-from-right-4">
      {/* Title bar with timer */}
      <div className="retro-title-bar bg-primary">
        <div className="flex items-center gap-2">
          <Gavel className="w-4 h-4 text-primary-foreground" />
          <span className="text-primary-foreground font-bold text-lg">AUCTION!</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-destructive text-destructive-foreground px-2 py-0.5 border-2 border-foreground font-bold animate-blink">
            {formatTime(timeRemaining)}
          </span>
          <div className="retro-window-controls">
            <div className="retro-window-btn">-</div>
            <div className="retro-window-btn">O</div>
            <div className="retro-window-btn">X</div>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-3 bg-muted border-b-2 border-foreground">
        <div className="h-full bg-destructive transition-all duration-200" style={{ width: `${100 - progress}%` }} />
      </div>

      <div className="p-4 space-y-4">
        {/* Seller Info */}
        <div className="retro-inset p-2 flex items-center gap-3">
          <div className="w-10 h-10 bg-card border-2 border-foreground flex items-center justify-center">
            <ShieldQuestion className={cn("w-5 h-5", getSellerColor(seller.honesty))} />
          </div>
          <div>
            <p className="font-bold text-lg">{seller.name}</p>
            <p className="text-sm text-muted-foreground">{seller.persona}</p>
          </div>
        </div>

        {/* Plant Preview */}
        <div className="retro-inset p-3">
          <div className="flex gap-3">
            <div className="w-20 h-20 bg-muted border-2 border-foreground flex items-center justify-center shrink-0 overflow-hidden">
              <img
                src={`/.jpg?height=80&width=80&query=${plant.genus} ${plant.species} plant pixel art`}
                alt={`${plant.genus} ${plant.species}`}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <h4 className="font-bold text-xl">
                {plant.genus} {plant.species}
              </h4>
              <p className="text-sm text-muted-foreground mb-2">{plant.family}</p>
              <div className="flex flex-wrap gap-1">
                {claimedConditions.map((flag) => (
                  <span
                    key={flag}
                    className={cn(
                      "text-xs px-1.5 py-0.5 border border-foreground",
                      flag === "healthy" && "bg-secondary text-secondary-foreground",
                      flag === "rareVariant" && "bg-primary text-primary-foreground",
                    )}
                  >
                    {flag === "rareVariant" ? "Rare!" : flag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="grid grid-cols-2 gap-2">
          <div className="retro-inset p-2 text-center">
            <p className="text-sm text-muted-foreground">Est. Value</p>
            <p className="font-bold text-xl">~{estimatedFMV} GP</p>
          </div>
          <div className="bg-primary text-primary-foreground p-2 text-center border-2 border-foreground">
            <p className="text-sm">Asking Price</p>
            <p className="font-bold text-2xl">{askingPrice} GP</p>
          </div>
        </div>

        {/* Inspection Panel */}
        {isInspecting ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-lg">Inspect Plant</h4>
              <span className="bg-card px-2 py-0.5 border-2 border-foreground text-sm">
                {inspectionActionsRemaining} actions left
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleInspect("leaves")}
                disabled={inspectionActionsRemaining <= 0}
                className="retro-btn retro-btn-secondary text-sm py-2 disabled:opacity-50"
              >
                <Leaf className="w-3 h-3 mr-1 inline" />
                Check Leaves
              </button>
              <button
                onClick={() => handleInspect("roots")}
                disabled={inspectionActionsRemaining <= 0}
                className="retro-btn retro-btn-secondary text-sm py-2 disabled:opacity-50"
              >
                <Sprout className="w-3 h-3 mr-1 inline" />
                Check Roots
              </button>
              <button
                onClick={() => handleInspect("label")}
                disabled={inspectionActionsRemaining <= 0}
                className="retro-btn retro-btn-secondary text-sm py-2 disabled:opacity-50"
              >
                <AlertTriangle className="w-3 h-3 mr-1 inline" />
                Verify Label
              </button>
              <button
                onClick={() => handleInspect("uv")}
                disabled={inspectionActionsRemaining <= 0}
                className="retro-btn retro-btn-secondary text-sm py-2 disabled:opacity-50"
              >
                <Sparkles className="w-3 h-3 mr-1 inline" />
                UV Lamp
              </button>
            </div>

            {inspectionResults.length > 0 && (
              <div className="retro-inset p-2 max-h-24 overflow-y-auto">
                {inspectionResults.map((result, i) => (
                  <p key={i} className="text-sm text-muted-foreground">
                    &gt; {result}
                  </p>
                ))}
              </div>
            )}

            <button onClick={() => setIsInspecting(false)} className="retro-btn retro-btn-secondary w-full text-sm">
              Done Inspecting
            </button>
          </div>
        ) : (
          <button
            onClick={() => {
              setIsInspecting(true)
              setInspectionResults([])
            }}
            className="retro-btn retro-btn-secondary w-full"
          >
            <Eye className="w-4 h-4 mr-2 inline" />
            Inspect ({inspectionActionsRemaining} actions)
          </button>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button onClick={passAuction} className="retro-btn retro-btn-secondary flex-1">
            Pass
          </button>
          <button
            onClick={buyFromAuction}
            disabled={!canAfford}
            className="retro-btn flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Buy ({askingPrice} GP)
          </button>
        </div>

        {!canAfford && <p className="text-sm text-destructive text-center font-bold">Not enough GP!</p>}
      </div>
    </div>
  )
}

function Sprout(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M7 20h10" />
      <path d="M10 20c5.5-2.5.8-6.4 3-10" />
      <path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z" />
      <path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z" />
    </svg>
  )
}
