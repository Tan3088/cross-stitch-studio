/** Supported Aida / evenweave fabric counts (stitches per inch). */
export type FabricCount = 11 | 14 | 16 | 18 | 20 | 22 | 25 | 28 | 32

/** Preset border margins in inches, or a custom value. */
export type BorderMarginPreset = 2 | 3 | 4 | 'custom'

export type Theme = 'light' | 'dark'

export interface ColorOption {
  id: string
  name: string
  /** Hex colour used for swatches and preview */
  hex: string
}

export interface CalculatorSettings {
  stitchWidth: number
  stitchHeight: number
  /** Total fabric width in inches (including margins) */
  fabricWidthInches: number
  /** Total fabric height in inches (including margins) */
  fabricHeightInches: number
  fabricCount: FabricCount
  borderMarginPreset: BorderMarginPreset
  /** Custom border margin in inches (used when preset is 'custom') */
  customBorderMargin: number
  fabricColorId: string
  threadColorId: string
}

export interface DimensionResult {
  inches: number
  centimetres: number
}

export interface CalculationResult {
  designWidth: DimensionResult
  designHeight: DimensionResult
  fabricWidth: DimensionResult
  fabricHeight: DimensionResult
  borderMargin: DimensionResult
}

export const DEFAULT_SETTINGS: CalculatorSettings = {
  stitchWidth: 56,
  stitchHeight: 56,
  fabricWidthInches: 10,
  fabricHeightInches: 10,
  fabricCount: 14,
  borderMarginPreset: 3,
  customBorderMargin: 3,
  fabricColorId: 'white',
  threadColorId: 'navy',
}

/** Drawing tools in the design studio */
export type DesignTool = 'stitch' | 'eraser' | 'fill'

/** Cross stitch pattern: flat array of thread colour IDs (null = empty/fabric) */
export interface CrossStitchDesign {
  width: number
  height: number
  /** Row-major pixels: pixels[y * width + x] */
  pixels: (string | null)[]
  updatedAt: number
}

export const MAX_DESIGN_DIMENSION = 200
export const MIN_DESIGN_DIMENSION = 5

export const DEFAULT_DESIGN: CrossStitchDesign = {
  width: 50,
  height: 50,
  pixels: [],
  updatedAt: Date.now(),
}
