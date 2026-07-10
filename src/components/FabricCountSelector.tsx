import type { FabricCount } from '../types'
import { FABRIC_COUNTS } from '../constants/fabricCounts'

interface FabricCountSelectorProps {
  value: FabricCount
  onChange: (value: FabricCount) => void
}

/** Grid of fabric count options (stitches per inch). */
export function FabricCountSelector({ value, onChange }: FabricCountSelectorProps) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium text-stitch-700 dark:text-stitch-300">
        Fabric count
        <span className="ml-1 font-normal text-stitch-500 dark:text-stitch-400">
          (stitches per inch)
        </span>
      </legend>
      <div
        className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-9"
        role="radiogroup"
        aria-label="Fabric count"
      >
        {FABRIC_COUNTS.map((count) => {
          const selected = value === count
          return (
            <label
              key={count}
              className={`flex min-h-11 cursor-pointer items-center justify-center rounded-xl border text-sm font-semibold transition-colors ${
                selected
                  ? 'border-stitch-500 bg-stitch-500 text-white shadow-sm'
                  : 'border-stitch-200 bg-white text-stitch-700 hover:border-stitch-300 hover:bg-stitch-50 dark:border-stitch-700 dark:bg-stitch-800 dark:text-stitch-200 dark:hover:border-stitch-600 dark:hover:bg-stitch-700'
              }`}
            >
              <input
                type="radio"
                name="fabric-count"
                value={count}
                checked={selected}
                onChange={() => onChange(count)}
                className="sr-only"
              />
              {count}
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
