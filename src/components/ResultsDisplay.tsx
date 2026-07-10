import type { CalculationResult } from '../types'
import { formatMeasurement } from '../utils/conversions'
import { Card } from './Card'

interface ResultsDisplayProps {
  results: CalculationResult
  fabricCount: number
}

interface ResultRowProps {
  label: string
  width: { inches: number; centimetres: number }
  height: { inches: number; centimetres: number }
}

function ResultRow({ label, width, height }: ResultRowProps) {
  return (
    <div className="rounded-xl bg-stitch-50 p-3 dark:bg-stitch-800/50">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-stitch-500 dark:text-stitch-400">
        {label}
      </p>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <div>
          <dt className="text-stitch-500 dark:text-stitch-400">Width</dt>
          <dd className="font-semibold text-stitch-900 dark:text-stitch-100">
            {formatMeasurement(width.inches, 'in')}
            <span className="mx-1 font-normal text-stitch-400">/</span>
            {formatMeasurement(width.centimetres, 'cm')}
          </dd>
        </div>
        <div>
          <dt className="text-stitch-500 dark:text-stitch-400">Height</dt>
          <dd className="font-semibold text-stitch-900 dark:text-stitch-100">
            {formatMeasurement(height.inches, 'in')}
            <span className="mx-1 font-normal text-stitch-400">/</span>
            {formatMeasurement(height.centimetres, 'cm')}
          </dd>
        </div>
      </dl>
    </div>
  )
}

/** Displays calculated design and fabric dimensions in inches and centimetres. */
export function ResultsDisplay({ results, fabricCount }: ResultsDisplayProps) {
  return (
    <Card id="results" title="Results" className="h-full">
      <div className="space-y-3" aria-live="polite" aria-atomic="true">
        <ResultRow
          label="Finished design size"
          width={results.designWidth}
          height={results.designHeight}
        />
        <ResultRow
          label="Required fabric size (with border)"
          width={results.fabricWidth}
          height={results.fabricHeight}
        />

        <div className="flex flex-wrap gap-x-4 gap-y-1 border-t border-stitch-200 pt-3 text-xs text-stitch-500 dark:border-stitch-700 dark:text-stitch-400">
          <p>
            Border margin:{' '}
            <span className="font-medium text-stitch-700 dark:text-stitch-300">
              {formatMeasurement(results.borderMargin.inches, 'in')} /{' '}
              {formatMeasurement(results.borderMargin.centimetres, 'cm')}
            </span>{' '}
            per side
          </p>
          <p>
            Fabric count:{' '}
            <span className="font-medium text-stitch-700 dark:text-stitch-300">
              {fabricCount} ct
            </span>
          </p>
        </div>
      </div>
    </Card>
  )
}
