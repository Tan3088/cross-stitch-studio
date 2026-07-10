import { FABRIC_COLORS, findColorById, THREAD_COLORS } from '../../constants/colors'
import type { CalculatorSettings, CrossStitchDesign, FabricCount } from '../../types'
import { marginToStitches, resolveMarginInches } from '../../utils/dimensions'
import { countStitchesByColor } from '../../utils/pattern'
import { Card } from '../Card'
import { ColorSwatchPicker } from '../ColorSwatchPicker'
import { FabricCountSelector } from '../FabricCountSelector'
import { FabricSizeControls } from './FabricSizeControls'
import { DesignPalette } from './DesignPalette'
import { DesignTemplates } from './DesignTemplates'
import { DesignToolbar } from './DesignToolbar'
import { PatternCanvas } from './PatternCanvas'
import type { BorderMarginPreset, DesignTool } from '../../types'

interface DesignStudioProps {
  design: CrossStitchDesign
  settings: CalculatorSettings
  activeTool: DesignTool
  activeColorId: string
  showGrid: boolean
  zoom: number
  fitToView: boolean
  onToolChange: (tool: DesignTool) => void
  onColorChange: (id: string) => void
  onToggleGrid: () => void
  onPaintCell: (x: number, y: number) => void
  onFabricSizeChange: (widthIn: number, heightIn: number) => void
  onFabricCountChange: (count: FabricCount) => void
  onFabricColorChange: (id: string) => void
  onMarginPresetChange: (preset: BorderMarginPreset) => void
  onCustomMarginChange: (margin: number) => void
  onNewDesign: () => void
  onClear: () => void
  onReset: () => void
  onApplyTemplate: (templateId: string) => void
  onExport: () => void
  onZoomIn: () => void
  onZoomOut: () => void
  onToggleFitToView: () => void
}

/** Full design studio with Aida fabric canvas, inch sizing, and margins. */
export function DesignStudio({
  design,
  settings,
  activeTool,
  activeColorId,
  showGrid,
  zoom,
  fitToView,
  onToolChange,
  onColorChange,
  onToggleGrid,
  onPaintCell,
  onFabricSizeChange,
  onFabricCountChange,
  onFabricColorChange,
  onMarginPresetChange,
  onCustomMarginChange,
  onNewDesign,
  onClear,
  onReset,
  onApplyTemplate,
  onExport,
  onZoomIn,
  onZoomOut,
  onToggleFitToView,
}: DesignStudioProps) {
  const stitchCounts = countStitchesByColor(design)
  const totalStitches = [...stitchCounts.values()].reduce((a, b) => a + b, 0)
  const activeColor = findColorById(THREAD_COLORS, activeColorId)
  const marginIn = resolveMarginInches(settings.borderMarginPreset, settings.customBorderMargin)
  const marginStitches = marginToStitches(marginIn, settings.fabricCount)

  return (
    <div className="space-y-4">
      <Card id="design-tools" title="Draw stitches">
        <p className="mb-4 text-sm text-stitch-600 dark:text-stitch-400">
          Set your fabric size in inches, choose a margin, pick a thread colour, then tap the Aida
          fabric inside the dashed border to stitch.
        </p>

        <div className="space-y-4">
          <DesignToolbar
            activeTool={activeTool}
            showGrid={showGrid}
            onToolChange={onToolChange}
            onToggleGrid={onToggleGrid}
            onClear={onClear}
            onExport={onExport}
          />

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
              {activeTool === 'eraser' && (
                <span className="text-xs text-stitch-500">Eraser removes stitches</span>
              )}
            </div>
            <DesignPalette activeColorId={activeColorId} onColorChange={onColorChange} />
          </div>

          <DesignTemplates onApply={onApplyTemplate} />
        </div>
      </Card>

      <Card id="design-canvas" title="Aida fabric">
        <div className="mb-5 space-y-5">
          <FabricCountSelector
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
        </div>

        <FabricSizeControls
          settings={settings}
          stitchCount={totalStitches}
          zoom={zoom}
          fitToView={fitToView}
          onFabricSizeChange={onFabricSizeChange}
          onMarginPresetChange={onMarginPresetChange}
          onCustomMarginChange={onCustomMarginChange}
          onNewDesign={onNewDesign}
          onReset={onReset}
          onZoomIn={onZoomIn}
          onZoomOut={onZoomOut}
          onToggleFitToView={onToggleFitToView}
        />

        <div className="mt-4">
          <PatternCanvas
            design={design}
            fabricColorId={settings.fabricColorId}
            marginStitches={marginStitches}
            showGrid={showGrid}
            zoom={zoom}
            fitToView={fitToView}
            onPaintCell={onPaintCell}
          />
        </div>

        <p className="mt-3 text-center text-xs text-stitch-500 dark:text-stitch-400">
          Tap <strong>Fit pattern</strong> to see your whole design · Use +/− to zoom in for detail
        </p>
      </Card>

      {stitchCounts.size > 0 && (
        <Card id="design-legend" title="Thread count">
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {[...stitchCounts.entries()]
              .sort((a, b) => b[1] - a[1])
              .map(([colorId, count]) => {
                const color = findColorById(THREAD_COLORS, colorId)
                return (
                  <li
                    key={colorId}
                    className="flex items-center gap-2 rounded-lg bg-stitch-50 px-2 py-1.5 text-sm dark:bg-stitch-800/50"
                  >
                    <span
                      className="h-5 w-5 shrink-0 rounded-md border border-black/10"
                      style={{ backgroundColor: color.hex }}
                      aria-hidden="true"
                    />
                    <span className="min-w-0 flex-1 truncate text-stitch-700 dark:text-stitch-200">
                      {color.name}
                    </span>
                    <span className="font-semibold text-stitch-900 dark:text-stitch-100">
                      {count}
                    </span>
                  </li>
                )
              })}
          </ul>
        </Card>
      )}
    </div>
  )
}
