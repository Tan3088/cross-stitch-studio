import { useEffect, useState } from 'react'
import { resolveMarginInches, stitchesToInches } from '../../utils/dimensions'
import type { CalculatorSettings } from '../../types'
import { BORDER_MARGIN_PRESETS } from '../../constants/fabricCounts'
import type { BorderMarginPreset } from '../../types'

const MIN_FABRIC_IN = 4
const MAX_FABRIC_IN = 99

interface FabricSizeControlsProps {
  settings: CalculatorSettings
  stitchCount: number
  zoom: number
  fitToView: boolean
  onFabricSizeChange: (widthIn: number, heightIn: number) => void
  onMarginPresetChange: (preset: BorderMarginPreset) => void
  onCustomMarginChange: (margin: number) => void
  onNewDesign: () => void
  onReset: () => void
  onZoomIn: () => void
  onZoomOut: () => void
  onToggleFitToView: () => void
}

function clampFabricInches(value: number): number {
  return Math.min(MAX_FABRIC_IN, Math.max(MIN_FABRIC_IN, Math.round(value * 100) / 100))
}

function parseFabricInput(raw: string): number | null {
  const trimmed = raw.trim()
  if (trimmed === '') return null
  const value = parseFloat(trimmed)
  if (Number.isNaN(value)) return null
  return clampFabricInches(value)
}

