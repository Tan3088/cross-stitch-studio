import {
  MAX_DESIGN_DIMENSION,
  MIN_DESIGN_DIMENSION,
  type CrossStitchDesign,
} from '../types'

/** Clamp design dimensions to allowed range. */
export function clampDimension(value: number): number {
  return Math.min(MAX_DESIGN_DIMENSION, Math.max(MIN_DESIGN_DIMENSION, Math.round(value)))
}

/** Create an empty pattern grid. */
export function createEmptyPattern(width: number, height: number): CrossStitchDesign {
  const w = clampDimension(width)
  const h = clampDimension(height)
  return {
    width: w,
    height: h,
    pixels: Array.from({ length: w * h }, () => null),
    updatedAt: Date.now(),
  }
}

/** Resize pattern, preserving existing stitches in the top-left. */
export function resizePattern(
  design: CrossStitchDesign,
  newWidth: number,
  newHeight: number,
): CrossStitchDesign {
  const w = clampDimension(newWidth)
  const h = clampDimension(newHeight)
  const pixels: (string | null)[] = Array.from({ length: w * h }, () => null)

  for (let y = 0; y < Math.min(h, design.height); y++) {
    for (let x = 0; x < Math.min(w, design.width); x++) {
      pixels[y * w + x] = design.pixels[y * design.width + x] ?? null
    }
  }

  return { width: w, height: h, pixels, updatedAt: Date.now() }
}

export function getPixel(design: CrossStitchDesign, x: number, y: number): string | null {
  if (x < 0 || y < 0 || x >= design.width || y >= design.height) return null
  return design.pixels[y * design.width + x] ?? null
}

export function setPixel(
  design: CrossStitchDesign,
  x: number,
  y: number,
  colorId: string | null,
): CrossStitchDesign {
  if (x < 0 || y < 0 || x >= design.width || y >= design.height) return design
  const pixels = [...design.pixels]
  pixels[y * design.width + x] = colorId
  return { ...design, pixels, updatedAt: Date.now() }
}

/** Flood fill from (x, y) with the given thread colour ID. */
export function floodFill(
  design: CrossStitchDesign,
  x: number,
  y: number,
  colorId: string | null,
): CrossStitchDesign {
  if (x < 0 || y < 0 || x >= design.width || y >= design.height) return design

  const target = design.pixels[y * design.width + x] ?? null
  if (target === colorId) return design

  const pixels = [...design.pixels]
  const stack: [number, number][] = [[x, y]]
  const visited = new Set<number>()

  while (stack.length > 0) {
    const [cx, cy] = stack.pop()!
    const idx = cy * design.width + cx
    if (visited.has(idx)) continue
    if (cx < 0 || cy < 0 || cx >= design.width || cy >= design.height) continue
    if ((pixels[idx] ?? null) !== target) continue

    visited.add(idx)
    pixels[idx] = colorId

    stack.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1])
  }

  return { ...design, pixels, updatedAt: Date.now() }
}

/** Clear all stitches from the pattern. */
export function clearPattern(design: CrossStitchDesign): CrossStitchDesign {
  return {
    ...design,
    pixels: Array.from({ length: design.width * design.height }, () => null),
    updatedAt: Date.now(),
  }
}

/** Count how many stitches use each thread colour. */
export function countStitchesByColor(design: CrossStitchDesign): Map<string, number> {
  const counts = new Map<string, number>()
  for (const pixel of design.pixels) {
    if (pixel) {
      counts.set(pixel, (counts.get(pixel) ?? 0) + 1)
    }
  }
  return counts
}

export function getStitchCount(design: CrossStitchDesign): number {
  return design.pixels.filter((p) => p !== null).length
}
