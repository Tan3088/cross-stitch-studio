import type { FabricCount } from '../types'

/** Available fabrics with stitch density per inch. */
export interface FabricOption {
  id: 'mono-canvas' | 'aida'
  name: string
  description: string
  /** Linear stitches per inch (e.g. 4 → 4×4 = 16 crosses per in²) */
  count: FabricCount
  /** Crosses in one square inch (count × count) */
  crossesPerSquareInch: number
  weave: 'mono' | 'aida'
  photoSrc: string
}

/**
 * Fabric 1 — Mono Canvas: 4×4 crosses per 1×1 inch square (16 total)
 * Aida — 9×9 crosses per 1×1 inch square (81 total)
 */
export const FABRIC_OPTIONS: FabricOption[] = [
  {
    id: 'mono-canvas',
    name: 'Fabric 1 · Mono Canvas',
    description: '1×1 inch grid · 4×4 cross stitches',
    count: 4,
    crossesPerSquareInch: 16,
    weave: 'mono',
    photoSrc: '/fabrics/mono-canvas.png',
  },
  {
    id: 'aida',
    name: 'Aida Fabric',
    description: '1×1 inch grid · 9×9 cross stitches',
    count: 9,
    crossesPerSquareInch: 81,
    weave: 'aida',
    photoSrc: '/fabrics/aida.png',
  },
]

export const FABRIC_COUNTS: FabricCount[] = FABRIC_OPTIONS.map((f) => f.count)

export function findFabricByCount(count: number): FabricOption {
  return FABRIC_OPTIONS.find((f) => f.count === count) ?? FABRIC_OPTIONS[1]
}

export function isValidFabricCount(value: unknown): value is FabricCount {
  return value === 4 || value === 9
}

export const MIN_ZOOM = 0.25
export const MAX_ZOOM = 4
export const ZOOM_STEP = 0.05
