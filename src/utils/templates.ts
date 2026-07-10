import type { CrossStitchDesign } from '../types'
import { createEmptyPattern } from './pattern'

export interface DesignTemplate {
  id: string
  name: string
  description: string
}

export const DESIGN_TEMPLATES: DesignTemplate[] = [
  { id: 'blank', name: 'Blank', description: 'Empty grid' },
  { id: 'heart', name: 'Heart', description: 'Simple heart shape' },
  { id: 'star', name: 'Star', description: 'Five-point star' },
  { id: 'border', name: 'Border', description: 'Decorative frame' },
]

/** Generate a pattern from a built-in template. */
export function applyTemplate(
  templateId: string,
  width: number,
  height: number,
  colorId: string,
): CrossStitchDesign {
  const design = createEmptyPattern(width, height)
  if (templateId === 'blank') return design

  const cx = Math.floor(width / 2)
  const cy = Math.floor(height / 2)

  if (templateId === 'heart') {
    paintHeart(design, cx, cy, Math.min(width, height) * 0.35, colorId)
  } else if (templateId === 'star') {
    paintStar(design, cx, cy, Math.min(width, height) * 0.38, colorId)
  } else if (templateId === 'border') {
    paintBorder(design, colorId)
  }

  return { ...design, updatedAt: Date.now() }
}

function setIfInBounds(
  design: CrossStitchDesign,
  x: number,
  y: number,
  colorId: string,
) {
  if (x >= 0 && y >= 0 && x < design.width && y < design.height) {
    design.pixels[y * design.width + x] = colorId
  }
}

/** Classic pixel heart shape. */
function paintHeart(
  design: CrossStitchDesign,
  cx: number,
  cy: number,
  size: number,
  colorId: string,
) {
  const r = Math.round(size)
  for (let y = -r; y <= r; y++) {
    for (let x = -r; x <= r; x++) {
      const nx = (x + 0.5) / r
      const ny = (y + 0.5) / r
      // Heart curve approximation
      const heart =
        Math.pow(nx * nx + ny * ny - 1, 3) - nx * nx * Math.pow(ny, 3) < 0.05
      if (heart && ny < 0.6) {
        setIfInBounds(design, cx + x, cy + y - Math.floor(r * 0.2), colorId)
      }
    }
  }
}

/** Five-point star. */
function paintStar(
  design: CrossStitchDesign,
  cx: number,
  cy: number,
  radius: number,
  colorId: string,
) {
  const points: [number, number][] = []
  for (let i = 0; i < 10; i++) {
    const angle = (Math.PI / 2) * -1 + (i * Math.PI) / 5
    const r = i % 2 === 0 ? radius : radius * 0.4
    points.push([cx + Math.cos(angle) * r, cy + Math.sin(angle) * r])
  }

  for (let y = 0; y < design.height; y++) {
    for (let x = 0; x < design.width; x++) {
      if (pointInPolygon(x + 0.5, y + 0.5, points)) {
        setIfInBounds(design, x, y, colorId)
      }
    }
  }
}

function pointInPolygon(x: number, y: number, polygon: [number, number][]): boolean {
  let inside = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0]
    const yi = polygon[i][1]
    const xj = polygon[j][0]
    const yj = polygon[j][1]
    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi
    if (intersect) inside = !inside
  }
  return inside
}

/** Simple rectangular border frame. */
function paintBorder(design: CrossStitchDesign, colorId: string) {
  const margin = Math.max(1, Math.floor(Math.min(design.width, design.height) * 0.08))
  for (let x = 0; x < design.width; x++) {
    for (let m = 0; m < margin; m++) {
      setIfInBounds(design, x, m, colorId)
      setIfInBounds(design, x, design.height - 1 - m, colorId)
    }
  }
  for (let y = 0; y < design.height; y++) {
    for (let m = 0; m < margin; m++) {
      setIfInBounds(design, m, y, colorId)
      setIfInBounds(design, design.width - 1 - m, y, colorId)
    }
  }
}