/** Fabric size in inches, margins, and zoom controls for the design studio. */
export function FabricSizeControls({
  settings,
  stitchCount,
  zoom,
  fitToView,
  onFabricSizeChange,
  onMarginPresetChange,
  onCustomMarginChange,
  onNewDesign,
  onReset,
  onZoomIn,
  onZoomOut,
  onToggleFitToView,
}: FabricSizeControlsProps) {
  const margin = resolveMarginInches(settings.borderMarginPreset, settings.customBorderMargin)
  const designW = stitchesToInches(settings.stitchWidth, settings.fabricCount)
  const designH = stitchesToInches(settings.stitchHeight, settings.fabricCount)
  const isCustomMargin = settings.borderMarginPreset === 'custom'

  // Local draft strings so single/double-digit values (e.g. 5, 12) type naturally
  const [widthDraft, setWidthDraft] = useState(String(settings.fabricWidthInches))
  const [heightDraft, setHeightDraft] = useState(String(settings.fabricHeightInches))

  useEffect(() => {
    setWidthDraft(String(settings.fabricWidthInches))
  }, [settings.fabricWidthInches])

  useEffect(() => {
    setHeightDraft(String(settings.fabricHeightInches))
  }, [settings.fabricHeightInches])

  const commitWidth = (raw: string) => {
    const value = parseFabricInput(raw)
    if (value === null) {
      setWidthDraft(String(settings.fabricWidthInches))
      return
    }
    setWidthDraft(String(value))
    onFabricSizeChange(value, settings.fabricHeightInches)
  }

  const commitHeight = (raw: string) => {
    const value = parseFabricInput(raw)
    if (value === null) {
      setHeightDraft(String(settings.fabricHeightInches))
      return
    }
    setHeightDraft(String(value))
    onFabricSizeChange(settings.fabricWidthInches, value)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex gap-2">
          <div>
            <label
              htmlFor="fabric-width-in"
              className="mb-1 block text-xs font-medium text-stitch-600 dark:text-stitch-400"
            >
              Fabric width
            </label>
            <div className="relative">
              <input
                id="fabric-width-in"
                type="text"
                inputMode="decimal"
                value={widthDraft}
                onChange={(e) => setWidthDraft(e.target.value)}
                onBlur={(e) => commitWidth(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && commitWidth(widthDraft)}
                placeholder="e.g. 8"
                className="min-h-11 w-20 rounded-xl border border-stitch-200 bg-white px-2 pr-8 text-center text-base dark:border-stitch-700 dark:bg-stitch-800"
              />
              <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-stitch-500">
                in
              </span>
            </div>
          </div>
          <div>
            <label
              htmlFor="fabric-height-in"
              className="mb-1 block text-xs font-medium text-stitch-600 dark:text-stitch-400"
            >
              Fabric height
            </label>
            <div className="relative">
              <input
                id="fabric-height-in"
                type="text"
                inputMode="decimal"
                value={heightDraft}
                onChange={(e) => setHeightDraft(e.target.value)}
                onBlur={(e) => commitHeight(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && commitHeight(heightDraft)}
                placeholder="e.g. 12"
                className="min-h-11 w-20 rounded-xl border border-stitch-200 bg-white px-2 pr-8 text-center text-base dark:border-stitch-700 dark:bg-stitch-800"
              />
              <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-stitch-500">
                in
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onReset}
          className="min-h-11 rounded-xl border border-stitch-200 px-3 text-sm font-medium text-stitch-600 transition-colors hover:border-stitch-400 hover:bg-stitch-50 dark:border-stitch-700 dark:text-stitch-300 dark:hover:bg-stitch-800"
        >
          Reset all
        </button>

        <button
          type="button"
          onClick={onNewDesign}
          className="min-h-11 rounded-xl border border-stitch-200 px-3 text-sm font-medium text-stitch-700 transition-colors hover:bg-stitch-50 dark:border-stitch-700 dark:text-stitch-200 dark:hover:bg-stitch-800"
        >
          New design
        </button>

        <button
          type="button"
          onClick={onToggleFitToView}
          aria-pressed={fitToView}
          className={`min-h-11 rounded-xl border px-3 text-sm font-medium transition-colors ${
            fitToView
              ? 'border-stitch-500 bg-stitch-500 text-white'
              : 'border-stitch-200 text-stitch-700 hover:bg-stitch-50 dark:border-stitch-700 dark:text-stitch-200 dark:hover:bg-stitch-800'
          }`}
        >
          Fit pattern
        </button>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onZoomOut}
            aria-label="Zoom out"
            className="flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-stitch-200 text-lg font-bold dark:border-stitch-700"
          >
            −
          </button>
          <span className="min-w-14 text-center text-sm text-stitch-600 dark:text-stitch-400">
            {fitToView ? 'Fit' : `${Math.round(zoom * 100)}%`}
          </span>
          <button
            type="button"
            onClick={onZoomIn}
            aria-label="Zoom in"
            className="flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-stitch-200 text-lg font-bold dark:border-stitch-700"
          >
            +
          </button>
        </div>
      </div>

      <p className="text-xs text-stitch-500 dark:text-stitch-400">
        Fabric size: {MIN_FABRIC_IN}&Prime; to {MAX_FABRIC_IN}&Prime; (e.g. 5, 8, 12, 24). Press Enter or tap
        away to apply.
      </p>

      <fieldset>
        <legend className="mb-2 text-xs font-medium text-stitch-600 dark:text-stitch-400">
          Border margin (each side)
        </legend>
        <div className="flex flex-wrap gap-2">
          {BORDER_MARGIN_PRESETS.map((m) => (
            <label
              key={m}
              className={`flex min-h-11 min-w-[3.5rem] cursor-pointer items-center justify-center rounded-xl border px-3 text-sm font-semibold ${
                settings.borderMarginPreset === m
                  ? 'border-stitch-500 bg-stitch-500 text-white'
                  : 'border-stitch-200 bg-white text-stitch-700 dark:border-stitch-700 dark:bg-stitch-800 dark:text-stitch-200'
              }`}
            >
              <input
                type="radio"
                name="studio-margin"
                className="sr-only"
                checked={settings.borderMarginPreset === m}
                onChange={() => onMarginPresetChange(m)}
              />
              {m}&Prime;
            </label>
          ))}
          <label
            className={`flex min-h-11 min-w-[3.5rem] cursor-pointer items-center justify-center rounded-xl border px-3 text-sm font-semibold ${
              isCustomMargin
                ? 'border-stitch-500 bg-stitch-500 text-white'
                : 'border-stitch-200 bg-white text-stitch-700 dark:border-stitch-700 dark:bg-stitch-800 dark:text-stitch-200'
            }`}
          >
            <input
              type="radio"
              name="studio-margin"
              className="sr-only"
              checked={isCustomMargin}
              onChange={() => onMarginPresetChange('custom')}
            />
            Custom
          </label>
        </div>
        {isCustomMargin && (
          <div className="relative mt-2 max-w-[6rem]">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              max={10}
              step={0.25}
              value={settings.customBorderMargin}
              onChange={(e) => onCustomMarginChange(parseFloat(e.target.value) || 0)}
              className="min-h-11 w-full rounded-xl border border-stitch-200 bg-white px-2 pr-8 text-center dark:border-stitch-700 dark:bg-stitch-800"
            />
            <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-stitch-500">
              in
            </span>
          </div>
        )}
      </fieldset>

      <div className="rounded-xl bg-stitch-50 px-3 py-2 text-xs text-stitch-600 dark:bg-stitch-800/50 dark:text-stitch-400">
        <p>
          <strong className="text-stitch-800 dark:text-stitch-200">Design area:</strong>{' '}
          {designW.toFixed(2)}&Prime; × {designH.toFixed(2)}&Prime; ({settings.stitchWidth} ×{' '}
          {settings.stitchHeight} stitches at {settings.fabricCount} ct)
        </p>
        <p className="mt-1">
          <strong className="text-stitch-800 dark:text-stitch-200">Margin:</strong> {margin}
          &Prime; per side · <strong className="text-stitch-800 dark:text-stitch-200">Stitched:</strong>{' '}
          {stitchCount.toLocaleString()}
        </p>
      </div>
    </div>
  )
}
