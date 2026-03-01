"use client"

import { useEffect, useRef, useState } from "react"
import { FlowerSvg } from "@/components/flower-svg"
import type { FlowerVariant } from "@/lib/flowers"
import { cn } from "@/lib/utils"

interface FlowerFoundModalProps {
  variant: FlowerVariant
  onDismiss: () => void
}

const RARITY_LABEL: Record<string, string> = {
  common:    "common",
  uncommon:  "uncommon",
  rare:      "rare",
  legendary: "legendary",
}

// Simple seeded-random confetti — pure CSS + inline styles, no library needed
const CONFETTI_COUNT = 38
const COLORS = ["#1B00D2", "#1B00D2", "#1B00D2", "#6b5fcf", "#E0DEE0"]

type ConfettiPiece = {
  x: number
  y: number
  r: number
  color: string
  rot: number
  dx: number
  dy: number
  drot: number
  shape: "rect" | "circle"
}

function Confetti({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const piecesRef = useRef<ConfettiPiece[]>([])
  const rafRef = useRef<number>(0)

  useEffect(() => {
    if (!active) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const W = canvas.offsetWidth
    const H = canvas.offsetHeight
    canvas.width = W
    canvas.height = H

    piecesRef.current = Array.from({ length: CONFETTI_COUNT }, () => ({
      x: W * 0.3 + Math.random() * W * 0.4,
      y: H * 0.35,
      r: 4 + Math.random() * 5,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rot: Math.random() * Math.PI * 2,
      dx: (Math.random() - 0.5) * 6,
      dy: -(4 + Math.random() * 6),
      drot: (Math.random() - 0.5) * 0.2,
      shape: Math.random() > 0.5 ? "rect" : "circle",
    }))

    function draw() {
      if (!ctx || !canvas) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (const p of piecesRef.current) {
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rot)
        ctx.fillStyle = p.color
        ctx.globalAlpha = 0.85
        if (p.shape === "rect") {
          ctx.fillRect(-p.r, -p.r * 0.5, p.r * 2, p.r)
        } else {
          ctx.beginPath()
          ctx.arc(0, 0, p.r * 0.6, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.restore()

        p.x += p.dx
        p.y += p.dy
        p.dy += 0.3 // gravity
        p.rot += p.drot
        p.dx *= 0.99
      }
      rafRef.current = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(rafRef.current)
  }, [active])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  )
}

export function FlowerFoundModal({ variant, onDismiss }: FlowerFoundModalProps) {
  const [visible, setVisible] = useState(false)
  // Keep onDismiss in a ref so timers are never reset by parent re-renders
  const onDismissRef = useRef(onDismiss)
  useEffect(() => { onDismissRef.current = onDismiss }, [onDismiss])

  const dismiss = useRef(() => {
    setVisible(false)
    setTimeout(() => onDismissRef.current(), 300)
  }).current

  // Fade in on mount, auto-dismiss after 2.6s — runs exactly once
  useEffect(() => {
    const showTimer = setTimeout(() => setVisible(true), 10)
    const dismissTimer = setTimeout(dismiss, 2600)
    return () => {
      clearTimeout(showTimer)
      clearTimeout(dismissTimer)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div
      className={cn(
        "absolute inset-0 flex items-center justify-center z-50 transition-opacity duration-300",
        visible ? "opacity-100" : "opacity-0"
      )}
      onClick={dismiss}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/60" />

      {/* Confetti canvas */}
      <Confetti active={visible} />

      {/* Card */}
      <div
        className="relative z-10 flex flex-col items-center gap-3 border border-foreground bg-background px-8 py-6"
        style={{ minWidth: 200 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Flower icon */}
        <div className="w-16 h-16 flex items-center justify-center">
          <FlowerSvg
            variantId={variant.id}
            className="w-full h-full text-foreground"
            opacity={1}
          />
        </div>

        {/* Name */}
        <span className="text-base font-bold tracking-tight text-foreground leading-none">
          {variant.name}
        </span>

        {/* Rarity pill */}
        <span
          className={cn(
            "text-[9px] font-bold tracking-[0.2em] uppercase px-2 py-0.5 border border-foreground",
            variant.rarity === "legendary" && "bg-foreground text-background",
            variant.rarity === "rare"      && "text-foreground",
            variant.rarity === "uncommon"  && "text-foreground opacity-80",
            variant.rarity === "common"    && "text-foreground opacity-50",
          )}
        >
          {RARITY_LABEL[variant.rarity]}
        </span>

        {/* Points */}
        <div className="flex items-baseline gap-1.5 mt-1">
          <span className="text-2xl font-bold tabular-nums text-foreground leading-none">
            +{variant.points}
          </span>
          <span className="text-[10px] text-foreground/40 uppercase tracking-widest">pts</span>
        </div>
      </div>
    </div>
  )
}
