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
} from '../utils/dimensions'
import { loadSettings, saveSettings } from '../utils/storage'

function withSyncedStitches(
  prev: CalculatorSettings,
  fabricWidthInches: number,
  fabricHeightInches: number,
): CalculatorSettings {
  // Working area only: fabric size maps directly to design stitches (no margin).
  const stitches = designStitchesFromFabricInches(
    fabricWidthInches,
    fabricHeightInches,
    0,
    prev.fabricCount,
  )
  return {
    ...prev,
    fabricWidthInches,
    fabricHeightInches,
    stitchWidth: stitches.width,
    stitchHeight: stitches.height,
    borderMarginPreset: 'custom',
    customBorderMargin: 0,
  }
}

function withSyncedFabricInches(
  prev: CalculatorSettings,
  stitchWidth: number,
  stitchHeight: number,
): CalculatorSettings {
  return {
    ...prev,
    stitchWidth,
    stitchHeight,
    fabricWidthInches: fabricInchesFromDesign(stitchWidth, 0, prev.fabricCount),
    fabricHeightInches: fabricInchesFromDesign(stitchHeight, 0, prev.fabricCount),
    borderMarginPreset: 'custom',
    customBorderMargin: 0,
  }
}

/** Central state for calculator inputs, results, and persistence. */
export function useCalculator() {
  const [settings, setSettings] = useState<CalculatorSettings>(() => {
    const loaded = loadSettings()
    const normalized: CalculatorSettings = {
      ...loaded,
      borderMarginPreset: 'custom',
      customBorderMargin: 0,
    }
    if (
      typeof normalized.fabricWidthInches === 'number' &&
      typeof normalized.fabricHeightInches === 'number'
    ) {
      return withSyncedStitches(
        normalized,
        normalized.fabricWidthInches,
        normalized.fabricHeightInches,
      )
    }
    return withSyncedFabricInches(
      normalized,
      normalized.stitchWidth,
      normalized.stitchHeight,
    )
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

  const setBorderMarginPreset = useCallback((_value: BorderMarginPreset) => {
    setSettings((prev) =>
      withSyncedStitches(
        { ...prev, borderMarginPreset: 'custom', customBorderMargin: 0 },
        prev.fabricWidthInches,
        prev.fabricHeightInches,
      ),
    )
  }, [])

  const setCustomBorderMargin = useCallback((_value: number) => {
    setSettings((prev) =>
      withSyncedStitches(
        { ...prev, borderMarginPreset: 'custom', customBorderMargin: 0 },
        prev.fabricWidthInches,
        prev.fabricHeightInches,
      ),
    )
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
