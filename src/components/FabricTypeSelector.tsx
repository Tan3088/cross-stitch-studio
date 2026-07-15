import type { FabricCount } from '../types'
import { FABRIC_OPTIONS } from '../constants/fabricCounts'

interface FabricTypeSelectorProps {
  value: FabricCount
  onChange: (value: FabricCount) => void
}

/** Choose Fabric 1 (4×4 / in²) or Aida (9×9 / in²) with photo thumbnails. */
export function FabricTypeSelector({ value, onChange }: FabricTypeSelectorProps) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium text-stitch-700 dark:text-stitch-300">
        Fabric
      </legend>
      <div className="grid grid-cols-1 gap-3" role="radiogroup" aria-label="Fabric type">
        {FABRIC_OPTIONS.map((fabric) => {
          const selected = value === fabric.count
          return (
            <button
              key={fabric.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(fabric.count)}
              className={`flex w-full gap-3 overflow-hidden rounded-xl border p-2.5 text-left transition-colors touch-manipulation ${
                selected
                  ? 'border-stitch-500 shadow-sm ring-1 ring-stitch-500'
                  : 'border-stitch-200 hover:bg-stitch-50 dark:border-stitch-700 dark:hover:bg-stitch-800/40'
              }`}
            >
              <img
                src={fabric.photoSrc}
                alt=""
                className="h-20 w-24 shrink-0 rounded-lg object-cover bg-stitch-100"
                loading="lazy"
              />
              <span className="flex min-w-0 flex-1 flex-col justify-center gap-0.5">
                <span className="text-sm font-semibold text-stitch-800 dark:text-stitch-100">
                  {fabric.name}
                </span>
                <span className="text-xs text-stitch-500 dark:text-stitch-400">
                  Grid: 1×1 inch · Stitches: {fabric.count}×{fabric.count}
                </span>
                <span className="text-xs font-medium text-stitch-600 dark:text-stitch-300">
                  {fabric.crossesPerSquareInch} crosses per square inch
                </span>
                {selected && (
                  <span className="mt-0.5 text-xs font-semibold text-stitch-500">In use</span>
                )}
              </span>
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}
