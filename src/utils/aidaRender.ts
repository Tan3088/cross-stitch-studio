import { findColorById, THREAD_COLORS } from '../constants/colors'

export type FabricWeave = 'mono' | 'aida'

interface DrawFabricOptions {
  ctx: CanvasRenderingContext2D
  cols: number
  rows: number
  cellSize: number
  offsetX: number
  offsetY: number
  fabricHex: string
  weave?: FabricWeave
}

/** Draw fabric weave: open mono canvas mesh or Aida blocks. */
export function drawFabricMesh({
  ctx,
  cols,
  rows,
  cellSize,
  offsetX,
  offsetY,
  fabricHex,
  weave = 'aida',
}: DrawFabricOptions): void {
  if (weave === 'mono') {
    drawMonoCanvas({ ctx, cols, rows, cellSize, offsetX, offsetY, fabricHex })
    return
  }
  drawAidaFabric({ ctx, cols, rows, cellSize, offsetX, offsetY, fabricHex })
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
}: Omit<DrawFabricOptions, 'weave'>): void {
  const { r, g, b } = hexToRgb(fabricHex)
  const base = fabricHex
  const blockLight = `rgb(${clamp(r + 12)}, ${clamp(g + 12)}, ${clamp(b + 10)})`
  const blockShadow = `rgba(${clamp(r - 35)}, ${clamp(g - 35)}, ${clamp(b - 30)}, 0.45)`
  const holeColor = `rgba(${clamp(r - 55)}, ${clamp(g - 55)}, ${clamp(b - 50)}, 0.55)`

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const px = offsetX + x * cellSize
      const py = offsetY + y * cellSize

      ctx.fillStyle = base
      ctx.fillRect(px, py, cellSize, cellSize)

      const inset = Math.max(1, cellSize * 0.12)
      ctx.fillStyle = blockLight
      ctx.fillRect(px + inset, py + inset, cellSize - inset * 2, cellSize - inset * 2)

      ctx.fillStyle = blockShadow
      ctx.fillRect(px + cellSize - inset, py + inset, inset, cellSize - inset * 2)
      ctx.fillRect(px + inset, py + cellSize - inset, cellSize - inset * 2, inset)

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

/** Open-weave mono / needlepoint canvas: single intersecting threads. */
function drawMonoCanvas({
  ctx,
  cols,
  rows,
  cellSize,
  offsetX,
  offsetY,
  fabricHex,
}: Omit<DrawFabricOptions, 'weave'>): void {
  const { r, g, b } = hexToRgb(fabricHex)
  const gap = `rgb(${clamp(r - 28)}, ${clamp(g - 28)}, ${clamp(b - 24)})`
  const thread = `rgb(${clamp(r + 18)}, ${clamp(g + 18)}, ${clamp(b + 16)})`
  const threadDark = `rgba(${clamp(r - 40)}, ${clamp(g - 40)}, ${clamp(b - 35)}, 0.55)`
  const threadW = Math.max(1.5, cellSize * 0.22)

  ctx.fillStyle = gap
  ctx.fillRect(offsetX, offsetY, cols * cellSize, rows * cellSize)

  for (let y = 0; y <= rows; y++) {
    const py = offsetY + y * cellSize
    ctx.fillStyle = threadDark
    ctx.fillRect(offsetX, py - threadW / 2 + 0.6, cols * cellSize, threadW)
    ctx.fillStyle = thread
    ctx.fillRect(offsetX, py - threadW / 2, cols * cellSize, threadW * 0.72)
  }
  for (let x = 0; x <= cols; x++) {
    const px = offsetX + x * cellSize
    ctx.fillStyle = threadDark
    ctx.fillRect(px - threadW / 2 + 0.6, offsetY, threadW, rows * cellSize)
    ctx.fillStyle = thread
    ctx.fillRect(px - threadW / 2, offsetY, threadW * 0.72, rows * cellSize)
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
  weave?: FabricWeave
}

/** Draw a cross / tent stitch. Mono canvas uses thicker yarn. */
export function drawAidaStitch({
  ctx,
  x,
  y,
  cellSize,
  offsetX,
  offsetY,
  colorHex,
  weave = 'aida',
}: DrawAidaStitchOptions): void {
  const px = offsetX + x * cellSize
  const py = offsetY + y * cellSize
  const pad = cellSize * (weave === 'mono' ? 0.08 : 0.12)
  const lineWidth = Math.max(2, cellSize * (weave === 'mono' ? 0.32 : 0.17))

  const { r, g, b } = hexToRgb(colorHex)
  const shadow = `rgba(${clamp(r - 40)}, ${clamp(g - 40)}, ${clamp(b - 40)}, 0.35)`

  ctx.strokeStyle = shadow
  ctx.lineWidth = lineWidth + 0.5
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(px + pad + 0.5, py + pad + 0.5)
  ctx.lineTo(px + cellSize - pad + 0.5, py + cellSize - pad + 0.5)
  ctx.moveTo(px + cellSize - pad + 0.5, py + pad + 0.5)
  ctx.lineTo(px + pad + 0.5, py + cellSize - pad + 0.5)
  ctx.stroke()

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
  weave?: FabricWeave
  /** Stitches per linear inch (4 for Mono, 9 for Aida). Defines 1×1 inch boxes. */
  stitchesPerInch?: number
}

/**
 * Draw working fabric area with clear 1×1 inch boxes.
 * Each inch box contains stitchesPerInch × stitchesPerInch crosses.
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
  weave = 'aida',
  stitchesPerInch = 9,
}: DrawAidaCanvasOptions): void {
  const totalCols = designWidth + marginStitches * 2
  const totalRows = designHeight + marginStitches * 2
  const canvasW = totalCols * cellSize
  const canvasH = totalRows * cellSize
  const inch = Math.max(1, Math.round(stitchesPerInch))

  ctx.fillStyle = '#E8DDD0'
  ctx.fillRect(0, 0, canvasW, canvasH)

  drawFabricMesh({
    ctx,
    cols: totalCols,
    rows: totalRows,
    cellSize,
    offsetX: 0,
    offsetY: 0,
    fabricHex,
    weave,
  })

  if (marginStitches > 0) {
    ctx.fillStyle = 'rgba(120, 100, 80, 0.06)'
    ctx.fillRect(0, 0, canvasW, marginStitches * cellSize)
    ctx.fillRect(0, (marginStitches + designHeight) * cellSize, canvasW, marginStitches * cellSize)
    ctx.fillRect(0, marginStitches * cellSize, marginStitches * cellSize, designHeight * cellSize)
    ctx.fillRect(
      (marginStitches + designWidth) * cellSize,
      marginStitches * cellSize,
      marginStitches * cellSize,
      designHeight * cellSize,
    )
  }

  const dx = marginStitches * cellSize
  const dy = marginStitches * cellSize

  // Checker tint for each 1×1 inch box so blocks read clearly
  drawInchBoxTint(ctx, dx, dy, designWidth, designHeight, cellSize, inch)

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
        weave,
      })
    }
  }

  // Always mark 1×1 inch boxes; stitch lines when grid is on
  drawInchAndStitchGrid(ctx, cellSize, marginStitches, designWidth, designHeight, inch, showGrid)
}

function drawInchBoxTint(
  ctx: CanvasRenderingContext2D,
  dx: number,
  dy: number,
  designWidth: number,
  designHeight: number,
  cellSize: number,
  stitchesPerInch: number,
) {
  const inchPx = stitchesPerInch * cellSize
  for (let by = 0; by * stitchesPerInch < designHeight; by++) {
    for (let bx = 0; bx * stitchesPerInch < designWidth; bx++) {
      if ((bx + by) % 2 !== 0) continue
      const x0 = dx + bx * inchPx
      const y0 = dy + by * inchPx
      const w = Math.min(inchPx, dx + designWidth * cellSize - x0)
      const h = Math.min(inchPx, dy + designHeight * cellSize - y0)
      ctx.fillStyle = 'rgba(90, 70, 50, 0.07)'
      ctx.fillRect(x0, y0, w, h)
    }
  }
}

function drawInchAndStitchGrid(
  ctx: CanvasRenderingContext2D,
  cellSize: number,
  marginStitches: number,
  designWidth: number,
  designHeight: number,
  stitchesPerInch: number,
  showStitchGrid: boolean,
) {
  const dx = marginStitches * cellSize
  const dy = marginStitches * cellSize
  const dw = designWidth * cellSize
  const dh = designHeight * cellSize

  // Per-stitch grid inside each inch (shows 4×4 or 9×9)
  if (showStitchGrid && cellSize >= 6) {
    ctx.strokeStyle = 'rgba(70, 55, 40, 0.22)'
    ctx.lineWidth = Math.max(1, cellSize * 0.04)
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
  }

  // Bold 1×1 inch box outlines
  ctx.strokeStyle = 'rgba(40, 30, 20, 0.85)'
  ctx.lineWidth = Math.max(2, Math.min(4, cellSize * 0.12))
  ctx.beginPath()
  for (let x = 0; x <= designWidth; x += stitchesPerInch) {
    const px = dx + x * cellSize + 0.5
    ctx.moveTo(px, dy)
    ctx.lineTo(px, dy + dh)
  }
  // Right edge if design width is not an exact multiple of an inch
  if (designWidth % stitchesPerInch !== 0) {
    const px = dx + designWidth * cellSize + 0.5
    ctx.moveTo(px, dy)
    ctx.lineTo(px, dy + dh)
  }
  for (let y = 0; y <= designHeight; y += stitchesPerInch) {
    const py = dy + y * cellSize + 0.5
    ctx.moveTo(dx, py)
    ctx.lineTo(dx + dw, py)
  }
  if (designHeight % stitchesPerInch !== 0) {
    const py = dy + designHeight * cellSize + 0.5
    ctx.moveTo(dx, py)
    ctx.lineTo(dx + dw, py)
  }
  ctx.stroke()

  // Outer working-area frame
  ctx.strokeStyle = 'rgba(90, 60, 40, 0.9)'
  ctx.lineWidth = Math.max(2.5, cellSize * 0.1)
  ctx.strokeRect(dx + 0.5, dy + 0.5, dw - 1, dh - 1)

  // Center guides (chart style)
  const midX = dx + Math.floor(designWidth / 2) * cellSize + 0.5
  const midY = dy + Math.floor(designHeight / 2) * cellSize + 0.5
  ctx.strokeStyle = 'rgba(190, 60, 60, 0.55)'
  ctx.lineWidth = Math.max(1, cellSize * 0.04)
  ctx.beginPath()
  ctx.moveTo(midX, dy)
  ctx.lineTo(midX, dy + dh)
  ctx.moveTo(dx, midY)
  ctx.lineTo(dx + dw, midY)
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
