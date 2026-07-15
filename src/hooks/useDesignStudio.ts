import { useCallback, useEffect, useState } from 'react'
import type { CrossStitchDesign, DesignTool } from '../types'
import { MAX_ZOOM, MIN_ZOOM } from '../constants/fabricCounts'
import { clearPattern, createEmptyPattern, floodFill, resizePattern, setPixel } from '../utils/pattern'
import { loadDesign, saveDesign } from '../utils/storage'
import { applyTemplate } from '../utils/templates'
import { clampZoom } from '../utils/zoom'

interface UseDesignStudioOptions {
  stitchWidth: number
  stitchHeight: number
  onDimensionsChange: (width: number, height: number) => void
}

/** Manages pattern state, drawing tools, and persistence for the design studio. */
export function useDesignStudio({
  stitchWidth,
  stitchHeight,
  onDimensionsChange,
}: UseDesignStudioOptions) {
  const [design, setDesign] = useState<CrossStitchDesign>(() =>
    loadDesign(stitchWidth, stitchHeight),
  )
  const [activeTool, setActiveTool] = useState<DesignTool>('stitch')
  const [activeColorId, setActiveColorId] = useState('navy')
  const [showGrid, setShowGrid] = useState(true)
  const [zoom, setZoom] = useState(1.25)
  const [fitToView, setFitToView] = useState(false)

  useEffect(() => {
    saveDesign(design)
  }, [design])

  const applyAt = useCallback(
    (x: number, y: number, tool: DesignTool, colorId: string) => {
      setDesign((prev) => {
        if (tool === 'fill') {
          return floodFill(prev, x, y, colorId)
        }
        if (tool === 'eraser') {
          return setPixel(prev, x, y, null)
        }
        return setPixel(prev, x, y, colorId)
      })
    },
    [],
  )

  const paintCell = useCallback(
    (x: number, y: number) => {
      applyAt(x, y, activeTool, activeColorId)
    },
    [activeTool, activeColorId, applyAt],
  )

  const resizeDesign = useCallback(
    (width: number, height: number) => {
      setDesign((prev) => resizePattern(prev, width, height))
      onDimensionsChange(width, height)
    },
    [onDimensionsChange],
  )

  const newDesign = useCallback(
    (width: number, height: number) => {
      const fresh = createEmptyPattern(width, height)
      setDesign(fresh)
      onDimensionsChange(width, height)
    },
    [onDimensionsChange],
  )

  const clearDesign = useCallback(() => {
    setDesign((prev) => clearPattern(prev))
  }, [])

  const applyDesignTemplate = useCallback(
    (templateId: string) => {
      setDesign((prev) =>
        applyTemplate(templateId, prev.width, prev.height, activeColorId),
      )
    },
    [activeColorId],
  )

  const syncFromCalculator = useCallback(() => {
    setDesign((prev) => {
      if (prev.width === stitchWidth && prev.height === stitchHeight) return prev
      return resizePattern(prev, stitchWidth, stitchHeight)
    })
  }, [stitchWidth, stitchHeight])

  const zoomIn = useCallback(() => {
    setFitToView(false)
    setZoom((z) => Math.min(MAX_ZOOM, z + 0.25))
  }, [])
  const zoomOut = useCallback(() => {
    setFitToView(false)
    setZoom((z) => Math.max(MIN_ZOOM, z - 0.25))
  }, [])
  const toggleFitToView = useCallback(() => setFitToView((f) => !f), [])
  const setFitToViewExplicit = useCallback((fit: boolean) => setFitToView(fit), [])
  const setZoomExplicit = useCallback((z: number) => {
    setFitToView(false)
    setZoom(clampZoom(z))
  }, [])
  const toggleGrid = useCallback(() => setShowGrid((g) => !g), [])

  return {
    design,
    activeTool,
    activeColorId,
    showGrid,
    zoom,
    fitToView,
    setActiveTool,
    setActiveColorId,
    setShowGrid,
    toggleGrid,
    paintCell,
    resizeDesign,
    newDesign,
    clearDesign,
    applyDesignTemplate,
    syncFromCalculator,
    zoomIn,
    zoomOut,
    toggleFitToView,
    setFitToViewExplicit,
    setZoomExplicit,
  }
}
