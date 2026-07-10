import { findColorById, THREAD_COLORS } from '../constants/colors'

export const GRID_INTERVAL = 10

interface DrawAidaFabricOptions {
  ctx: CanvasRenderingContext2D
  cols: number
  rows: number
  cellSize: number
  offsetX: number
  offsetY: number
  fabricHex: string
}

/** Draw realistic Aida cloth texture over a grid region. */
export function drawAidaFabric({
  ctx,
  cols,
  rows,
  cellSize,
  offsetX,
  offsetY,
  fabricHex,
}: DrawAidaFabricOptions): void {
  const { r, g, b } = hexToRgb(fabricHex)
  const base = fabricHex
  const blockLight = `rgb(${clamp(r + 12)}, ${clamp(g + 12)}, ${clamp(b + 10)})`
  const blockShadow = `rgba(${clamp(r - 35)}, ${clamp(g - 35)}, ${clamp(b - 30)}, 0.45)`
  const holeColor = `rgba(${clamp(r - 55)}, ${clamp(g - 55)}, ${clamp(b - 50)}, 0.55)`

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const px = offsetX + x * cellSize
      const py = offsetY + y * cellSize

      // Base fabric
      ctx.fillStyle = base
      ctx.fillRect(px, py, cellSize, cellSize)

      // Raised woven block (Aida square)
      const inset = Math.max(1, cellSize * 0.12)
      ctx.fillStyle = blockLight
      ctx.fillRect(px + inset, py + inset, cellSize - inset * 2, cellSize - inset * 2)

      // Shadow under threads on right and bottom edges
      ctx.fillStyle = blockShadow
      ctx.fillRect(px + cellSize - inset, py + inset, inset, cellSize - inset * 2)
      ctx.fillRect(px + inset, py + cellSize - inset, cellSize - inset * 2, inset)

      // Holes at four corners (where needle goes)
      if (cellSize >= 6) {
        const holeR = Math.max(1, cellSize * 0.1)
        ctx.fillStyle = holeColor
        drawHole(ctx, px + holeR, py + holeR, holeR)
        drawHole(ctx, px + cellSize - holeR, py + holeR, holeR)
        drawHole(ctx, px + holeR, py + cellSize - holeR, holeR)
        drawHole(ctx, px + cellSize - holeR, py + cellSize - holeR, holeR)
      }
    }
  }
}

function drawHole(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.fill()
}

interface DrawAidaStitchOptions {
  ctx: CanvasRenderingContext2D
  x: number
  y: number
  cellSize: number
  offsetX: number
  offsetY: number
  colorHex: string
}

/** Draw a cross stitch through the four holes of an Aida block. */
export function drawAidaStitch({
  ctx,
  x,
  y,
  cellSize,
  offsetX,
  offsetY,
  colorHex,
}: DrawAidaStitchOptions): void {
  const px = offsetX + x * cellSize
  const py = offsetY + y * cellSize
  const pad = cellSize * 0.12
  const lineWidth = Math.max(2, cellSize * 0.17)

  const { r, g, b } = hexToRgb(colorHex)
  const shadow = `rgba(${clamp(r - 40)}, ${clamp(g - 40)}, ${clamp(b - 40)}, 0.35)`

  // Thread shadow
  ctx.strokeStyle = shadow
  ctx.lineWidth = lineWidth + 0.5
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(px + pad + 0.5, py + pad + 0.5)
  ctx.lineTo(px + cellSize - pad + 0.5, py + cellSize - pad + 0.5)
  ctx.moveTo(px + cellSize - pad + 0.5, py + pad + 0.5)
  ctx.lineTo(px + pad + 0.5, py + cellSize - pad + 0.5)
  ctx.stroke()

  // Thread
  ctx.strokeStyle = colorHex
  ctx.lineWidth = lineWidth
  ctx.beginPath()
  ctx.moveTo(px + pad, py + pad)
  ctx.lineTo(px + cellSize - pad, py + cellSize - pad)
  ctx.moveTo(px + cellSize - pad, py + pad)
  ctx.lineTo(px + pad, py + cellSize - pad)
  ctx.stroke()
}

interface DrawAidaCanvasOptions {
  ctx: CanvasRenderingContext2D
  pixels: (string | null)[]
  designWidth: number
  designHeight: number
  marginStitches: number
  cellSize: number
  fabricHex: string
  showGrid: boolean
}

/**
 * Draw full fabric piece with margin border and design area.
 * Margin stitches surround the design; only the centre is drawable.
 */
