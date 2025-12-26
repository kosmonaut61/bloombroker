"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { GameState, Plant, DisplaySlot, PropagationSlot, Customer, ConditionFlag } from "./types"
import { GAME_CONFIG, UPGRADE_DEFINITIONS } from "./config"
import {
  generateId,
  createPlantFromSeed,
  getRandomPlantSeed,
  getRandomCustomer,
  generateAuction,
  plantMatchesCustomer,
  calculateSalePrice,
  propagatePlant,
  getPropagationTime,
} from "./utils"

interface GameStore extends GameState {
  // Actions
  startGame: () => void
  resetGame: () => void
  tick: () => void

  // Plant actions
  moveToDisplay: (plantId: string, slotId: string) => void
  removeFromDisplay: (slotId: string) => void
  sendToPropagation: (plantId: string, slotId: string) => void
  collectPropagation: (slotId: string) => void

  // Auction actions
  buyFromAuction: () => void
  passAuction: () => void
  inspectPlant: (action: string) => { result: string; discovered?: ConditionFlag }

  // Upgrade actions
  purchaseUpgrade: (upgradeId: string) => void

  // Customer state
  currentCustomer: Customer | null
  customerTimeRemaining: number
  setCurrentCustomer: (customer: Customer | null) => void

  // Inspection state
  inspectionActionsRemaining: number
  resetInspectionActions: () => void
}

