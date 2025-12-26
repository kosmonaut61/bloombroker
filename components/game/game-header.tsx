"use client"

import { useGameStore } from "@/lib/game/store"
import { formatGP } from "@/lib/game/utils"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Leaf, Settings } from "lucide-react"

export function GameHeader() {
  const { gp, inventory, totalSold, totalEarned, resetGame } = useGameStore()
  const [showResetDialog, setShowResetDialog] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-50 bg-primary border-b-4 border-foreground">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-secondary flex items-center justify-center border-2 border-foreground">
                <Leaf className="w-5 h-5 text-primary" />
              </div>
              <span className="text-2xl font-bold text-primary-foreground tracking-wider">BLOOMBROKER</span>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-2">
              {/* Gold */}
              <div className="retro-inset px-4 py-1 flex items-center gap-2">
                <span className="text-lg font-bold">{formatGP(gp)}</span>
              </div>

              {/* Plants count */}
              <div className="retro-inset px-3 py-1 hidden sm:flex items-center gap-2">
                <span className="text-lg">{inventory.length} Plants</span>
              </div>

              {/* Sold count */}
              <div className="retro-inset px-3 py-1 hidden md:flex items-center gap-2">
                <span className="text-lg">{totalSold} Sold</span>
              </div>

              {/* Settings */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="retro-btn retro-btn-secondary p-2">
                    <Settings className="w-5 h-5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="retro-window border-0 p-0">
                  <div className="retro-title-bar text-sm">
                    <span className="text-primary-foreground">Menu</span>
                  </div>
                  <div className="p-2">
                    <DropdownMenuItem
                      className="text-destructive cursor-pointer text-lg hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => setShowResetDialog(true)}
                    >
                      Reset Save
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent className="retro-window border-0 shadow-none">
          <div className="retro-title-bar -m-6 mb-4">
            <span className="text-primary-foreground font-bold">Warning</span>
            <div className="retro-window-controls">
              <div className="retro-window-btn">X</div>
            </div>
          </div>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl">Reset Save Data?</AlertDialogTitle>
            <AlertDialogDescription className="text-lg">
              This will permanently delete all your progress including {formatGP(totalEarned)} earned. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="retro-btn retro-btn-secondary">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                resetGame()
                window.location.reload()
              }}
              className="retro-btn bg-destructive"
            >
              Reset
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
