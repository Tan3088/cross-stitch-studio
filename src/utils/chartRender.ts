import { findColorById, THREAD_COLORS } from '../constants/colors'

/** Traditional cross stitch chart colours */
export const CHART_COLORS = {
  paper: '#F5E6E8',
  paperDark: '#2A2426',
  minorGrid: 'rgba(80, 70, 75, 0.22)',
  majorGrid: 'rgba(50, 40, 45, 0.55)',
  axisText: 'rgba(60, 50, 55, 0.7)',
  stitchOutline: 'rgba(0, 0, 0, 0.12)',
} as const

export const GRID_INTERVAL = 10
export const AXIS_SIZE = 28

interface DrawChartOptions {
  ctx: CanvasRenderingContext2D
  pixels: (string | null)[]
  width: number
  height: number
  cellSize: number
  fabricHex: string
  showGrid: boolean
  darkMode?: boolean
}

/** Draw a full cross stitch chart with 10-stitch major grid lines. */
export function drawCrossStitchChart({
  ctx,
  pixels,
  width,
  height,
  cellSize,
  fabricHex,
  showGrid,
  darkMode = false,
}: DrawChartOptions): void {
  const axis = AXIS_SIZE
  const gridW = width * cellSize
  const gridH = height * cellSize
  const totalW = gridW + axis
  const totalH = gridH + axis

  const paper = darkMode ? CHART_COLORS.paperDark : CHART_COLORS.paper

  // Chart paper background
  ctx.fillStyle = paper
  ctx.fillRect(0, 0, totalW, totalH)

  // Fabric / empty cell area
  ctx.fillStyle = fabricHex
  ctx.fillRect(axis, axis, gridW, gridH)

  // Draw filled stitch cells (solid squares like traditional patterns)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const colorId = pixels[y * width + x]
      if (!colorId) continue

      const px = axis + x * cellSize
      const py = axis + y * cellSize
      const hex = findColorById(THREAD_COLORS, colorId).hex

      ctx.fillStyle = hex
      ctx.fillRect(px + 0.5, py + 0.5, cellSize - 1, cellSize - 1)

      // Subtle stitch outline for definition
      ctx.strokeStyle = CHART_COLORS.stitchOutline
      ctx.lineWidth = 0.5
      ctx.strokeRect(px + 0.5, py + 0.5, cellSize - 1, cellSize - 1)

      // X stitch symbol when cells are large enough to see detail
      if (cellSize >= 10) {
        drawStitchSymbol(ctx, px, py, cellSize, hex)
      }
    }
  }

  if (showGrid) {
    drawGridLines(ctx, axis, gridW, gridH, width, height, cellSize, darkMode)
  }

  drawAxisLabels(ctx, axis, width, height, cellSize, darkMode)
}

function drawStitchSymbol(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  hex: string,
) {
  const pad = size * 0.18
  const lineWidth = Math.max(1, size * 0.09)
  const { r, g, b } = hexToRgb(hex)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  const factor = luminance > 0.55 ? 0.55 : 1.4
  const clamp = (n: number) => Math.min(255, Math.max(0, Math.round(n * factor)))

  ctx.strokeStyle = `rgb(${clamp(r)}, ${clamp(g)}, ${clamp(b)})`
  ctx.lineWidth = lineWidth
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(x + pad, y + pad)
  ctx.lineTo(x + size - pad, y + size - pad)
  ctx.moveTo(x + size - pad, y + pad)
  ctx.lineTo(x + pad, y + size - pad)
  ctx.stroke()
}

function drawGridLines(
  ctx: CanvasRenderingContext2D,
  axis: number,
  gridW: number,
  gridH: number,
  cols: number,
  rows: number,
  cellSize: number,
  darkMode: boolean,
) {
  // Minor grid: every cell
  ctx.strokeStyle = darkMode ? 'rgba(255,255,255,0.08)' : CHART_COLORS.minorGrid
  ctx.lineWidth = 0.5
  ctx.beginPath()
  for (let x = 0; x <= cols; x++) {
    const px = axis + x * cellSize + 0.5
    ctx.moveTo(px, axis)
    ctx.lineTo(px, axis + gridH)
  }
  for (let y = 0; y <= rows; y++) {
    const py = axis + y * cellSize + 0.5
    ctx.moveTo(axis, py)
    ctx.lineTo(axis + gridW, py)
  }
  ctx.stroke()

  // Major grid: every 10 stitches
  ctx.strokeStyle = darkMode ? 'rgba(255,255,255,0.2)' : CHART_COLORS.majorGrid
  ctx.lineWidth = 1.5
  ctx.beginPath()
  for (let x = 0; x <= cols; x += GRID_INTERVAL) {
    const px = axis + x * cellSize + 0.5
    ctx.moveTo(px, axis)
    ctx.lineTo(px, axis + gridH)
  }
  for (let y = 0; y <= rows; y += GRID_INTERVAL) {
    const py = axis + y * cellSize + 0.5
    ctx.moveTo(axis, py)
    ctx.lineTo(axis + gridW, py)
  }
  ctx.stroke()
}

function drawAxisLabels(
  ctx: CanvasRenderingContext2D,
  axis: number,
  cols: number,
  rows: number,
  cellSize: number,
  darkMode: boolean,
) {
  ctx.fillStyle = darkMode ? 'rgba(255,255,255,0.5)' : CHART_COLORS.axisText
  ctx.font = '10px system-ui, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  for (let x = GRID_INTERVAL; x < cols; x += GRID_INTERVAL) {
    const px = axis + x * cellSize
    ctx.fillText(String(x), px, axis / 2)
  }

  ctx.textAlign = 'right'
  for (let y = GRID_INTERVAL; y < rows; y += GRID_INTERVAL) {
    const py = axis + y * cellSize
    ctx.fillText(String(y), axis - 4, py)
  }
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  return {
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16),
  }
}

export function getChartDimensions(
  gridWidth: number,
  gridHeight: number,
  cellSize: number,
): { width: number; height: number; axis: number } {
  const axis = AXIS_SIZE
  return {
    width: gridWidth * cellSize + axis,
    height: gridHeight * cellSize + axis,
    axis,
  }
}
