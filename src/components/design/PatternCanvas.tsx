import { useCallback, useEffect, useRef, useState } from 'react'
import { findColorById, FABRIC_COLORS } from '../../constants/colors'
import { MAX_ZOOM, MIN_ZOOM, ZOOM_STEP } from '../../constants/fabricCounts'
import type { CrossStitchDesign, DesignTool } from '../../types'
import type { FabricWeave } from '../../utils/aidaRender'
import { drawAidaCanvas, getAidaCanvasSize } from '../../utils/aidaRender'
import { clampZoom } from '../../utils/zoom'

interface PatternCanvasProps {
  design: CrossStitchDesign
  fabricColorId: string
  marginStitches: number
  showGrid: boolean
  zoom: number
  fitToView: boolean
  weave?: FabricWeave
  stitchesPerInch?: number
  fullscreen?: boolean
  activeTool?: DesignTool
  onPaintCell: (x: number, y: number) => void
  onZoomChange: (zoom: number) => void
  onFitToViewChange: (fit: boolean) => void
}

const BASE_CELL = 22
const RULER_SIZE_NORMAL = 28
const RULER_SIZE_FULL = 36

function pointerDistance(
  a: { x: number; y: number },
  b: { x: number; y: number },
): number {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

/** Paint every cell on a line from a→b so fast drags don't skip stitches. */
function cellsAlongLine(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
): Array<[number, number]> {
  const cells: Array<[number, number]> = []
  let x = x0
  let y = y0
  const dx = Math.abs(x1 - x0)
  const dy = Math.abs(y1 - y0)
  const sx = x0 < x1 ? 1 : -1
  const sy = y0 < y1 ? 1 : -1
  let err = dx - dy

  for (;;) {
    cells.push([x, y])
    if (x === x1 && y === y1) break
    const e2 = 2 * err
    if (e2 > -dy) {
      err -= dy
      x += sx
    }
    if (e2 < dx) {
      err += dx
      y += sy
    }
  }
  return cells
}

/** Measuring tape in inches: 0", 1", 2"… with stitch ticks between inches. */
function drawHorizontalRuler(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  cellPx: number,
  stitches: number,
  stitchesPerInch: number,
  scrollLeft: number,
  contentPad: number,
) {
  ctx.clearRect(0, 0, width, height)
  ctx.fillStyle = '#E8E4DF'
  ctx.fillRect(0, 0, width, height)
  ctx.strokeStyle = '#B8B0A6'
  ctx.beginPath()
  ctx.moveTo(0, height - 0.5)
  ctx.lineTo(width, height - 0.5)
  ctx.stroke()

  const origin = contentPad - scrollLeft
  ctx.fillStyle = '#3D342C'
  ctx.strokeStyle = '#6B6056'
  ctx.font = `600 ${Math.max(9, Math.min(12, height * 0.4))}px ui-sans-serif, system-ui, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  for (let i = 0; i <= stitches; i++) {
    const x = origin + i * cellPx
    if (x < -28 || x > width + 28) continue
    const isInch = i % stitchesPerInch === 0
    const isHalf =
      stitchesPerInch >= 8 && i % Math.max(1, Math.floor(stitchesPerInch / 2)) === 0 && !isInch
    const tickH = isInch ? height - 3 : isHalf ? height * 0.55 : height * 0.3
    ctx.lineWidth = isInch ? 1.75 : 1
    ctx.beginPath()
    ctx.moveTo(x + 0.5, height)
    ctx.lineTo(x + 0.5, height - tickH)
    ctx.stroke()
    if (isInch) {
      const inches = i / stitchesPerInch
      ctx.fillText(`${inches}"`, x + (i === 0 ? 8 : 0), height * 0.36)
    }
  }
}

