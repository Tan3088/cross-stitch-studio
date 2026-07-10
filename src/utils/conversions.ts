const INCHES_TO_CM = 2.54

/** Convert inches to centimetres. */
export function inchesToCm(inches: number): number {
  return inches * INCHES_TO_CM
}

/** Format a measurement for display with consistent rounding. */
export function formatMeasurement(value: number, unit: 'in' | 'cm'): string {
  const decimals = unit === 'in' ? 2 : 1
  return `${value.toFixed(decimals)} ${unit}`
}
