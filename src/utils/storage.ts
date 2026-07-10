import {
  DEFAULT_SETTINGS,
  type CalculatorSettings,
  type CrossStitchDesign,
  type Theme,
} from '../types'
import { createEmptyPattern } from './pattern'

const SETTINGS_KEY = 'cross-stitch-calculator-settings'
const THEME_KEY = 'cross-stitch-theme'
const DESIGN_KEY = 'cross-stitch-design'

function isValidSettings(value: unknown): value is CalculatorSettings {
  if (!value || typeof value !== 'object') return false
  const v = value as Record<string, unknown>
  return (
    typeof v.stitchWidth === 'number' &&
    typeof v.stitchHeight === 'number' &&
    typeof v.fabricCount === 'number' &&
    (v.borderMarginPreset === 2 ||
      v.borderMarginPreset === 3 ||
      v.borderMarginPreset === 4 ||
      v.borderMarginPreset === 'custom') &&
    typeof v.customBorderMargin === 'number' &&
    typeof v.fabricColorId === 'string' &&
    typeof v.threadColorId === 'string'
  )
}

/** Load persisted calculator settings, falling back to defaults. */
export function loadSettings(): CalculatorSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return { ...DEFAULT_SETTINGS }
    const parsed: unknown = JSON.parse(raw)
    if (isValidSettings(parsed)) {
      return { ...DEFAULT_SETTINGS, ...parsed }
    }
  } catch {
    // Ignore corrupt storage
  }
  return { ...DEFAULT_SETTINGS }
}

/** Persist calculator settings to local storage. */
export function saveSettings(settings: CalculatorSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  } catch {
    // Storage may be unavailable (private browsing quota, etc.)
  }
}

/** Load theme preference. Returns null if not set. */
export function loadTheme(): Theme | null {
  try {
    const stored = localStorage.getItem(THEME_KEY)
    if (stored === 'light' || stored === 'dark') return stored
  } catch {
    // Ignore
  }
  return null
}

/** Persist theme preference. */
export function saveTheme(theme: Theme): void {
  try {
    localStorage.setItem(THEME_KEY, theme)
  } catch {
    // Ignore
  }
}

function isValidDesign(value: unknown): value is CrossStitchDesign {
  if (!value || typeof value !== 'object') return false
  const v = value as Record<string, unknown>
  return (
    typeof v.width === 'number' &&
    typeof v.height === 'number' &&
    Array.isArray(v.pixels) &&
    v.pixels.length === v.width * v.height
  )
}

/** Load persisted design, or create empty pattern from settings dimensions. */
export function loadDesign(fallbackWidth: number, fallbackHeight: number): CrossStitchDesign {
  try {
    const raw = localStorage.getItem(DESIGN_KEY)
    if (!raw) return createEmptyPattern(fallbackWidth, fallbackHeight)
    const parsed: unknown = JSON.parse(raw)
    if (isValidDesign(parsed)) {
      return parsed
    }
  } catch {
    // Ignore corrupt storage
  }
  return createEmptyPattern(fallbackWidth, fallbackHeight)
}

/** Persist design to local storage. */
export function saveDesign(design: CrossStitchDesign): void {
  try {
    localStorage.setItem(DESIGN_KEY, JSON.stringify(design))
  } catch {
    // Ignore
  }
}
