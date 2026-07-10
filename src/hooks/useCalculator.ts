import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  DEFAULT_SETTINGS,
  type BorderMarginPreset,
  type CalculatorSettings,
  type FabricCount,
} from '../types'
import { calculateDimensions } from '../utils/calculations'
import {
  designStitchesFromFabricInches,
  fabricInchesFromDesign,
  resolveMarginInches,
} from '../utils/dimensions'
import { loadSettings, saveSettings } from '../utils/storage'

function withSyncedStitches(
  prev: CalculatorSettings,
  fabricWidthInches: number,
  fabricHeightInches: number,
): CalculatorSettings {
  const margin = resolveMarginInches(prev.borderMarginPreset, prev.customBorderMargin)
  const stitches = designStitchesFromFabricInches(
    fabricWidthInches,
    fabricHeightInches,
    margin,
    prev.fabricCount,
  )
  return {
    ...prev,
    fabricWidthInches,
    fabricHeightInches,
    stitchWidth: stitches.width,
    stitchHeight: stitches.height,
  }
}

function withSyncedFabricInches(
  prev: CalculatorSettings,
  stitchWidth: number,
  stitchHeight: number,
): CalculatorSettings {
  const margin = resolveMarginInches(prev.borderMarginPreset, prev.customBorderMargin)
  return {
    ...prev,
    stitchWidth,
    stitchHeight,
    fabricWidthInches: fabricInchesFromDesign(stitchWidth, margin, prev.fabricCount),
    fabricHeightInches: fabricInchesFromDesign(stitchHeight, margin, prev.fabricCount),
  }
}

/** Central state for calculator inputs, results, and persistence. */
export function useCalculator() {
  const [settings, setSettings] = useState<CalculatorSettings>(() => {
    const loaded = loadSettings()
    if (
      typeof loaded.fabricWidthInches === 'number' &&
      typeof loaded.fabricHeightInches === 'number'
    ) {
      return loaded
    }
    const margin = resolveMarginInches(loaded.borderMarginPreset, loaded.customBorderMargin)
    return {
      ...loaded,
      fabricWidthInches: fabricInchesFromDesign(loaded.stitchWidth, margin, loaded.fabricCount),
      fabricHeightInches: fabricInchesFromDesign(loaded.stitchHeight, margin, loaded.fabricCount),
    }
  })

  useEffect(() => {
    saveSettings(settings)
  }, [settings])

  const results = useMemo(() => calculateDimensions(settings), [settings])

  const setFabricWidthInches = useCallback((value: number) => {
    setSettings((prev) => withSyncedStitches(prev, Math.max(4, value), prev.fabricHeightInches))
  }, [])

  const setFabricHeightInches = useCallback((value: number) => {
    setSettings((prev) => withSyncedStitches(prev, prev.fabricWidthInches, Math.max(4, value)))
  }, [])

  const setFabricSizeInches = useCallback((width: number, height: number) => {
    setSettings((prev) => withSyncedStitches(prev, Math.max(4, width), Math.max(4, height)))
  }, [])

  const setStitchWidth = useCallback((value: number) => {
    setSettings((prev) => withSyncedFabricInches(prev, value, prev.stitchHeight))
  }, [])

  const setStitchHeight = useCallback((value: number) => {
    setSettings((prev) => withSyncedFabricInches(prev, prev.stitchWidth, value))
  }, [])

  const setStitchDimensions = useCallback((width: number, height: number) => {
    setSettings((prev) => withSyncedFabricInches(prev, width, height))
  }, [])

  const setFabricCount = useCallback((value: FabricCount) => {
    setSettings((prev) => {
      const next = { ...prev, fabricCount: value }
      return withSyncedStitches(next, next.fabricWidthInches, next.fabricHeightInches)
    })
  }, [])

  const setBorderMarginPreset = useCallback((value: BorderMarginPreset) => {
    setSettings((prev) => {
      const next = { ...prev, borderMarginPreset: value }
      return withSyncedStitches(next, next.fabricWidthInches, next.fabricHeightInches)
    })
  }, [])

  const setCustomBorderMargin = useCallback((value: number) => {
    setSettings((prev) => {
      const next = { ...prev, customBorderMargin: value }
      return withSyncedStitches(next, next.fabricWidthInches, next.fabricHeightInches)
    })
  }, [])

  const setFabricColorId = useCallback((value: string) => {
    setSettings((prev) => ({ ...prev, fabricColorId: value }))
  }, [])

  const setThreadColorId = useCallback((value: string) => {
    setSettings((prev) => ({ ...prev, threadColorId: value }))
  }, [])

  const reset = useCallback(() => {
    setSettings({ ...DEFAULT_SETTINGS })
  }, [])

  return {
    settings,
    results,
    setFabricWidthInches,
    setFabricHeightInches,
    setFabricSizeInches,
    setStitchWidth,
    setStitchHeight,
    setStitchDimensions,
    setFabricCount,
    setBorderMarginPreset,
    setCustomBorderMargin,
    setFabricColorId,
    setThreadColorId,
    reset,
  }
}
