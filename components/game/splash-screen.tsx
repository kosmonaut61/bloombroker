"use client"

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
import { useGameStore } from "@/lib/game/store"
import { Leaf } from "lucide-react"

export function SplashScreen() {
  const { startGame, resetGame, inventory } = useGameStore()
  const [showResetDialog, setShowResetDialog] = useState(false)
  const hasSave = inventory.length > 0

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Pixel art decorative border */}
      <div className="absolute inset-4 border-4 border-foreground pointer-events-none" />

      <div className="retro-window w-full max-w-lg">
        {/* Title bar */}
        <div className="retro-title-bar">
          <span className="text-primary-foreground font-bold text-xl">Bloombroker.exe</span>
          <div className="retro-window-controls">
            <div className="retro-window-btn">-</div>
            <div className="retro-window-btn">O</div>
            <div className="retro-window-btn">X</div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 text-center">
          {/* Logo */}
          <div className="mb-6 flex justify-center">
            <div className="w-24 h-24 bg-secondary flex items-center justify-center border-4 border-foreground">
              <Leaf className="w-12 h-12 text-primary" />
            </div>
          </div>

          <h1 className="text-5xl font-bold mb-2 tracking-wider">BLOOMBROKER</h1>
          <p className="text-muted-foreground text-xl mb-8">
            Run your own plant shop. Buy, propagate, and sell rare plants!
          </p>

          {/* Buttons */}
          <div className="space-y-3">
            <button onClick={startGame} className="retro-btn w-full text-xl py-3">
              {hasSave ? "> CONTINUE GAME" : "> START GAME"}
            </button>

            {hasSave && (
              <button onClick={() => setShowResetDialog(true)} className="retro-btn retro-btn-secondary w-full">
                RESET SAVE
              </button>
            )}
          </div>

          {/* Footer */}
          <div className="mt-8 pt-4 border-t-2 border-foreground">
            <p className="text-muted-foreground text-lg">Inspired by Cookie Clicker & Papers, Please</p>
            <p className="text-muted-foreground text-sm mt-1">v1.0.0</p>
          </div>
        </div>
      </div>

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
              This will permanently delete all your progress. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="retro-btn retro-btn-secondary">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                resetGame()
                setShowResetDialog(false)
              }}
              className="retro-btn bg-destructive"
            >
              Reset
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
