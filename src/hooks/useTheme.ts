import { useCallback, useEffect, useState } from 'react'
import type { Theme } from '../types'
import { loadTheme, saveTheme } from '../utils/storage'

function getSystemTheme(): Theme {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark')
}

/** Manages light/dark theme with local storage persistence. */
export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => loadTheme() ?? getSystemTheme())

  useEffect(() => {
    applyTheme(theme)
    saveTheme(theme)
  }, [theme])

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next)
  }, [])

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'))
  }, [])

  return { theme, setTheme, toggleTheme }
}
