import { useEffect, useState } from 'react'
import { stitchesToInches } from '../../utils/dimensions'
import type { CalculatorSettings } from '../../types'
import { MAX_ZOOM, MIN_ZOOM } from '../../constants/fabricCounts'
import { parseZoomPercent } from '../../utils/zoom'

const MIN_FABRIC_IN = 4
const MAX_FABRIC_IN = 99

interface FabricSizeControlsProps {
  settings: CalculatorSettings
  stitchCount: number
  zoom: number
  fitToView: boolean
  onFabricSizeChange: (widthIn: number, heightIn: number) => void
  onNewDesign: () => void
  onReset: () => void
  onZoomIn: () => void
  onZoomOut: () => void
  onToggleFitToView: () => void
  onZoomChange: (zoom: number) => void
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

/** Fabric size in inches and zoom controls (working area only, no margins). */
export function FabricSizeControls({
  settings,
  stitchCount,
  zoom,
  fitToView,
  onFabricSizeChange,
  onNewDesign,
  onReset,
  onZoomIn,
  onZoomOut,
  onToggleFitToView,
  onZoomChange,
}: FabricSizeControlsProps) {
  const designW = stitchesToInches(settings.stitchWidth, settings.fabricCount)
  const designH = stitchesToInches(settings.stitchHeight, settings.fabricCount)

  const [widthDraft, setWidthDraft] = useState(String(settings.fabricWidthInches))
  const [heightDraft, setHeightDraft] = useState(String(settings.fabricHeightInches))
  const [zoomDraft, setZoomDraft] = useState(String(Math.round(zoom * 100)))

  useEffect(() => {
    setWidthDraft(String(settings.fabricWidthInches))
  }, [settings.fabricWidthInches])

  useEffect(() => {
    setHeightDraft(String(settings.fabricHeightInches))
  }, [settings.fabricHeightInches])

  useEffect(() => {
    setZoomDraft(String(Math.round(zoom * 100)))
  }, [zoom])

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

  const commitZoom = (raw: string) => {
    const value = parseZoomPercent(raw)
    if (value === null) {
      setZoomDraft(String(Math.round(zoom * 100)))
      return
    }
    setZoomDraft(String(Math.round(value * 100)))
    onZoomChange(value)
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
              Width
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
              Height
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
          className={`min-h-11 touch-manipulation rounded-xl border px-3 text-sm font-medium transition-colors active:scale-95 ${
            fitToView
              ? 'border-stitch-500 bg-stitch-500 text-white'
              : 'border-stitch-200 text-stitch-700 hover:bg-stitch-50 dark:border-stitch-700 dark:text-stitch-200 dark:hover:bg-stitch-800'
          }`}
        >
          Fit pattern
        </button>

        <div className="flex items-end gap-1">
          <button
            type="button"
            onClick={onZoomOut}
            aria-label="Zoom out"
            className="flex min-h-11 min-w-11 touch-manipulation items-center justify-center rounded-xl border border-stitch-200 text-lg font-bold active:scale-95 dark:border-stitch-700"
          >
            −
          </button>
          <div>
            <label
              htmlFor="zoom-percent"
              className="mb-1 block text-xs font-medium text-stitch-600 dark:text-stitch-400"
            >
              Zoom
            </label>
            <div className="relative">
              <input
                id="zoom-percent"
                type="text"
                inputMode="numeric"
                value={fitToView ? 'Fit' : zoomDraft}
                onChange={(e) => {
                  if (fitToView) return
                  setZoomDraft(e.target.value)
                }}
                onFocus={() => {
                  if (fitToView) onZoomChange(zoom)
                }}
                onBlur={(e) => commitZoom(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && commitZoom(zoomDraft)}
                aria-label="Zoom percent"
                className="min-h-11 w-20 rounded-xl border border-stitch-200 bg-white px-2 pr-7 text-center text-sm dark:border-stitch-700 dark:bg-stitch-800"
              />
              <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-stitch-500">
                %
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onZoomIn}
            aria-label="Zoom in"
            className="flex min-h-11 min-w-11 touch-manipulation items-center justify-center rounded-xl border border-stitch-200 text-lg font-bold active:scale-95 dark:border-stitch-700"
          >
            +
          </button>
        </div>
      </div>

      <p className="text-xs text-stitch-500 dark:text-stitch-400">
        Working area only · {settings.fabricCount} stitches per inch · size{' '}
        {MIN_FABRIC_IN}&Prime;–{MAX_FABRIC_IN}&Prime; · zoom {Math.round(MIN_ZOOM * 100)}%–
        {Math.round(MAX_ZOOM * 100)}%
      </p>

      <div className="rounded-xl bg-stitch-50 px-3 py-2 text-xs text-stitch-600 dark:bg-stitch-800/50 dark:text-stitch-400">
        <p>
          <strong className="text-stitch-800 dark:text-stitch-200">Working area:</strong>{' '}
          {designW.toFixed(2)}&Prime; × {designH.toFixed(2)}&Prime; ({settings.stitchWidth} ×{' '}
          {settings.stitchHeight} stitches)
        </p>
        <p className="mt-1">
          <strong className="text-stitch-800 dark:text-stitch-200">Stitched:</strong>{' '}
          {stitchCount.toLocaleString()}
        </p>
      </div>
    </div>
  )
}
