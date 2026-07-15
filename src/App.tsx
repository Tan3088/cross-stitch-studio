import { useCallback, useEffect } from 'react'
import { DesignStudio } from './components/design/DesignStudio'
import { useCalculator } from './hooks/useCalculator'
import { useDesignStudio } from './hooks/useDesignStudio'
import { useTheme } from './hooks/useTheme'
import { exportPatternAsPng } from './utils/exportPattern'

function App() {
  const { theme, toggleTheme } = useTheme()

  const {
    settings,
    setFabricSizeInches,
    setStitchDimensions,
    setFabricCount,
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
    syncFromCalculator,
    zoomIn,
    zoomOut,
    toggleFitToView,
    setZoomExplicit,
    setFitToViewExplicit,
  } = useDesignStudio({
    stitchWidth: settings.stitchWidth,
    stitchHeight: settings.stitchHeight,
    onDimensionsChange: setStitchDimensions,
  })

  useEffect(() => {
    syncFromCalculator()
  }, [settings.stitchWidth, settings.stitchHeight, syncFromCalculator])

  const handleExport = () => {
    exportPatternAsPng(design, settings.fabricColorId, 0, settings.fabricCount)
  }

  const handleNewDesign = useCallback(() => {
    newDesign(settings.stitchWidth, settings.stitchHeight)
  }, [newDesign, settings.stitchWidth, settings.stitchHeight])

  const handleColorChange = (id: string) => {
    setThreadColorId(id)
    setActiveColorId(id)
  }

  return (
    <DesignStudio
      design={design}
      settings={settings}
      activeTool={activeTool}
      activeColorId={activeColorId}
      showGrid={showGrid}
      zoom={zoom}
      fitToView={fitToView}
      theme={theme}
      onToggleTheme={toggleTheme}
      onToolChange={setActiveTool}
      onColorChange={handleColorChange}
      onToggleGrid={toggleGrid}
      onPaintCell={paintCell}
      onFabricSizeChange={setFabricSizeInches}
      onFabricCountChange={setFabricCount}
      onFabricColorChange={setFabricColorId}
      onNewDesign={handleNewDesign}
      onClear={clearDesign}
      onReset={reset}
      onExport={handleExport}
      onZoomIn={zoomIn}
      onZoomOut={zoomOut}
      onToggleFitToView={toggleFitToView}
      onZoomChange={setZoomExplicit}
      onFitToViewChange={setFitToViewExplicit}
    />
  )
}

export default App
