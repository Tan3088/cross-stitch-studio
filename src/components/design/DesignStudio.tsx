import { useEffect, useState } from 'react'
import { FABRIC_COLORS, findColorById, THREAD_COLORS } from '../../constants/colors'
import { findFabricByCount } from '../../constants/fabricCounts'
import type {
  CalculatorSettings,
  CrossStitchDesign,
  DesignTool,
  FabricCount,
} from '../../types'
import { countStitchesByColor } from '../../utils/pattern'
import { parseZoomPercent } from '../../utils/zoom'
import { ColorSwatchPicker } from '../ColorSwatchPicker'
import { FabricTypeSelector } from '../FabricTypeSelector'
import { ThemeToggle } from '../ThemeToggle'
import type { Theme } from '../../types'
import { FabricSizeControls } from './FabricSizeControls'
import { DesignPalette } from './DesignPalette'
import { DesignToolbar } from './DesignToolbar'
import { PatternCanvas } from './PatternCanvas'

interface DesignStudioProps {
  design: CrossStitchDesign
  settings: CalculatorSettings
  activeTool: DesignTool
  activeColorId: string
  showGrid: boolean
  zoom: number
  fitToView: boolean
  theme: Theme
  onToggleTheme: () => void
  onToolChange: (tool: DesignTool) => void
  onColorChange: (id: string) => void
  onToggleGrid: () => void
  onPaintCell: (x: number, y: number) => void
  onFabricSizeChange: (widthIn: number, heightIn: number) => void
  onFabricCountChange: (count: FabricCount) => void
  onFabricColorChange: (id: string) => void
  onNewDesign: () => void
  onClear: () => void
  onReset: () => void
  onExport: () => void
  onZoomIn: () => void
  onZoomOut: () => void
  onToggleFitToView: () => void
  onZoomChange: (zoom: number) => void
  onFitToViewChange: (fit: boolean) => void
}

/** Single studio view: edit panel + fabric canvas with inch rulers. */
export function DesignStudio({
  design,
  settings,
  activeTool,
  activeColorId,
  showGrid,
  zoom,
  fitToView,
  theme,
  onToggleTheme,
  onToolChange,
  onColorChange,
  onToggleGrid,
  onPaintCell,
  onFabricSizeChange,
  onFabricCountChange,
  onFabricColorChange,
  onNewDesign,
  onClear,
  onReset,
  onExport,
  onZoomIn,
  onZoomOut,
  onToggleFitToView,
  onZoomChange,
  onFitToViewChange,
}: DesignStudioProps) {
  const [zoomDraft, setZoomDraft] = useState(String(Math.round(zoom * 100)))
  const totalStitches = [...countStitchesByColor(design).values()].reduce((a, b) => a + b, 0)
  const activeColor = findColorById(THREAD_COLORS, activeColorId)
  const fabric = findFabricByCount(settings.fabricCount)

  useEffect(() => {
    setZoomDraft(String(Math.round(zoom * 100)))
  }, [zoom])

  const commitZoom = (raw: string) => {
    const value = parseZoomPercent(raw)
    if (value === null) {
      setZoomDraft(String(Math.round(zoom * 100)))
      return
    }
    setZoomDraft(String(Math.round(value * 100)))
    onZoomChange(value)
  }

  const canvasProps = {
    design,
    fabricColorId: settings.fabricColorId,
    marginStitches: 0,
    showGrid,
    zoom,
    fitToView,
    weave: fabric.weave,
    stitchesPerInch: fabric.count,
    activeTool,
    onPaintCell,
    onZoomChange,
    onFitToViewChange,
  }

  return (
    <div className="flex h-dvh min-h-0 flex-col bg-stitch-50 dark:bg-stitch-950">
      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-stitch-200 bg-white px-3 py-2 sm:px-4 dark:border-stitch-800 dark:bg-stitch-900">
        <p className="mr-1 text-sm font-semibold text-stitch-800 dark:text-stitch-100">
          {fabric.name}
        </p>

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
            <label htmlFor="studio-zoom-percent" className="sr-only">
              Zoom percent
            </label>
            <div className="relative">
              <input
                id="studio-zoom-percent"
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
          Fit
        </button>

        <div className="ml-auto flex items-center gap-2">
          {activeTool !== 'eraser' && (
            <span className="hidden items-center gap-1.5 rounded-full border border-stitch-200 px-2 py-0.5 text-xs sm:inline-flex dark:border-stitch-700">
              <span
                className="h-3.5 w-3.5 rounded-full border border-black/10"
                style={{ backgroundColor: activeColor.hex }}
              />
              {activeColor.name}
            </span>
          )}
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <aside className="max-h-[46vh] shrink-0 overflow-y-auto border-b border-stitch-200 bg-white px-3 py-3 md:max-h-none md:w-80 md:border-b-0 md:border-r lg:w-96 dark:border-stitch-800 dark:bg-stitch-900">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-stitch-600 dark:text-stitch-400">
            Edit
          </p>

          <div className="space-y-4">
            <FabricTypeSelector
              value={settings.fabricCount}
              onChange={onFabricCountChange}
            />

            <ColorSwatchPicker
              id="fabric-color"
              label="Fabric colour"
              colors={FABRIC_COLORS}
              selectedId={settings.fabricColorId}
              onChange={onFabricColorChange}
            />

            <div>
              <p className="mb-2 text-sm font-medium text-stitch-700 dark:text-stitch-300">
                Tools
              </p>
              <DesignToolbar
                activeTool={activeTool}
                showGrid={showGrid}
                onToolChange={onToolChange}
                onToggleGrid={onToggleGrid}
                onClear={onClear}
                onExport={onExport}
              />
            </div>

            <div>
              <div className="mb-2 flex items-center gap-2">
                <p className="text-sm font-medium text-stitch-700 dark:text-stitch-300">
                  Thread colour
                </p>
                {activeTool !== 'eraser' && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-stitch-200 px-2 py-0.5 text-xs dark:border-stitch-700">
                    <span
                      className="h-3.5 w-3.5 rounded-full border border-black/10"
                      style={{ backgroundColor: activeColor.hex }}
                    />
                    {activeColor.name}
                  </span>
                )}
              </div>
              <DesignPalette activeColorId={activeColorId} onColorChange={onColorChange} />
            </div>

            <FabricSizeControls
              settings={settings}
              stitchCount={totalStitches}
              zoom={zoom}
              fitToView={fitToView}
              onFabricSizeChange={onFabricSizeChange}
              onNewDesign={onNewDesign}
              onReset={onReset}
              onZoomIn={onZoomIn}
              onZoomOut={onZoomOut}
              onToggleFitToView={onToggleFitToView}
              onZoomChange={onZoomChange}
            />
          </div>
        </aside>

        <div className="min-h-0 min-w-0 flex-1 p-0 md:p-2">
          <PatternCanvas {...canvasProps} fullscreen />
        </div>
      </div>
    </div>
  )
}
