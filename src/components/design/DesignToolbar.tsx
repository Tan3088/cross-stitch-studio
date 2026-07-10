import type { ReactNode } from 'react'
import type { DesignTool } from '../../types'

interface DesignToolbarProps {
  activeTool: DesignTool
  showGrid: boolean
  onToolChange: (tool: DesignTool) => void
  onToggleGrid: () => void
  onClear: () => void
  onExport: () => void
}

const TOOLS: { id: DesignTool; label: string; icon: ReactNode }[] = [
  {
    id: 'stitch',
    label: 'Stitch',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-5 w-5">
        <path d="M6 6l6 6M18 6l-6 6M6 18l6-6M18 18l-6-6" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'eraser',
    label: 'Eraser',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
        <path d="M20 20H7L3 16l9-9 7 7-4 4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'fill',
    label: 'Fill',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
        <path d="M19 11l-8-8-8.6 8.6a2 2 0 0 0 0 2.8l5.2 5.2a2 2 0 0 0 2.8 0L19 11z" />
        <path d="M5 21h14" strokeLinecap="round" />
      </svg>
    ),
  },
]

/** Tool selection bar for the design studio. */
export function DesignToolbar({
  activeTool,
  showGrid,
  onToolChange,
  onToggleGrid,
  onClear,
  onExport,
}: DesignToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div
        className="flex gap-1 rounded-xl border border-stitch-200 bg-stitch-50 p-1 dark:border-stitch-700 dark:bg-stitch-800/50"
        role="toolbar"
        aria-label="Drawing tools"
      >
        {TOOLS.map((tool) => {
          const selected = activeTool === tool.id
          return (
            <button
              key={tool.id}
              type="button"
              onClick={() => onToolChange(tool.id)}
              aria-pressed={selected}
              aria-label={tool.label}
              title={tool.label}
              className={`flex min-h-11 min-w-11 items-center justify-center rounded-lg transition-colors ${
                selected
                  ? 'bg-stitch-500 text-white'
                  : 'text-stitch-600 hover:bg-stitch-100 dark:text-stitch-300 dark:hover:bg-stitch-700'
              }`}
            >
              {tool.icon}
            </button>
          )
        })}
      </div>

      <button
        type="button"
        onClick={onToggleGrid}
        aria-pressed={showGrid}
        className={`min-h-11 rounded-xl border px-3 text-sm font-medium transition-colors ${
          showGrid
            ? 'border-stitch-500 bg-stitch-500/10 text-stitch-700 dark:text-stitch-200'
            : 'border-stitch-200 text-stitch-600 dark:border-stitch-700 dark:text-stitch-400'
        }`}
      >
        Grid
      </button>

      <button
        type="button"
        onClick={onExport}
        className="min-h-11 rounded-xl border border-stitch-200 px-3 text-sm font-medium text-stitch-700 transition-colors hover:bg-stitch-50 dark:border-stitch-700 dark:text-stitch-200 dark:hover:bg-stitch-800"
      >
        Export PNG
      </button>

      <button
        type="button"
        onClick={onClear}
        className="min-h-11 rounded-xl border border-stitch-200 px-3 text-sm font-medium text-stitch-600 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-700 dark:border-stitch-700 dark:text-stitch-400 dark:hover:border-red-800 dark:hover:bg-red-950/30 dark:hover:text-red-400"
      >
        Clear all
      </button>
    </div>
  )
}
