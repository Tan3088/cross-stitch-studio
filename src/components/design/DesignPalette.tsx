import { THREAD_COLORS } from '../../constants/colors'

interface DesignPaletteProps {
  activeColorId: string
  onColorChange: (id: string) => void
}

/** Compact thread colour palette for painting stitches. */
export function DesignPalette({ activeColorId, onColorChange }: DesignPaletteProps) {
  return (
    <div
      className="flex flex-wrap gap-2"
      role="radiogroup"
      aria-label="Thread colour palette"
    >
      {THREAD_COLORS.map((color) => {
        const selected = activeColorId === color.id
        return (
          <button
            key={color.id}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={color.name}
            title={color.name}
            onClick={() => onColorChange(color.id)}
            className={`h-11 w-11 rounded-xl border-2 transition-transform active:scale-95 ${
              selected
                ? 'border-stitch-500 ring-2 ring-stitch-500/40 scale-110'
                : 'border-stitch-200 hover:border-stitch-400 dark:border-stitch-600'
            }`}
            style={{ backgroundColor: color.hex }}
          />
        )
      })}
    </div>
  )
}
