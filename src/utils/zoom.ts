import { MAX_ZOOM, MIN_ZOOM } from '../constants/fabricCounts'

/** Clamp zoom multiplier used across studio controls. */
export function clampZoom(value: number): number {
  if (Number.isNaN(value)) return 1
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value))
}

/** Parse a zoom percent string like "125" or "125%" into a multiplier. */
export function parseZoomPercent(raw: string): number | null {
  const trimmed = raw.trim().replace(/%/g, '')
  if (trimmed === '') return null
  const percent = parseFloat(trimmed)
  if (Number.isNaN(percent)) return null
  return clampZoom(percent / 100)
}
