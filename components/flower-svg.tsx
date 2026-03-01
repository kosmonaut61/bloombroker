"use client"

import { FLOWER_VARIANTS, RARITY_OPACITY } from "@/lib/flowers"

interface FlowerSvgProps {
  variantId: number
  className?: string
  /** Override opacity (e.g. for dim "revealed but not the detonated" state) */
  opacity?: number
}

export function FlowerSvg({ variantId, className, opacity }: FlowerSvgProps) {
  const variant = FLOWER_VARIANTS.find((v) => v.id === variantId) ?? FLOWER_VARIANTS[0]
  const finalOpacity = opacity ?? RARITY_OPACITY[variant.rarity]

  return (
    <svg
      viewBox="0 0 100 100"
      fill="currentColor"
      className={className}
      style={{ opacity: finalOpacity }}
      aria-hidden="true"
    >
      <path d={variant.pathData} />
      {variant.hasCircle && (
        <circle
          cx={variant.hasCircle.cx}
          cy={variant.hasCircle.cy}
          r={variant.hasCircle.r}
        />
      )}
      {variant.extraCircles?.map((c, i) => (
        <circle key={i} cx={c.cx} cy={c.cy} r={c.r} />
      ))}
    </svg>
  )
}

// Generic flower for when no variant is assigned (flag icon, HUD icon, etc.)
export function GenericFlowerSvg({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d={FLOWER_VARIANTS[0].pathData} />
    </svg>
  )
}
