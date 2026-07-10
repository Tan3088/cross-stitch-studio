import type { ColorOption } from '../types'

/** Fabric colour swatches commonly used in cross stitch. */
export const FABRIC_COLORS: ColorOption[] = [
  { id: 'white', name: 'White', hex: '#FFFFFF' },
  { id: 'antique-white', name: 'Antique White', hex: '#FAEBD7' },
  { id: 'ivory', name: 'Ivory', hex: '#FFFFF0' },
  { id: 'beige', name: 'Beige', hex: '#F5F5DC' },
  { id: 'natural', name: 'Natural', hex: '#E8DCC8' },
  { id: 'cream', name: 'Cream', hex: '#FFFDD0' },
  { id: 'light-grey', name: 'Light Grey', hex: '#D3D3D3' },
  { id: 'grey', name: 'Grey', hex: '#9E9E9E' },
  { id: 'charcoal', name: 'Charcoal', hex: '#4A4A4A' },
  { id: 'black', name: 'Black', hex: '#1A1A1A' },
  { id: 'blush', name: 'Blush', hex: '#F5D0C5' },
  { id: 'sage', name: 'Sage', hex: '#B2C9AD' },
]

/** Thread colour swatches for preview and selection. */
export const THREAD_COLORS: ColorOption[] = [
  { id: 'navy', name: 'Navy', hex: '#1B2A4A' },
  { id: 'crimson', name: 'Crimson', hex: '#B22234' },
  { id: 'forest', name: 'Forest Green', hex: '#2D5A27' },
  { id: 'gold', name: 'Gold', hex: '#C9A227' },
  { id: 'lavender', name: 'Lavender', hex: '#9B7EBD' },
  { id: 'teal', name: 'Teal', hex: '#2A7B7B' },
  { id: 'coral', name: 'Coral', hex: '#E07A5F' },
  { id: 'plum', name: 'Plum', hex: '#6B3A6B' },
  { id: 'sky', name: 'Sky Blue', hex: '#5B9BD5' },
  { id: 'chocolate', name: 'Chocolate', hex: '#5C3D2E' },
  { id: 'white', name: 'White', hex: '#F5F5F5' },
  { id: 'black', name: 'Black', hex: '#1A1A1A' },
]

export function findColorById(
  colors: ColorOption[],
  id: string,
): ColorOption {
  return colors.find((c) => c.id === id) ?? colors[0]
}