function drawVerticalRuler(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  cellPx: number,
  stitches: number,
  stitchesPerInch: number,
  scrollTop: number,
  contentPad: number,
) {
  ctx.clearRect(0, 0, width, height)
  ctx.fillStyle = '#E8E4DF'
  ctx.fillRect(0, 0, width, height)
  ctx.strokeStyle = '#B8B0A6'
  ctx.beginPath()
  ctx.moveTo(width - 0.5, 0)
  ctx.lineTo(width - 0.5, height)
  ctx.stroke()

  const origin = contentPad - scrollTop
  ctx.fillStyle = '#3D342C'
  ctx.strokeStyle = '#6B6056'
  ctx.font = `600 ${Math.max(9, Math.min(12, width * 0.4))}px ui-sans-serif, system-ui, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  for (let i = 0; i <= stitches; i++) {
    const y = origin + i * cellPx
    if (y < -28 || y > height + 28) continue
    const isInch = i % stitchesPerInch === 0
    const isHalf =
      stitchesPerInch >= 8 && i % Math.max(1, Math.floor(stitchesPerInch / 2)) === 0 && !isInch
    const tickW = isInch ? width - 3 : isHalf ? width * 0.55 : width * 0.3
    ctx.lineWidth = isInch ? 1.75 : 1
    ctx.beginPath()
    ctx.moveTo(width, y + 0.5)
    ctx.lineTo(width - tickW, y + 0.5)
    ctx.stroke()
    if (isInch) {
      const inches = i / stitchesPerInch
      ctx.save()
      ctx.translate(width * 0.38, y + (i === 0 ? 8 : 0))
      ctx.rotate(-Math.PI / 2)
      ctx.fillText(`${inches}"`, 0, 0)
      ctx.restore()
    }
  }
}

/**
 * Interactive fabric canvas with chart-style measuring tape rulers.
 * Drag to draw continuous stitches; pinch to zoom; wheel / space-drag to pan.
 */
