import type { GameConfig } from "./types"

export const GAME_CONFIG: GameConfig = {
  customerIntervalBase: 12000, // 12 seconds
  auctionIntervalMin: 60000, // 60 seconds
  auctionIntervalMax: 120000, // 120 seconds
  auctionDuration: 25000, // 25 seconds
  propagationTimeBase: 45000, // 45 seconds
  mutationChance: 0.03, // 3%
  startingDisplaySlots: 3,
  startingPropagationSlots: 1,
  startingGP: 50,
  tickInterval: 250, // 250ms game tick
}

export const UPGRADE_DEFINITIONS = {
  displayExpansion: {
    id: "displayExpansion",
    name: "Display Expansion",
    description: "+1 display slot per level",
    maxLevel: 5,
    baseCost: 75,
    costMultiplier: 1.8,
    effect: (level: number) => level,
  },
  customerTraffic: {
    id: "customerTraffic",
    name: "Customer Foot Traffic",
    description: "Faster customer arrivals",
    maxLevel: 4,
    baseCost: 100,
    costMultiplier: 2.0,
    effect: (level: number) => level * 2000, // reduces interval by 2s per level
  },
  propagationBench: {
    id: "propagationBench",
    name: "Propagation Bench",
    description: "Faster propagation & extra slots",
    maxLevel: 6,
    baseCost: 120,
    costMultiplier: 1.9,
    effect: (level: number) => level,
  },
  appraisalGuide: {
    id: "appraisalGuide",
    name: "Appraisal Guide",
    description: "More accurate FMV estimates",
    maxLevel: 3,
    baseCost: 80,
    costMultiplier: 2.2,
    effect: (level: number) => level * 0.1, // reduces variance by 10% per level
  },
  inspectionTools: {
    id: "inspectionTools",
    name: "Inspection Tools",
    description: "Better inspection accuracy",
    maxLevel: 4,
    baseCost: 90,
    costMultiplier: 2.0,
    effect: (level: number) => level * 0.15, // +15% detection per level
  },
}
