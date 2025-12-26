"use client"

import type { Customer } from "@/lib/game/types"
import { Coins, Heart, X } from "lucide-react"

interface CustomerCardProps {
  customer: Customer
}

export function CustomerCard({ customer }: CustomerCardProps) {
  return (
    <div className="retro-window">
      <div className="retro-title-bar py-1 px-2">
        <span className="text-primary-foreground font-bold">Customer</span>
        <div className="retro-window-controls">
          <div className="retro-window-btn text-xs">X</div>
        </div>
      </div>
      <div className="p-3">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="w-12 h-12 bg-secondary border-2 border-foreground flex items-center justify-center text-2xl shrink-0">
            {customer.avatar}
          </div>

          <div className="flex-1 min-w-0">
            {/* Name & Archetype */}
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-xl truncate">{customer.name}</h4>
              <span className="text-sm px-1.5 py-0.5 bg-muted border border-foreground shrink-0">
                {customer.archetype}
              </span>
            </div>

            {/* Budget */}
            <div className="flex items-center gap-1 text-lg text-muted-foreground mt-1">
              <Coins className="w-4 h-4" />
              <span>
                Budget: {customer.budgetMin}-{customer.budgetMax} GP
              </span>
            </div>

            {/* Preferences */}
            <div className="flex flex-wrap gap-1 mt-2">
              {customer.preferredTags.map((tag) => (
                <span
                  key={tag}
                  className="text-sm px-1.5 py-0.5 bg-secondary text-secondary-foreground border border-foreground flex items-center gap-0.5"
                >
                  <Heart className="w-3 h-3" />
                  {tag}
                </span>
              ))}
              {customer.avoidTags.map((tag) => (
                <span
                  key={tag}
                  className="text-sm px-1.5 py-0.5 bg-destructive text-destructive-foreground border border-foreground flex items-center gap-0.5"
                >
                  <X className="w-3 h-3" />
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