export function PatternCanvas({
  design,
  fabricColorId,
  marginStitches,
  showGrid,
  zoom,
  fitToView,
  weave = 'aida',
  stitchesPerInch = 9,
  fullscreen = false,
  activeTool = 'stitch',
  onPaintCell,
  onZoomChange,
  onFitToViewChange,
}: PatternCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const hRulerRef = useRef<HTMLCanvasElement>(null)
  const vRulerRef = useRef<HTMLCanvasElement>(null)
  const lastCell = useRef<[number, number] | null>(null)
  const zoomRef = useRef(zoom)
  const activeToolRef = useRef(activeTool)
  const spaceDown = useRef(false)

  const pointers = useRef(new Map<number, { x: number; y: number }>())
  const gestureMode = useRef<'none' | 'draw' | 'pan' | 'pinch'>('none')
  const panOrigin = useRef<{ x: number; y: number; left: number; top: number } | null>(null)
  const pinchStartDist = useRef(0)
  const pinchStartZoom = useRef(zoom)
  const pinchMid = useRef<{ x: number; y: number; left: number; top: number } | null>(null)
  const capturePointerId = useRef<number | null>(null)

  const [displayScale, setDisplayScale] = useState(1)
  const [scroll, setScroll] = useState({ left: 0, top: 0 })
  const [viewport, setViewport] = useState({ w: 0, h: 0 })

  useEffect(() => {
    zoomRef.current = zoom
  }, [zoom])

  useEffect(() => {
    activeToolRef.current = activeTool
  }, [activeTool])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        spaceDown.current = true
      }
    }
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        spaceDown.current = false
      }
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [])

  const fabricHex = findColorById(FABRIC_COLORS, fabricColorId).hex
  const cellSize = Math.max(8, Math.floor(BASE_CELL * zoom))
  const { width: canvasWidth, height: canvasHeight } = getAidaCanvasSize(
    design.width,
    design.height,
    marginStitches,
    cellSize,
  )

  const contentPad = fitToView ? 12 : 16
  const displayW = canvasWidth * displayScale
  const displayH = canvasHeight * displayScale
  const cellPx = cellSize * displayScale
  const inch = Math.max(1, stitchesPerInch)
  const rulerSize = fullscreen ? RULER_SIZE_FULL : RULER_SIZE_NORMAL

  useEffect(() => {
    const container = scrollRef.current
    if (!container) return

    const updateScale = () => {
      setViewport({ w: container.clientWidth, h: container.clientHeight })
      if (!fitToView) {
        setDisplayScale(1)
        return
      }
      const pad = 24
      const availW = container.clientWidth - pad
      const availH = container.clientHeight - pad
      if (availW <= 0 || availH <= 0) return
      const scale = Math.min(availW / canvasWidth, availH / canvasHeight, 1)
      setDisplayScale(scale)
    }

    updateScale()
    const observer = new ResizeObserver(updateScale)
    observer.observe(container)
    return () => observer.disconnect()
  }, [fitToView, canvasWidth, canvasHeight])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = canvasWidth
    canvas.height = canvasHeight

    drawAidaCanvas({
      ctx,
      pixels: design.pixels,
      designWidth: design.width,
      designHeight: design.height,
      marginStitches,
      cellSize,
      fabricHex,
      showGrid,
      weave,
      stitchesPerInch: inch,
    })
  }, [
    design,
    fabricHex,
    showGrid,
    cellSize,
    canvasWidth,
    canvasHeight,
    marginStitches,
    weave,
    inch,
  ])

  const syncRulers = useCallback(() => {
    const h = hRulerRef.current
    const v = vRulerRef.current
    const scrollEl = scrollRef.current
    if (!h || !v || !scrollEl) return

    const dpr = window.devicePixelRatio || 1
    const hW = Math.max(1, scrollEl.clientWidth)
    const vH = Math.max(1, scrollEl.clientHeight)

    h.width = Math.floor(hW * dpr)
    h.height = Math.floor(rulerSize * dpr)
    h.style.width = `${hW}px`
    h.style.height = `${rulerSize}px`
    const hCtx = h.getContext('2d')
    if (hCtx) {
      hCtx.setTransform(dpr, 0, 0, dpr, 0, 0)
      drawHorizontalRuler(
        hCtx,
        hW,
        rulerSize,
        cellPx,
        design.width,
        inch,
        scroll.left,
        contentPad + marginStitches * cellPx,
      )
    }

    v.width = Math.floor(rulerSize * dpr)
    v.height = Math.floor(vH * dpr)
    v.style.width = `${rulerSize}px`
    v.style.height = `${vH}px`
    const vCtx = v.getContext('2d')
    if (vCtx) {
      vCtx.setTransform(dpr, 0, 0, dpr, 0, 0)
      drawVerticalRuler(
        vCtx,
        rulerSize,
        vH,
        cellPx,
        design.height,
        inch,
        scroll.top,
        contentPad + marginStitches * cellPx,
      )
    }
  }, [
    cellPx,
    design.width,
    design.height,
    inch,
    scroll.left,
    scroll.top,
    contentPad,
    marginStitches,
    viewport.w,
    viewport.h,
    rulerSize,
  ])

  useEffect(() => {
    syncRulers()
  }, [syncRulers])

  // Re-measure rulers after expand so they fill the fullscreen viewport
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const container = scrollRef.current
      if (container) {
        setViewport({ w: container.clientWidth, h: container.clientHeight })
      }
      syncRulers()
    })
    return () => cancelAnimationFrame(id)
  }, [fullscreen, zoom, fitToView, syncRulers])

  useEffect(() => {
    const container = scrollRef.current
    if (!container) return

    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      onFitToViewChange(false)
      const direction = e.deltaY < 0 ? 1 : -1
      const factor = e.ctrlKey || e.metaKey ? ZOOM_STEP * 2 : ZOOM_STEP
      const next = clampZoom(zoomRef.current + direction * factor)
      onZoomChange(Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, next)))
    }

    container.addEventListener('wheel', onWheel, { passive: false })
    return () => container.removeEventListener('wheel', onWheel)
  }, [onZoomChange, onFitToViewChange])

  const getCellFromEvent = useCallback(
    (clientX: number, clientY: number): [number, number] | null => {
      const canvas = canvasRef.current
      if (!canvas) return null
      const rect = canvas.getBoundingClientRect()
      const scaleX = canvas.width / rect.width
      const scaleY = canvas.height / rect.height
      const canvasX = (clientX - rect.left) * scaleX
      const canvasY = (clientY - rect.top) * scaleY
      const gridX = Math.floor(canvasX / cellSize)
      const gridY = Math.floor(canvasY / cellSize)

      const designX = gridX - marginStitches
      const designY = gridY - marginStitches

      if (designX < 0 || designY < 0 || designX >= design.width || designY >= design.height) {
        return null
      }
      return [designX, designY]
    },
    [cellSize, marginStitches, design.width, design.height],
  )

  const paintStrokeTo = useCallback(
    (clientX: number, clientY: number) => {
      const cell = getCellFromEvent(clientX, clientY)
      if (!cell) return

      const tool = activeToolRef.current
      // Fill applies once per gesture (flood fill), not cell-by-cell while dragging.
      if (tool === 'fill') {
        if (lastCell.current) return
        lastCell.current = cell
        onPaintCell(cell[0], cell[1])
        return
      }

      if (!lastCell.current) {
        lastCell.current = cell
        onPaintCell(cell[0], cell[1])
        return
      }

      const [lx, ly] = lastCell.current
      if (lx === cell[0] && ly === cell[1]) return

      for (const [x, y] of cellsAlongLine(lx, ly, cell[0], cell[1])) {
        if (lastCell.current && lastCell.current[0] === x && lastCell.current[1] === y) {
          continue
        }
        onPaintCell(x, y)
        lastCell.current = [x, y]
      }
    },
    [getCellFromEvent, onPaintCell],
  )

  const releaseCapture = useCallback(() => {
    const canvas = canvasRef.current
    if (canvas && capturePointerId.current !== null) {
      try {
        canvas.releasePointerCapture(capturePointerId.current)
      } catch {
        // Already released
      }
    }
    capturePointerId.current = null
  }, [])

  const resetGesture = useCallback(() => {
    gestureMode.current = 'none'
    panOrigin.current = null
    pinchMid.current = null
    lastCell.current = null
    releaseCapture()
  }, [releaseCapture])

  const beginPan = (e: React.PointerEvent) => {
    const container = scrollRef.current
    if (!container) return
    gestureMode.current = 'pan'
    panOrigin.current = {
      x: e.clientX,
      y: e.clientY,
      left: container.scrollLeft,
      top: container.scrollTop,
    }
    const canvas = canvasRef.current
    if (canvas) {
      canvas.setPointerCapture(e.pointerId)
      capturePointerId.current = e.pointerId
    }
  }

  const beginDraw = (e: React.PointerEvent) => {
    gestureMode.current = 'draw'
    lastCell.current = null
    const canvas = canvasRef.current
    if (canvas) {
      canvas.setPointerCapture(e.pointerId)
      capturePointerId.current = e.pointerId
    }
    paintStrokeTo(e.clientX, e.clientY)
  }

  const handlePointerDown = (e: React.PointerEvent) => {
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })

    if (pointers.current.size === 2) {
      const pts = [...pointers.current.values()]
      gestureMode.current = 'pinch'
      panOrigin.current = null
      lastCell.current = null
      pinchStartDist.current = pointerDistance(pts[0], pts[1])
      pinchStartZoom.current = zoomRef.current
      const midX = (pts[0].x + pts[1].x) / 2
      const midY = (pts[0].y + pts[1].y) / 2
      const container = scrollRef.current
      pinchMid.current = {
        x: midX,
        y: midY,
        left: container?.scrollLeft ?? 0,
        top: container?.scrollTop ?? 0,
      }
      onFitToViewChange(false)
      releaseCapture()
      return
    }

    if (pointers.current.size !== 1) return

    // Space + drag, middle button, or secondary button pans instead of drawing.
    const wantsPan =
      spaceDown.current || e.button === 1 || e.button === 2 || (e.buttons & 4) === 4
    if (wantsPan) {
      e.preventDefault()
      beginPan(e)
      return
    }

    if (e.button !== 0) return
    e.preventDefault()
    beginDraw(e)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })

    if (gestureMode.current === 'pinch' && pointers.current.size >= 2) {
      e.preventDefault()
      const pts = [...pointers.current.values()]
      const dist = pointerDistance(pts[0], pts[1])
      if (pinchStartDist.current > 0) {
        onZoomChange(clampZoom(pinchStartZoom.current * (dist / pinchStartDist.current)))
      }
      if (pinchMid.current && scrollRef.current) {
        const midX = (pts[0].x + pts[1].x) / 2
        const midY = (pts[0].y + pts[1].y) / 2
        scrollRef.current.scrollLeft = pinchMid.current.left - (midX - pinchMid.current.x)
        scrollRef.current.scrollTop = pinchMid.current.top - (midY - pinchMid.current.y)
      }
      return
    }

    if (gestureMode.current === 'pan' && panOrigin.current) {
      e.preventDefault()
      const container = scrollRef.current
      if (!container) return
      const dx = e.clientX - panOrigin.current.x
      const dy = e.clientY - panOrigin.current.y
      container.scrollLeft = panOrigin.current.left - dx
      container.scrollTop = panOrigin.current.top - dy
      return
    }

    if (gestureMode.current === 'draw') {
      e.preventDefault()
      paintStrokeTo(e.clientX, e.clientY)
    }
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId)

    if (gestureMode.current === 'pinch') {
      if (pointers.current.size < 2) resetGesture()
      return
    }

    resetGesture()
  }

  const handlePointerCancel = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId)
    resetGesture()
  }

  const fabricLabel = weave === 'mono' ? 'Mono canvas' : 'Aida'

  return (
    <div
      className={`flex w-full flex-col overflow-hidden bg-[#D8D2CA] ${
        fullscreen ? 'h-full rounded-none border-0' : 'rounded-xl border-2 border-[#C4A882]'
      }`}
      style={{
        maxHeight: fullscreen ? 'none' : fitToView ? 'min(70vh, 560px)' : 'min(75vh, 700px)',
        minHeight: fullscreen ? '100%' : fitToView ? 'min(40vh, 320px)' : 'min(50vh, 400px)',
        height: fullscreen ? '100%' : undefined,
      }}
    >
      <div className="flex shrink-0" style={{ height: rulerSize }}>
        <div
          className="shrink-0 border-b border-r border-[#B8B0A6] bg-[#DED9D2]"
          style={{ width: rulerSize, height: rulerSize }}
          aria-hidden="true"
        />
        <canvas ref={hRulerRef} className="block min-w-0 flex-1" aria-hidden="true" />
      </div>

      <div className="flex min-h-0 flex-1">
        <canvas ref={vRulerRef} className="block shrink-0" aria-hidden="true" />
        <div
          ref={scrollRef}
          className="min-h-0 min-w-0 flex-1 overflow-auto overscroll-contain bg-[#E8DDD0]"
          style={{
            touchAction: 'none',
            WebkitOverflowScrolling: 'touch',
          }}
          onScroll={(e) => {
            const t = e.currentTarget
            setScroll({ left: t.scrollLeft, top: t.scrollTop })
          }}
        >
          <div
            className={fitToView ? 'flex min-h-full min-w-full items-center justify-center' : 'inline-block min-w-max'}
            style={{ padding: contentPad }}
          >
            <canvas
              ref={canvasRef}
              role="application"
              aria-label={`${fabricLabel}, ${design.width} by ${design.height} stitches. Drag to stitch, pinch to zoom, scroll or Space-drag to pan.`}
              className="block cursor-crosshair select-none shadow-md"
              style={{
                width: displayW,
                height: displayH,
                imageRendering: 'auto',
                maxWidth: fitToView ? '100%' : 'none',
                touchAction: 'none',
              }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerCancel}
              onContextMenu={(e) => e.preventDefault()}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
