"use client"

import { useGameStore } from "@/lib/game/store"
import { ScrollArea } from "@/components/ui/scroll-area"
import { RetroWindow } from "./retro-window"
import { cn } from "@/lib/utils"
import { Activity, ShoppingBag, Gavel, Sprout, UserX } from "lucide-react"

const typeIcons = {
  purchase: Gavel,
  sale: ShoppingBag,
  propagation: Sprout,
  auction_pass: Gavel,
  customer_left: UserX,
}

const typeColors = {
  purchase: "text-primary",
  sale: "text-secondary",
  propagation: "text-primary",
  auction_pass: "text-muted-foreground",
  customer_left: "text-destructive",
}

export function ActivityLog() {
  const { activityLog } = useGameStore()

  return (
    <RetroWindow title="Activity" icon={<Activity className="w-4 h-4" />}>
      <ScrollArea className="h-[200px]">
        {activityLog.length === 0 ? (
          <p className="text-lg text-muted-foreground text-center py-4">&gt; No activity yet...</p>
        ) : (
          <div className="space-y-2 pr-4">
            {activityLog.map((log) => {
              const Icon = typeIcons[log.type]
              const colorClass = typeColors[log.type]

              return (
                <div
                  key={log.id}
                  className="flex items-start gap-2 text-lg animate-in fade-in slide-in-from-top-2 duration-300"
                >
                  <Icon className={cn("w-4 h-4 mt-1 shrink-0", colorClass)} />
                  <div className="min-w-0">
                    <p className="text-foreground">{log.message}</p>
                    {log.gpChange && (
                      <span
                        className={cn("text-base font-bold", log.gpChange > 0 ? "text-secondary" : "text-destructive")}
                      >
                        {log.gpChange > 0 ? "+" : ""}
                        {log.gpChange} GP
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </ScrollArea>
    </RetroWindow>
  )
}
