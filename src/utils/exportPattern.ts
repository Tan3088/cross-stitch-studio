import { findColorById, FABRIC_COLORS } from '../constants/colors'
import type { CrossStitchDesign } from '../types'
import { drawAidaCanvas, getAidaCanvasSize } from './aidaRender'

const CELL_SIZE = 14

/** Export full fabric piece with margins as PNG. */
export function exportPatternAsPng(
  design: CrossStitchDesign,
  fabricColorId: string,
  marginStitches: number,
  filename = 'cross-stitch-pattern.png',
): void {
  const fabricHex = findColorById(FABRIC_COLORS, fabricColorId).hex
  const { width, height } = getAidaCanvasSize(
    design.width,
    design.height,
    marginStitches,
    CELL_SIZE,
  )

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  drawAidaCanvas({
    ctx,
    pixels: design.pixels,
    designWidth: design.width,
    designHeight: design.height,
    marginStitches,
    cellSize: CELL_SIZE,
    fabricHex,
    showGrid: true,
  })

  canvas.toBlob((blob) => {
    if (!blob) return
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
  }, 'image/png')
}
