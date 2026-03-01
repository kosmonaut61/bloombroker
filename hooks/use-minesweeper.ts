"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { rollFlowerVariant, FLOWER_VARIANTS, type FlowerVariant } from "@/lib/flowers"

export type CellState = {
  isFlower: boolean
  isRevealed: boolean
  isFlagged: boolean
  isDetonated: boolean
  neighborCount: number
  row: number
  col: number
  flowerVariantId: number | null
}

export type GameStatus = "idle" | "playing" | "won" | "lost"

export type Difficulty = {
  label: string
  rows: number
  cols: number
  flowers: number
}

export const DIFFICULTIES: Record<string, Difficulty> = {
  easy:   { label: "easy",   rows: 9,  cols: 9,  flowers: 10 },
  medium: { label: "medium", rows: 16, cols: 16, flowers: 40 },
  hard:   { label: "hard",   rows: 16, cols: 30, flowers: 99 },
  mobile: { label: "mobile", rows: 16, cols: 10, flowers: 30 },
}

function createEmptyGrid(rows: number, cols: number): CellState[][] {
  return Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => ({
      isFlower: false,
      isRevealed: false,
      isFlagged: false,
      isDetonated: false,
      neighborCount: 0,
      row: r,
      col: c,
      flowerVariantId: null,
    }))
  )
}

function placeFlowers(
  grid: CellState[][],
  rows: number,
  cols: number,
  count: number,
  safeRow: number,
  safeCol: number
): CellState[][] {
  const newGrid = grid.map((row) => row.map((cell) => ({ ...cell })))
  let placed = 0
  while (placed < count) {
    const r = Math.floor(Math.random() * rows)
    const c = Math.floor(Math.random() * cols)
    if (!newGrid[r][c].isFlower && !(Math.abs(r - safeRow) <= 1 && Math.abs(c - safeCol) <= 1)) {
      newGrid[r][c].isFlower = true
      newGrid[r][c].flowerVariantId = rollFlowerVariant().id
      placed++
    }
  }
  // Calculate neighbor counts
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (!newGrid[r][c].isFlower) {
        let n = 0
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = r + dr
            const nc = c + dc
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && newGrid[nr][nc].isFlower) n++
          }
        }
        newGrid[r][c].neighborCount = n
      }
    }
  }
  return newGrid
}

function revealCells(
  grid: CellState[][],
  row: number,
  col: number,
  rows: number,
  cols: number
): CellState[][] {
  const newGrid = grid.map((r) => r.map((cell) => ({ ...cell })))
  const stack: [number, number][] = [[row, col]]
  while (stack.length > 0) {
    const [r, c] = stack.pop()!
    if (r < 0 || r >= rows || c < 0 || c >= cols) continue
    const cell = newGrid[r][c]
    if (cell.isRevealed || cell.isFlagged || cell.isFlower) continue
    cell.isRevealed = true
    if (cell.neighborCount === 0) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue
          stack.push([r + dr, c + dc])
        }
      }
    }
  }
  return newGrid
}

function checkWin(g: CellState[][]): boolean {
  for (const row of g) {
    for (const cell of row) {
      if (!cell.isFlower && !cell.isRevealed) return false
    }
  }
  return true
}

