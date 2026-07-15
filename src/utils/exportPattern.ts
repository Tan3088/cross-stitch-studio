import { findColorById, FABRIC_COLORS } from '../constants/colors'
import { findFabricByCount } from '../constants/fabricCounts'
import type { CrossStitchDesign } from '../types'
import { drawAidaCanvas, getAidaCanvasSize } from './aidaRender'

const SHARE_CELL_SIZE = 16

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/png')
  })
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

/** Build a PNG blob of the current design on fabric. */
export async function createFabricImageBlob(
  design: CrossStitchDesign,
  fabricColorId: string,
  marginStitches: number,
  fabricCount: number,
): Promise<{ blob: Blob; filename: string } | null> {
  const fabric = findFabricByCount(fabricCount)
  const fabricHex = findColorById(FABRIC_COLORS, fabricColorId).hex
  const { width, height } = getAidaCanvasSize(
    design.width,
    design.height,
    marginStitches,
    SHARE_CELL_SIZE,
  )

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  drawAidaCanvas({
    ctx,
    pixels: design.pixels,
    designWidth: design.width,
    designHeight: design.height,
    marginStitches,
    cellSize: SHARE_CELL_SIZE,
    fabricHex,
    showGrid: true,
    weave: fabric.weave,
    stitchesPerInch: fabric.count,
  })

  const blob = await canvasToBlob(canvas)
  if (!blob) return null

  const filename = `${fabric.id}-design.png`
  return { blob, filename }
}

/** Export pattern PNG (download). */
export function exportPatternAsPng(
  design: CrossStitchDesign,
  fabricColorId: string,
  marginStitches: number,
  fabricCount = 14,
  filename?: string,
): void {
  void (async () => {
    const result = await createFabricImageBlob(
      design,
      fabricColorId,
      marginStitches,
      fabricCount,
    )
    if (!result) return
    downloadBlob(result.blob, filename ?? result.filename)
  })()
}
