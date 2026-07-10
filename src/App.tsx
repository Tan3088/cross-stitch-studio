import { useCallback, useEffect } from 'react'
import { AppHeader } from './components/AppHeader'
import { DesignStudio } from './components/design/DesignStudio'
import { ResultsDisplay } from './components/ResultsDisplay'
import { useCalculator } from './hooks/useCalculator'
import { useDesignStudio } from './hooks/useDesignStudio'
import { useTheme } from './hooks/useTheme'
import { marginToStitches, resolveMarginInches } from './utils/dimensions'
import { exportPatternAsPng } from './utils/exportPattern'

function App() {
  const { theme, toggleTheme } = useTheme()

  const {
    settings,
    results,
    setFabricSizeInches,
    setStitchDimensions,
    setFabricCount,
    setBorderMarginPreset,
    setCustomBorderMargin,
    setFabricColorId,
    setThreadColorId,
    reset,
  } = useCalculator()

  const {
    design,
    activeTool,
    activeColorId,
    showGrid,
    zoom,
    fitToView,
    setActiveTool,
    setActiveColorId,
    toggleGrid,
    paintCell,
    newDesign,
    clearDesign,
    applyDesignTemplate,
    syncFromCalculator,
    zoomIn,
    zoomOut,
    toggleFitToView,
  } = useDesignStudio({
    stitchWidth: settings.stitchWidth,
    stitchHeight: settings.stitchHeight,
    onDimensionsChange: setStitchDimensions,
  })

  useEffect(() => {
    syncFromCalculator()
  }, [settings.stitchWidth, settings.stitchHeight, syncFromCalculator])

  const handleExport = () => {
    const marginIn = resolveMarginInches(settings.borderMarginPreset, settings.customBorderMargin)
    const marginStitches = marginToStitches(marginIn, settings.fabricCount)
    exportPatternAsPng(design, settings.fabricColorId, marginStitches)
  }

  const handleNewDesign = useCallback(() => {
    newDesign(settings.stitchWidth, settings.stitchHeight)
  }, [newDesign, settings.stitchWidth, settings.stitchHeight])

  const handleColorChange = (id: string) => {
    setThreadColorId(id)
    setActiveColorId(id)
  }

  return (
    <div className="mx-auto min-h-dvh w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <AppHeader theme={theme} onToggleTheme={toggleTheme} />

      <main className="grid grid-cols-1 gap-6 lg:grid-cols-5 lg:gap-8">
        <div className="lg:col-span-3">
          <DesignStudio
            design={design}
            settings={settings}
            activeTool={activeTool}
            activeColorId={activeColorId}
            showGrid={showGrid}
            zoom={zoom}
            fitToView={fitToView}
            onToolChange={setActiveTool}
            onColorChange={handleColorChange}
            onToggleGrid={toggleGrid}
            onPaintCell={paintCell}
            onFabricSizeChange={setFabricSizeInches}
            onFabricCountChange={setFabricCount}
            onFabricColorChange={setFabricColorId}
            onMarginPresetChange={setBorderMarginPreset}
            onCustomMarginChange={setCustomBorderMargin}
            onNewDesign={handleNewDesign}
            onClear={clearDesign}
            onReset={reset}
            onApplyTemplate={applyDesignTemplate}
            onExport={handleExport}
            onZoomIn={zoomIn}
            onZoomOut={zoomOut}
            onToggleFitToView={toggleFitToView}
          />
        </div>

        <aside className="lg:col-span-2">
          <div className="lg:sticky lg:top-6">
            <ResultsDisplay results={results} fabricCount={settings.fabricCount} />
          </div>
        </aside>
      </main>

      <footer className="mt-8 border-t border-stitch-200 pt-6 text-center text-xs text-stitch-500 dark:border-stitch-800 dark:text-stitch-500">
        <p>
          Set fabric size in inches, add margins, and draw your pattern on the Aida canvas.
        </p>
      </footer>
    </div>
  )
}

export default App