export function useMinesweeper(difficultyKey: string = "easy") {
  const difficulty = DIFFICULTIES[difficultyKey]
  const { rows, cols, flowers } = difficulty

  const [grid, setGrid] = useState<CellState[][]>(() => createEmptyGrid(rows, cols))
  const [status, setStatus] = useState<GameStatus>("idle")
  const [flagCount, setFlagCount] = useState(0)
  const [score, setScore] = useState(0)
  const [elapsed, setElapsed] = useState(0)

  // Use refs to avoid stale closures inside setGrid updaters
  const statusRef = useRef<GameStatus>("idle")
  const gridRef = useRef<CellState[][]>(grid)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startTimeRef = useRef<number | null>(null)

  // Keep gridRef in sync
  const syncGrid = useCallback((newGrid: CellState[][]) => {
    gridRef.current = newGrid
    setGrid(newGrid)
  }, [])

  const syncStatus = useCallback((s: GameStatus) => {
    statusRef.current = s
    setStatus(s)
  }, [])

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const startTimer = useCallback(() => {
    stopTimer()
    const now = Date.now()
    startTimeRef.current = now
    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - now) / 1000))
    }, 1000)
  }, [stopTimer])

  // Cleanup timer on unmount
  useEffect(() => {
    return () => stopTimer()
  }, [stopTimer])

  const reveal = useCallback(
    (row: number, col: number) => {
      const currentStatus = statusRef.current
      let currentGrid = gridRef.current

      if (currentStatus === "lost" || currentStatus === "won") return

      // First click — plant flowers and start
      if (currentStatus === "idle") {
        currentGrid = placeFlowers(currentGrid, rows, cols, flowers, row, col)
        syncStatus("playing")
        startTimer()
      }

      if (statusRef.current !== "playing") return

      const cell = currentGrid[row][col]
      if (cell.isRevealed || cell.isFlagged) return

      if (cell.isFlower) {
        const revealedGrid = currentGrid.map((r) =>
          r.map((c) => ({
            ...c,
            isRevealed: c.isFlower ? true : c.isRevealed,
            isDetonated: c.row === row && c.col === col,
          }))
        )
        syncGrid(revealedGrid)
        syncStatus("lost")
        stopTimer()
        return
      }

      const newGrid = revealCells(currentGrid, row, col, rows, cols)
      syncGrid(newGrid)

      if (checkWin(newGrid)) {
        syncStatus("won")
        stopTimer()
      }
    },
    [rows, cols, flowers, syncGrid, syncStatus, startTimer, stopTimer]
  )

  const flag = useCallback(
    (row: number, col: number, onFlowerFound?: (variant: FlowerVariant) => void) => {
      const currentStatus = statusRef.current
      if (currentStatus !== "playing" && currentStatus !== "idle") return

      const currentGrid = gridRef.current
      const cell = currentGrid[row][col]
      if (cell.isRevealed) return

      // Flagging a non-flower cell = misidentification = stepped on a cactus
      if (!cell.isFlower) {
        const lostGrid = currentGrid.map((r) =>
          r.map((c) => ({
            ...c,
            isRevealed: c.isFlower ? true : c.isRevealed,
            isDetonated: c.row === row && c.col === col,
          }))
        )
        syncGrid(lostGrid)
        syncStatus("lost")
        stopTimer()
        return
      }

      const newGrid = currentGrid.map((r) => r.map((c) => ({ ...c })))
      const wasFlag = newGrid[row][col].isFlagged
      newGrid[row][col].isFlagged = !wasFlag
      setFlagCount((fc) => (wasFlag ? fc - 1 : fc + 1))

      // Award points when flagging a real flower, deduct when unflagging
      if (cell.flowerVariantId !== null) {
        const variant = FLOWER_VARIANTS.find((v) => v.id === cell.flowerVariantId)
        if (variant) {
          setScore((s) => wasFlag ? s - variant.points : s + variant.points)
          // Fire discovery callback only when newly flagging (not unflagging)
          if (!wasFlag && onFlowerFound) onFlowerFound(variant)
        }
      }

      syncGrid(newGrid)
    },
    [syncGrid, syncStatus, stopTimer]
  )

  const chord = useCallback(
    (row: number, col: number) => {
      if (statusRef.current !== "playing") return

      const currentGrid = gridRef.current
      const cell = currentGrid[row][col]
      if (!cell.isRevealed || cell.neighborCount === 0) return

      // Count flags around
      let flagged = 0
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = row + dr
          const nc = col + dc
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && currentGrid[nr][nc].isFlagged) flagged++
        }
      }
      if (flagged !== cell.neighborCount) return

      let newGrid = currentGrid.map((r) => r.map((c) => ({ ...c })))
      let hitFlower = false

      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = row + dr
          const nc = col + dc
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
            const n = newGrid[nr][nc]
            if (!n.isFlagged && !n.isRevealed && n.isFlower) hitFlower = true
          }
        }
      }

      if (hitFlower) {
        // Find the first unflagged flower neighbour to mark as detonated
        let detonatedRow = -1
        let detonatedCol = -1
        outer: for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = row + dr
            const nc = col + dc
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
              const n = newGrid[nr][nc]
              if (!n.isFlagged && n.isFlower) { detonatedRow = nr; detonatedCol = nc; break outer }
            }
          }
        }
        newGrid = newGrid.map((r) =>
          r.map((c) => ({
            ...c,
            isRevealed: c.isFlower ? true : c.isRevealed,
            isDetonated: c.row === detonatedRow && c.col === detonatedCol,
          }))
        )
        syncGrid(newGrid)
        syncStatus("lost")
        stopTimer()
        return
      }

      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = row + dr
          const nc = col + dc
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !newGrid[nr][nc].isFlagged) {
            newGrid = revealCells(newGrid, nr, nc, rows, cols)
          }
        }
      }

      syncGrid(newGrid)

      if (checkWin(newGrid)) {
        syncStatus("won")
        stopTimer()
      }
    },
    [rows, cols, syncGrid, syncStatus, stopTimer]
  )

  const reset = useCallback(() => {
    stopTimer()
    const fresh = createEmptyGrid(rows, cols)
    gridRef.current = fresh
    setGrid(fresh)
    syncStatus("idle")
    setFlagCount(0)
    setScore(0)
    setElapsed(0)
    startTimeRef.current = null
  }, [rows, cols, stopTimer, syncStatus])

  return {
    grid,
    status,
    flagCount,
    flowerCount: flowers,
    score,
    elapsed,
    reveal,
    flag,
    chord,
    reset,
    rows,
    cols,
  }
}
