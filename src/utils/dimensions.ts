import type { FabricCount } from '../types'
import { resolveBorderMarginInches } from './calculations'
import type { BorderMarginPreset } from '../types'

/** Convert inches to stitch count for a given fabric count. */
export function inchesToStitches(inches: number, fabricCount: number): number {
  return Math.max(1, Math.round(inches * fabricCount))
}

/** Convert stitch count to inches for a given fabric count. */
export function stitchesToInches(stitches: number, fabricCount: number): number {
  return stitches / fabricCount
}

/** Margin in stitches from margin in inches. */
export function marginToStitches(marginInches: number, fabricCount: number): number {
  return Math.max(0, Math.round(marginInches * fabricCount))
}

/** Design area in inches from total fabric size minus margins. */
export function designInchesFromFabric(
  fabricInches: number,
  marginInches: number,
): number {
  return Math.max(0.25, fabricInches - marginInches * 2)
}

/** Total fabric size in inches from design stitches plus margins. */
export function fabricInchesFromDesign(
  designStitches: number,
  marginInches: number,
  fabricCount: number,
): number {
  return stitchesToInches(designStitches, fabricCount) + marginInches * 2
}

/** Compute design stitch dimensions from fabric size in inches. */
export function designStitchesFromFabricInches(
  fabricWidthIn: number,
  fabricHeightIn: number,
  marginInches: number,
  fabricCount: FabricCount,
): { width: number; height: number } {
  const designW = designInchesFromFabric(fabricWidthIn, marginInches)
  const designH = designInchesFromFabric(fabricHeightIn, marginInches)
  return {
    width: inchesToStitches(designW, fabricCount),
    height: inchesToStitches(designH, fabricCount),
  }
}

export function resolveMarginInches(
  preset: BorderMarginPreset,
  customMargin: number,
): number {
  return resolveBorderMarginInches(preset, customMargin)
}
