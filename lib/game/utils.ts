import type { Plant, PlantSeed, ConditionFlag, Customer, Seller, Auction, GameState } from "./types"
import { PLANT_SEEDS, CUSTOMERS, SELLERS, VARIANTS } from "./seed-data"
import { GAME_CONFIG } from "./config"

// Generate unique IDs
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15)
}

// Calculate estimated FMV
export function calculateEstimatedFMV(plant: Plant, accuracyBonus = 0): number {
  const { rarity, demand, health } = plant.traits
  const baseFMV = plant.baseFMV

  const demandMultiplier = 0.6 + demand / 200
  const rarityMultiplier = 0.75 + rarity / 200
  const healthMultiplier = 0.5 + health / 200

  let estimated = baseFMV * demandMultiplier * rarityMultiplier * healthMultiplier

  // Add some variance (reduced by accuracy bonus)
  const varianceRange = 0.2 * (1 - accuracyBonus)
  const variance = 1 + (Math.random() - 0.5) * varianceRange
  estimated *= variance

  return Math.round(estimated)
}

// Calculate actual value based on hidden conditions
export function calculateActualValue(plant: Plant): number {
  let value = calculateEstimatedFMV(plant, 1) // Perfect accuracy for actual

  if (plant.conditionFlags.includes("fake")) {
    value *= 0.1 + Math.random() * 0.2 // 10-30%
  } else if (plant.conditionFlags.includes("diseased") || plant.conditionFlags.includes("pests")) {
    value *= 0.4 + Math.random() * 0.4 // 40-80%
  }

  if (plant.conditionFlags.includes("rareVariant")) {
    value *= 1.3 + Math.random() * 0.7 // 130-200%
  }

  return Math.round(value)
}

// Create plant instance from seed
export function createPlantFromSeed(seed: PlantSeed, method: "auction" | "propagation" | "starter"): Plant {
  const health = 60 + Math.random() * 40 // 60-100 base health

  // Determine condition flags
  const conditionFlags: ConditionFlag[] = ["healthy"]
  const hiddenFlags: ConditionFlag[] = []

  // Random chance of issues or rare variant
  if (Math.random() < 0.1) {
    hiddenFlags.push("diseased")
    conditionFlags.splice(conditionFlags.indexOf("healthy"), 1)
  } else if (Math.random() < 0.08) {
    hiddenFlags.push("pests")
    conditionFlags.splice(conditionFlags.indexOf("healthy"), 1)
  }

  if (Math.random() < 0.05) {
    hiddenFlags.push("rareVariant")
  }

  if (Math.random() < 0.07) {
    hiddenFlags.push("fake")
  }

  const variant = hiddenFlags.includes("rareVariant")
    ? VARIANTS[Math.floor(Math.random() * VARIANTS.length)]
    : undefined

  return {
    seedId: seed.id,
    instanceId: generateId(),
    name: seed.name,
    image: seed.image,
    family: seed.family,
    genus: seed.genus,
    species: seed.species,
    variant,
    tags: [...seed.tags, ...(variant ? ["rare", "variegated"] : [])],
    traits: {
      ...seed.baseTraits,
      health: Math.round(health),
    },
    baseFMV: seed.baseFMV,
    conditionFlags: [...conditionFlags, ...hiddenFlags],
    discoveredFlags: method === "starter" ? [...conditionFlags, ...hiddenFlags] : conditionFlags,
    acquiredMethod: method,
    acquiredAt: Date.now(),
  }
}

// Get random plant seed
export function getRandomPlantSeed(): PlantSeed {
  return PLANT_SEEDS[Math.floor(Math.random() * PLANT_SEEDS.length)]
}

// Get random customer
export function getRandomCustomer(): Customer {
  return CUSTOMERS[Math.floor(Math.random() * CUSTOMERS.length)]
}

// Get random seller
export function getRandomSeller(): Seller {
  return SELLERS[Math.floor(Math.random() * SELLERS.length)]
}

// Check if plant matches customer preferences
export function plantMatchesCustomer(plant: Plant, customer: Customer): boolean {
  // Check preferred tags (at least one match required)
  const hasPreferredTag = customer.preferredTags.some((tag) => plant.tags.includes(tag))
  if (!hasPreferredTag && customer.preferredTags.length > 0) return false

  // Check avoided tags
  const hasAvoidedTag = customer.avoidTags.some((tag) => plant.tags.includes(tag))
  if (hasAvoidedTag) return false

  // Check trait minimums
  for (const [trait, min] of Object.entries(customer.traitMinimums)) {
    const plantTrait = plant.traits[trait as keyof typeof plant.traits]
    if (plantTrait !== undefined && plantTrait < (min ?? 0)) return false
  }

  return true
}

// Calculate sale price for customer
export function calculateSalePrice(plant: Plant, customer: Customer): number {
  const actualValue = calculateActualValue(plant)
  const price = Math.round(actualValue * customer.generosity)
  return Math.min(price, customer.budgetMax)
}

// Generate auction listing
export function generateAuction(state: GameState): Auction {
  const seller = getRandomSeller()
  const seed = getRandomPlantSeed()
  const plant = createPlantFromSeed(seed, "auction")

  // Seller honesty affects claimed conditions
  const claimedConditions: ConditionFlag[] = []
  for (const flag of plant.conditionFlags) {
    if (flag === "healthy" || Math.random() < seller.honesty) {
      claimedConditions.push(flag)
    }
  }

  // Calculate asking price based on seller style
  let basePrice = calculateEstimatedFMV(plant)
  switch (seller.pricingStyle) {
    case "below":
      basePrice *= 0.7 + Math.random() * 0.2
      break
    case "above":
      basePrice *= 1.1 + Math.random() * 0.3
      break
    default:
      basePrice *= 0.9 + Math.random() * 0.2
  }

  return {
    id: generateId(),
    plant,
    seller,
    askingPrice: Math.round(basePrice),
    claimedConditions,
    startTime: Date.now(),
    duration: GAME_CONFIG.auctionDuration,
    isActive: true,
  }
}

// Get propagation time for a plant
export function getPropagationTime(plant: Plant, upgradeLevel: number): number {
  const baseTime = GAME_CONFIG.propagationTimeBase
  const speedFactor = 1 - plant.traits.propagationSpeed / 200 // 0.5-1.0
  const upgradeReduction = upgradeLevel * 0.1 // 10% faster per level
  return Math.round(baseTime * speedFactor * (1 - upgradeReduction))
}

// Propagate plant (create offspring)
export function propagatePlant(parent: Plant): Plant {
  const seed = PLANT_SEEDS.find((s) => s.id === parent.seedId)
  if (!seed) throw new Error("Plant seed not found")

  const offspring = createPlantFromSeed(seed, "propagation")

  // Small mutation chance for rare variant
  if (Math.random() < GAME_CONFIG.mutationChance && !offspring.conditionFlags.includes("rareVariant")) {
    offspring.conditionFlags.push("rareVariant")
    offspring.variant = VARIANTS[Math.floor(Math.random() * VARIANTS.length)]
    offspring.tags.push("rare", "variegated")
  }

  // Offspring inherits known flags and has perfect health
  offspring.discoveredFlags = [...offspring.conditionFlags]
  offspring.traits.health = 90 + Math.random() * 10

  return offspring
}

// Format time remaining
export function formatTime(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`
  }
  return `${seconds}s`
}

// Format GP
export function formatGP(amount: number): string {
  return `${amount} GP`
}
