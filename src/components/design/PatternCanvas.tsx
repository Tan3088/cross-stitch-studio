import { useCallback, useEffect, useRef, useState } from 'react'
import { findColorById, FABRIC_COLORS } from '../../constants/colors'
import type { CrossStitchDesign } from '../../types'
import { drawAidaCanvas, getAidaCanvasSize } from '../../utils/aidaRender'

interface PatternCanvasProps {
  design: CrossStitchDesign
  fabricColorId: string
  marginStitches: number
  showGrid: boolean
  zoom: number
  fitToView: boolean
  onPaintCell: (x: number, y: number) => void
}

const BASE_CELL = 22

/**
 * Interactive Aida fabric canvas with visible margins.
 * Tap or drag on the centre design area to place stitches through the fabric holes.
 */
export function PatternCanvas({
  design,
  fabricColorId,
  marginStitches,
  showGrid,
  zoom,
  fitToView,
  onPaintCell,
}: PatternCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const isDrawing = useRef(false)
  const lastCell = useRef<string | null>(null)
  const [displayScale, setDisplayScale] = useState(1)

  const fabricHex = findColorById(FABRIC_COLORS, fabricColorId).hex
  const cellSize = Math.max(8, Math.floor(BASE_CELL * zoom))
  const { width: canvasWidth, height: canvasHeight } = getAidaCanvasSize(
    design.width,
    design.height,
    marginStitches,
    cellSize,
  )

  // Scale canvas to fit container when "Fit pattern" is on
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const updateScale = () => {
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
    })
  }, [design, fabricHex, showGrid, cellSize, canvasWidth, canvasHeight, marginStitches])

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

  const paintAt = useCallback(
    (clientX: number, clientY: number) => {
      const cell = getCellFromEvent(clientX, clientY)
      if (!cell) return
      const key = `${cell[0]},${cell[1]}`
      if (lastCell.current === key) return
      lastCell.current = key
      onPaintCell(cell[0], cell[1])
    },
    [getCellFromEvent, onPaintCell],
  )

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault()
    isDrawing.current = true
    lastCell.current = null
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    paintAt(e.clientX, e.clientY)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDrawing.current) return
    e.preventDefault()
    paintAt(e.clientX, e.clientY)
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    isDrawing.current = false
    lastCell.current = null
    try {
      ;(e.target as HTMLElement).releasePointerCapture(e.pointerId)
    } catch {
      // Pointer may already be released
    }
  }

  const displayW = canvasWidth * displayScale
  const displayH = canvasHeight * displayScale

  return (
    <div
      ref={containerRef}
      className="w-full overflow-auto rounded-xl border-2 border-[#C4A882] bg-[#E8DDD0] shadow-inner"
      style={{
        maxHeight: fitToView ? 'min(70vh, 560px)' : 'min(75vh, 700px)',
        minHeight: fitToView ? 'min(50vh, 400px)' : undefined,
        touchAction: 'none',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      <div
        className={`p-3 sm:p-4 ${fitToView ? 'flex min-h-full items-center justify-center' : 'inline-block min-w-full'}`}
      >
        <canvas
          ref={canvasRef}
          role="application"
          aria-label={`Aida fabric, ${design.width} by ${design.height} stitch design with ${marginStitches} stitch margin. Tap the centre area to draw.`}
          className="block cursor-crosshair select-none rounded-lg shadow-lg"
          style={{
            width: displayW,
            height: displayH,
            imageRendering: 'auto',
            maxWidth: fitToView ? '100%' : 'none',
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onPointerCancel={handlePointerUp}
        />
      </div>
    </div>
  )
}