const createInitialState = (): Omit<GameState, "displaySlots" | "propagationSlots" | "upgrades"> & {
  displaySlots: DisplaySlot[]
  propagationSlots: PropagationSlot[]
  upgrades: typeof UPGRADE_DEFINITIONS
  currentCustomer: Customer | null
  customerTimeRemaining: number
  inspectionActionsRemaining: number
} => ({
  gp: GAME_CONFIG.startingGP,
  inventory: [],
  displaySlots: Array.from({ length: GAME_CONFIG.startingDisplaySlots }, (_, i) => ({
    id: `display-${i}`,
    plant: null,
  })),
  propagationSlots: Array.from({ length: GAME_CONFIG.startingPropagationSlots }, (_, i) => ({
    id: `prop-${i}`,
    plant: null,
    startTime: null,
    duration: GAME_CONFIG.propagationTimeBase,
    isComplete: false,
  })),
  upgrades: Object.fromEntries(
    Object.entries(UPGRADE_DEFINITIONS).map(([key, def]) => [key, { ...def, currentLevel: 0 }]),
  ) as typeof UPGRADE_DEFINITIONS,
  currentAuction: null,
  lastCustomerTime: Date.now(),
  customerInterval: GAME_CONFIG.customerIntervalBase,
  lastAuctionTime: Date.now(),
  auctionInterval:
    GAME_CONFIG.auctionIntervalMin + Math.random() * (GAME_CONFIG.auctionIntervalMax - GAME_CONFIG.auctionIntervalMin),
  activityLog: [],
  gameStarted: false,
  totalEarned: 0,
  totalSold: 0,
  currentCustomer: null,
  customerTimeRemaining: GAME_CONFIG.customerIntervalBase,
  inspectionActionsRemaining: 2,
})

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      ...createInitialState(),

      startGame: () => {
        const state = get()
        if (state.gameStarted) return

        // Give starter plants
        const starterPlants: Plant[] = []
        for (let i = 0; i < 3; i++) {
          const seed = getRandomPlantSeed()
          const plant = createPlantFromSeed(seed, "starter")
          plant.discoveredFlags = [...plant.conditionFlags]
          starterPlants.push(plant)
        }

        set({
          gameStarted: true,
          inventory: starterPlants,
          lastCustomerTime: Date.now(),
          lastAuctionTime: Date.now(),
          activityLog: [
            {
              id: generateId(),
              type: "purchase",
              message: "Welcome to Bloombroker! You received 3 starter plants.",
              timestamp: Date.now(),
            },
          ],
        })
      },

      resetGame: () => {
        set(createInitialState())
      },

      tick: () => {
        const state = get()
        if (!state.gameStarted) return

        const now = Date.now()

        // Update customer timer
        const timeSinceCustomer = now - state.lastCustomerTime
        const customerInterval = state.customerInterval - (state.upgrades.customerTraffic?.currentLevel ?? 0) * 2000

        set({ customerTimeRemaining: Math.max(0, customerInterval - timeSinceCustomer) })

        // Handle customer arrival
        if (timeSinceCustomer >= customerInterval && !state.currentCustomer) {
          const customer = getRandomCustomer()
          set({ currentCustomer: customer })

          // Try to make a sale
          const displayedPlants = state.displaySlots
            .filter((slot) => slot.plant !== null)
            .map((slot) => ({ slot, plant: slot.plant! }))

          const matchingPlant = displayedPlants.find(({ plant }) => plantMatchesCustomer(plant, customer))

          if (matchingPlant) {
            const salePrice = calculateSalePrice(matchingPlant.plant, customer)
            if (salePrice >= customer.budgetMin && salePrice <= customer.budgetMax) {
              // Make sale
              set((s) => ({
                gp: s.gp + salePrice,
                totalEarned: s.totalEarned + salePrice,
                totalSold: s.totalSold + 1,
                displaySlots: s.displaySlots.map((slot) =>
                  slot.id === matchingPlant.slot.id ? { ...slot, plant: null } : slot,
                ),
                activityLog: [
                  {
                    id: generateId(),
                    type: "sale",
                    message: `${customer.name} bought ${matchingPlant.plant.genus} ${matchingPlant.plant.species} for ${salePrice} GP!`,
                    timestamp: now,
                    gpChange: salePrice,
                  },
                  ...s.activityLog.slice(0, 49),
                ],
              }))

              // Clear customer after brief delay
              setTimeout(() => {
                set({ currentCustomer: null, lastCustomerTime: Date.now() })
              }, 2000)
              return
            }
          }

          // Customer leaves without buying
          set((s) => ({
            activityLog: [
              {
                id: generateId(),
                type: "customer_left",
                message: `${customer.name} couldn't find what they wanted.`,
                timestamp: now,
              },
              ...s.activityLog.slice(0, 49),
            ],
          }))

          setTimeout(() => {
            set({ currentCustomer: null, lastCustomerTime: Date.now() })
          }, 2000)
        }

        // Handle auction spawning
        const timeSinceAuction = now - state.lastAuctionTime
        if (timeSinceAuction >= state.auctionInterval && !state.currentAuction) {
          const auction = generateAuction(state)
          set({
            currentAuction: auction,
            inspectionActionsRemaining: 2 + (state.upgrades.inspectionTools?.currentLevel ?? 0),
            auctionInterval:
              GAME_CONFIG.auctionIntervalMin +
              Math.random() * (GAME_CONFIG.auctionIntervalMax - GAME_CONFIG.auctionIntervalMin),
          })
        }

        // Handle auction expiry
        if (state.currentAuction) {
          const auctionElapsed = now - state.currentAuction.startTime
          if (auctionElapsed >= state.currentAuction.duration) {
            set({
              currentAuction: null,
              lastAuctionTime: now,
            })
          }
        }

        // Handle propagation completion
        const updatedPropSlots = state.propagationSlots.map((slot) => {
          if (slot.plant && slot.startTime && !slot.isComplete) {
            const elapsed = now - slot.startTime
            if (elapsed >= slot.duration) {
              return { ...slot, isComplete: true }
            }
          }
          return slot
        })

        if (JSON.stringify(updatedPropSlots) !== JSON.stringify(state.propagationSlots)) {
          set({ propagationSlots: updatedPropSlots })
        }
      },

      moveToDisplay: (plantId, slotId) => {
        const state = get()
        const plant = state.inventory.find((p) => p.instanceId === plantId)
        if (!plant) return

        set((s) => ({
          inventory: s.inventory.filter((p) => p.instanceId !== plantId),
          displaySlots: s.displaySlots.map((slot) => (slot.id === slotId ? { ...slot, plant } : slot)),
        }))
      },

      removeFromDisplay: (slotId) => {
        const state = get()
        const slot = state.displaySlots.find((s) => s.id === slotId)
        if (!slot?.plant) return

        set((s) => ({
          inventory: [...s.inventory, slot.plant!],
          displaySlots: s.displaySlots.map((s) => (s.id === slotId ? { ...s, plant: null } : s)),
        }))
      },

      sendToPropagation: (plantId, slotId) => {
        const state = get()
        let plant = state.inventory.find((p) => p.instanceId === plantId)
        let fromDisplay = false

        if (!plant) {
          const displaySlot = state.displaySlots.find((s) => s.plant?.instanceId === plantId)
          if (displaySlot?.plant) {
            plant = displaySlot.plant
            fromDisplay = true
          }
        }

        if (!plant) return

        const propTime = getPropagationTime(plant, state.upgrades.propagationBench?.currentLevel ?? 0)

        set((s) => ({
          inventory: fromDisplay ? s.inventory : s.inventory.filter((p) => p.instanceId !== plantId),
          displaySlots: fromDisplay
            ? s.displaySlots.map((slot) => (slot.plant?.instanceId === plantId ? { ...slot, plant: null } : slot))
            : s.displaySlots,
          propagationSlots: s.propagationSlots.map((slot) =>
            slot.id === slotId
              ? { ...slot, plant, startTime: Date.now(), duration: propTime, isComplete: false }
              : slot,
          ),
        }))
      },

      collectPropagation: (slotId) => {
        const state = get()
        const slot = state.propagationSlots.find((s) => s.id === slotId)
        if (!slot?.plant || !slot.isComplete) return

        const offspring = propagatePlant(slot.plant)

        set((s) => ({
          inventory: [...s.inventory, slot.plant!, offspring],
          propagationSlots: s.propagationSlots.map((s) =>
            s.id === slotId ? { ...s, plant: null, startTime: null, isComplete: false } : s,
          ),
          activityLog: [
            {
              id: generateId(),
              type: "propagation",
              message: `Propagation complete! Got a new ${offspring.genus} ${offspring.species}${offspring.variant ? ` (${offspring.variant})` : ""}!`,
              timestamp: Date.now(),
            },
            ...s.activityLog.slice(0, 49),
          ],
        }))
      },

      buyFromAuction: () => {
        const state = get()
        if (!state.currentAuction) return
        if (state.gp < state.currentAuction.askingPrice) return

        const plant = state.currentAuction.plant

        set((s) => ({
          gp: s.gp - s.currentAuction!.askingPrice,
          inventory: [...s.inventory, plant],
          currentAuction: null,
          lastAuctionTime: Date.now(),
          activityLog: [
            {
              id: generateId(),
              type: "purchase",
              message: `Bought ${plant.genus} ${plant.species} from ${s.currentAuction!.seller.name} for ${s.currentAuction!.askingPrice} GP`,
              timestamp: Date.now(),
              gpChange: -s.currentAuction!.askingPrice,
            },
            ...s.activityLog.slice(0, 49),
          ],
        }))
      },

      passAuction: () => {
        const state = get()
        if (!state.currentAuction) return

        set((s) => ({
          currentAuction: null,
          lastAuctionTime: Date.now(),
          activityLog: [
            {
              id: generateId(),
              type: "auction_pass",
              message: `Passed on ${s.currentAuction!.plant.genus} ${s.currentAuction!.plant.species}`,
              timestamp: Date.now(),
            },
            ...s.activityLog.slice(0, 49),
          ],
        }))
      },

      inspectPlant: (action) => {
        const state = get()
        if (!state.currentAuction || state.inspectionActionsRemaining <= 0) {
          return { result: "No inspection actions remaining!" }
        }

        const plant = state.currentAuction.plant
        const upgradeBonus = (state.upgrades.inspectionTools?.currentLevel ?? 0) * 0.15
        const baseChance = 0.5 + upgradeBonus

        let result = ""
        let discovered: ConditionFlag | undefined

        switch (action) {
          case "leaves":
            if (
              plant.conditionFlags.includes("diseased") &&
              !plant.discoveredFlags.includes("diseased") &&
              Math.random() < baseChance
            ) {
              discovered = "diseased"
              result = "Spots detected... possible fungal infection."
            } else if (
              plant.conditionFlags.includes("pests") &&
              !plant.discoveredFlags.includes("pests") &&
              Math.random() < baseChance
            ) {
              discovered = "pests"
              result = "Small bite marks... signs of pest damage."
            } else {
              result = "Leaves look healthy and vibrant."
            }
            break
          case "roots":
            if (
              plant.conditionFlags.includes("diseased") &&
              !plant.discoveredFlags.includes("diseased") &&
              Math.random() < baseChance
            ) {
              discovered = "diseased"
              result = "Root rot detected... this plant is sick."
            } else {
              result = "Root system appears strong."
            }
            break
          case "label":
            if (
              plant.conditionFlags.includes("fake") &&
              !plant.discoveredFlags.includes("fake") &&
              Math.random() < baseChance
            ) {
              discovered = "fake"
              result = "Label glue looks fresh... suspicious."
            } else {
              result = "Label appears authentic."
            }
            break
          case "uv":
            if (
              plant.conditionFlags.includes("rareVariant") &&
              !plant.discoveredFlags.includes("rareVariant") &&
              Math.random() < baseChance + 0.2
            ) {
              discovered = "rareVariant"
              result = "Variegation pattern confirmed! This is a rare variant!"
            } else {
              result = "Standard coloration detected."
            }
            break
          default:
            result = "Nothing unusual found."
        }

        if (discovered) {
          set((s) => ({
            inspectionActionsRemaining: s.inspectionActionsRemaining - 1,
            currentAuction: s.currentAuction
              ? {
                  ...s.currentAuction,
                  plant: {
                    ...s.currentAuction.plant,
                    discoveredFlags: [...s.currentAuction.plant.discoveredFlags, discovered!],
                  },
                }
              : null,
          }))
        } else {
          set((s) => ({
            inspectionActionsRemaining: s.inspectionActionsRemaining - 1,
          }))
        }

        return { result, discovered }
      },

      purchaseUpgrade: (upgradeId) => {
        const state = get()
        const upgrade = state.upgrades[upgradeId as keyof typeof state.upgrades]
        if (!upgrade || upgrade.currentLevel >= upgrade.maxLevel) return

        const cost = Math.round(upgrade.baseCost * Math.pow(upgrade.costMultiplier, upgrade.currentLevel))
        if (state.gp < cost) return

        const newLevel = upgrade.currentLevel + 1

        // Handle special upgrade effects
        let newDisplaySlots = state.displaySlots
        let newPropSlots = state.propagationSlots

        if (upgradeId === "displayExpansion") {
          newDisplaySlots = [...state.displaySlots, { id: `display-${state.displaySlots.length}`, plant: null }]
        }

        if (upgradeId === "propagationBench" && (newLevel === 3 || newLevel === 6)) {
          newPropSlots = [
            ...state.propagationSlots,
            {
              id: `prop-${state.propagationSlots.length}`,
              plant: null,
              startTime: null,
              duration: GAME_CONFIG.propagationTimeBase,
              isComplete: false,
            },
          ]
        }

        set((s) => ({
          gp: s.gp - cost,
          upgrades: {
            ...s.upgrades,
            [upgradeId]: { ...upgrade, currentLevel: newLevel },
          },
          displaySlots: newDisplaySlots,
          propagationSlots: newPropSlots,
        }))
      },

      setCurrentCustomer: (customer) => set({ currentCustomer: customer }),

      resetInspectionActions: () =>
        set((s) => ({
          inspectionActionsRemaining: 2 + (s.upgrades.inspectionTools?.currentLevel ?? 0),
        })),
    }),
    {
      name: "bloombroker-save",
      partialize: (state) => ({
        gp: state.gp,
        inventory: state.inventory,
        displaySlots: state.displaySlots,
        propagationSlots: state.propagationSlots,
        upgrades: state.upgrades,
        activityLog: state.activityLog,
        gameStarted: state.gameStarted,
        totalEarned: state.totalEarned,
        totalSold: state.totalSold,
        lastCustomerTime: state.lastCustomerTime,
        lastAuctionTime: state.lastAuctionTime,
        customerInterval: state.customerInterval,
        auctionInterval: state.auctionInterval,
      }),
    },
  ),
)
