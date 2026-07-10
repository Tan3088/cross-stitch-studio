import type {
  BorderMarginPreset,
  CalculationResult,
  CalculatorSettings,
  DimensionResult,
} from '../types'
import { inchesToCm } from './conversions'

/** Resolve the active border margin in inches from settings. */
export function resolveBorderMarginInches(
  preset: BorderMarginPreset,
  customMargin: number,
): number {
  if (preset === 'custom') {
    return Math.max(0, customMargin)
  }
  return preset
}

function toDimension(inches: number): DimensionResult {
  return {
    inches,
    centimetres: inchesToCm(inches),
  }
}

/**
 * Calculate finished design size and required fabric dimensions.
 *
 * Design size (inches) = stitch count / fabric count (stitches per inch).
 * Fabric size = design size + border margin on each side (2 × margin).
 */
export function calculateDimensions(
  settings: CalculatorSettings,
): CalculationResult {
  const { stitchWidth, stitchHeight, fabricCount, borderMarginPreset, customBorderMargin } =
    settings

  const safeWidth = Math.max(0, stitchWidth)
  const safeHeight = Math.max(0, stitchHeight)
  const safeCount = Math.max(1, fabricCount)

  const margin = resolveBorderMarginInches(borderMarginPreset, customBorderMargin)

  const designWidthIn = safeWidth / safeCount
  const designHeightIn = safeHeight / safeCount

  const fabricWidthIn = designWidthIn + margin * 2
  const fabricHeightIn = designHeightIn + margin * 2

  return {
    designWidth: toDimension(designWidthIn),
    designHeight: toDimension(designHeightIn),
    fabricWidth: toDimension(fabricWidthIn),
    fabricHeight: toDimension(fabricHeightIn),
    borderMargin: toDimension(margin),
  }
}
