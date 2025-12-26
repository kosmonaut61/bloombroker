// Core game types for Bloombroker

export interface Plant {
  seedId: string
  instanceId: string
  name: string // Added simple display name
  image: string // Added image path
  family: string
  genus: string
  species: string
  variant?: string
  tags: string[]
  traits: {
    rarity: number // 0-100
    demand: number // 0-100
    careDifficulty: number // 0-100
    propagationSpeed: number // 0-100
    health: number // 0-100
  }
  baseFMV: number
  conditionFlags: ConditionFlag[]
  discoveredFlags: ConditionFlag[]
  acquiredMethod: "auction" | "propagation" | "starter"
  acquiredAt: number
}

export type ConditionFlag = "healthy" | "diseased" | "pests" | "fake" | "rareVariant"

export interface PlantSeed {
  id: string
  name: string // Added simple display name
  image: string // Added image path
  family: string
  genus: string
  species: string
  tags: string[]
  baseTraits: {
    rarity: number
    demand: number
    careDifficulty: number
    propagationSpeed: number
  }
  baseFMV: number
}

export interface Customer {
  id: string
  name: string
  avatar: string
  archetype: "Collector" | "Beginner" | "Interior Designer" | "Botanist" | "Gift Shopper"
  preferredTags: string[]
  avoidTags: string[]
  traitMinimums: Partial<{
    rarity: number
    demand: number
    careDifficulty: number
  }>
  budgetMin: number
  budgetMax: number
  generosity: number // 0.9-1.3 multiplier
}

export interface Seller {
  id: string
  name: string
  persona: "Honest Hobbyist" | "Shady Flipper" | "Estate Sale" | "Greenhouse Pro" | "Plant Rescue" | "Mystery Trader"
  honesty: number // 0-1
  pricingStyle: "below" | "at" | "above"
  specialties: string[]
}

export interface Auction {
  id: string
  plant: Plant
  seller: Seller
  askingPrice: number
  claimedConditions: ConditionFlag[]
  startTime: number
  duration: number // ms
  isActive: boolean
}

export interface PropagationSlot {
  id: string
  plant: Plant | null
  startTime: number | null
  duration: number // ms
  isComplete: boolean
}

export interface DisplaySlot {
  id: string
  plant: Plant | null
}

export interface Upgrade {
  id: string
  name: string
  description: string
  maxLevel: number
  currentLevel: number
  baseCost: number
  costMultiplier: number
  effect: (level: number) => number
}

export interface ActivityLog {
  id: string
  type: "purchase" | "sale" | "propagation" | "auction_pass" | "customer_left"
  message: string
  timestamp: number
  gpChange?: number
}

export interface GameState {
  gp: number
  inventory: Plant[]
  displaySlots: DisplaySlot[]
  propagationSlots: PropagationSlot[]
  upgrades: Record<string, Upgrade>
  currentAuction: Auction | null
  lastCustomerTime: number
  customerInterval: number
  lastAuctionTime: number
  auctionInterval: number
  activityLog: ActivityLog[]
  gameStarted: boolean
  totalEarned: number
  totalSold: number
}

export interface GameConfig {
  customerIntervalBase: number
  auctionIntervalMin: number
  auctionIntervalMax: number
  auctionDuration: number
  propagationTimeBase: number
  mutationChance: number
  startingDisplaySlots: number
  startingPropagationSlots: number
  startingGP: number
  tickInterval: number
}
