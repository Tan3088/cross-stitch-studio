import type { ColorOption } from '../types'

interface ColorSwatchPickerProps {
  id: string
  label: string
  colors: ColorOption[]
  selectedId: string
  onChange: (id: string) => void
}

/** Accessible colour swatch picker with keyboard support. */
export function ColorSwatchPicker({
  id,
  label,
  colors,
  selectedId,
  onChange,
}: ColorSwatchPickerProps) {
  return (
    <fieldset>
      <legend
        id={`${id}-legend`}
        className="mb-2 text-sm font-medium text-stitch-700 dark:text-stitch-300"
      >
        {label}
      </legend>
      <div
        className="grid grid-cols-4 gap-2 sm:grid-cols-6"
        role="radiogroup"
        aria-labelledby={`${id}-legend`}
      >
        {colors.map((color) => {
          const selected = selectedId === color.id
          const isLight = isLightColor(color.hex)

          return (
            <label
              key={color.id}
              className={`group relative flex min-h-11 cursor-pointer flex-col items-center gap-1 rounded-xl border p-1.5 transition-colors ${
                selected
                  ? 'border-stitch-500 ring-2 ring-stitch-500/30'
                  : 'border-stitch-200 hover:border-stitch-300 dark:border-stitch-700 dark:hover:border-stitch-600'
              }`}
              title={color.name}
            >
              <input
                type="radio"
                name={id}
                value={color.id}
                checked={selected}
                onChange={() => onChange(color.id)}
                className="sr-only"
                aria-label={color.name}
              />
              <span
                className="h-8 w-full rounded-lg border border-black/10 shadow-inner dark:border-white/10"
                style={{ backgroundColor: color.hex }}
                aria-hidden="true"
              />
              <span
                className={`w-full truncate text-center text-[10px] leading-tight sm:text-xs ${
                  selected
                    ? 'font-semibold text-stitch-700 dark:text-stitch-200'
                    : 'text-stitch-500 dark:text-stitch-400'
                }`}
              >
                {color.name}
              </span>
              {selected && (
                <span
                  className={`absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-stitch-500 text-[10px] ${
                    isLight ? 'text-stitch-900' : 'text-white'
                  }`}
                  aria-hidden="true"
                >
                  ✓
                </span>
              )}
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}

/** Determine if a hex colour is perceptually light (for contrast on checkmarks). */
function isLightColor(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.6
}
