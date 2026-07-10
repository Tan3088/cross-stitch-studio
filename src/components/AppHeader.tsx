import { ThemeToggle } from './ThemeToggle'

interface AppHeaderProps {
  theme: 'light' | 'dark'
  onToggleTheme: () => void
}

/** Application header with branding and theme toggle. */
export function AppHeader({ theme, onToggleTheme }: AppHeaderProps) {
  return (
    <header className="mb-6 flex items-start justify-between gap-4 sm:mb-8">
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-2">
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-stitch-500 text-white"
            aria-hidden="true"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              className="h-5 w-5"
            >
              <path d="M6 6l6 6M18 6l-6 6M6 18l6-6M18 18l-6-6" />
            </svg>
          </span>
          <h1 className="truncate text-xl font-bold tracking-tight text-stitch-900 sm:text-2xl dark:text-stitch-50">
            Cross Stitch Studio
          </h1>
        </div>
        <p className="text-sm text-stitch-600 dark:text-stitch-400">
          Create patterns on Aida fabric and see your finished size.
        </p>
      </div>
      <ThemeToggle theme={theme} onToggle={onToggleTheme} />
    </header>
  )
}