export function drawAidaCanvas({
  ctx,
  pixels,
  designWidth,
  designHeight,
  marginStitches,
  cellSize,
  fabricHex,
  showGrid,
}: DrawAidaCanvasOptions): void {
  const totalCols = designWidth + marginStitches * 2
  const totalRows = designHeight + marginStitches * 2
  const canvasW = totalCols * cellSize
  const canvasH = totalRows * cellSize

  // Wooden hoop / table background
  ctx.fillStyle = '#E8DDD0'
  ctx.fillRect(0, 0, canvasW, canvasH)

  drawAidaFabric({
    ctx,
    cols: totalCols,
    rows: totalRows,
    cellSize,
    offsetX: 0,
    offsetY: 0,
    fabricHex,
  })

  // Margin zone tint (subtle)
  if (marginStitches > 0) {
    ctx.fillStyle = 'rgba(120, 100, 80, 0.06)'
    // Top margin
    ctx.fillRect(0, 0, canvasW, marginStitches * cellSize)
    // Bottom margin
    ctx.fillRect(0, (marginStitches + designHeight) * cellSize, canvasW, marginStitches * cellSize)
    // Left margin (design rows only)
    ctx.fillRect(0, marginStitches * cellSize, marginStitches * cellSize, designHeight * cellSize)
    // Right margin
    ctx.fillRect(
      (marginStitches + designWidth) * cellSize,
      marginStitches * cellSize,
      marginStitches * cellSize,
      designHeight * cellSize,
    )
  }

  // Design area border
  const dx = marginStitches * cellSize
  const dy = marginStitches * cellSize
  const dw = designWidth * cellSize
  const dh = designHeight * cellSize

  ctx.strokeStyle = 'rgba(180, 140, 100, 0.5)'
  ctx.lineWidth = 2
  ctx.setLineDash([6, 4])
  ctx.strokeRect(dx + 1, dy + 1, dw - 2, dh - 2)
  ctx.setLineDash([])

  // Stitches in design area
  for (let y = 0; y < designHeight; y++) {
    for (let x = 0; x < designWidth; x++) {
      const colorId = pixels[y * designWidth + x]
      if (!colorId) continue
      const hex = findColorById(THREAD_COLORS, colorId).hex
      drawAidaStitch({
        ctx,
        x: x + marginStitches,
        y: y + marginStitches,
        cellSize,
        offsetX: 0,
        offsetY: 0,
        colorHex: hex,
      })
    }
  }

  if (showGrid && cellSize >= 8) {
    drawCountingGrid(ctx, cellSize, marginStitches, designWidth, designHeight)
  }
}

function drawCountingGrid(
  ctx: CanvasRenderingContext2D,
  cellSize: number,
  marginStitches: number,
  designWidth: number,
  designHeight: number,
) {
  const dx = marginStitches * cellSize
  const dy = marginStitches * cellSize
  const dw = designWidth * cellSize
  const dh = designHeight * cellSize

  // Minor lines in design area only
  ctx.strokeStyle = 'rgba(80, 70, 60, 0.12)'
  ctx.lineWidth = 0.5
  ctx.beginPath()
  for (let x = 0; x <= designWidth; x++) {
    const px = dx + x * cellSize + 0.5
    ctx.moveTo(px, dy)
    ctx.lineTo(px, dy + dh)
  }
  for (let y = 0; y <= designHeight; y++) {
    const py = dy + y * cellSize + 0.5
    ctx.moveTo(dx, py)
    ctx.lineTo(dx + dw, py)
  }
  ctx.stroke()

  // Major lines every 10 stitches in design area
  ctx.strokeStyle = 'rgba(60, 50, 40, 0.35)'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  for (let x = 0; x <= designWidth; x += GRID_INTERVAL) {
    const px = dx + x * cellSize + 0.5
    ctx.moveTo(px, dy)
    ctx.lineTo(px, dy + dh)
  }
  for (let y = 0; y <= designHeight; y += GRID_INTERVAL) {
    const py = dy + y * cellSize + 0.5
    ctx.moveTo(dx, py)
    ctx.lineTo(dx + dw, py)
  }
  ctx.stroke()
}

export function getAidaCanvasSize(
  designWidth: number,
  designHeight: number,
  marginStitches: number,
  cellSize: number,
): { width: number; height: number; totalCols: number; totalRows: number } {
  const totalCols = designWidth + marginStitches * 2
  const totalRows = designHeight + marginStitches * 2
  return {
    width: totalCols * cellSize,
    height: totalRows * cellSize,
    totalCols,
    totalRows,
  }
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  return {
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16),
  }
}

function clamp(n: number): number {
  return Math.min(255, Math.max(0, Math.round(n)))
}
