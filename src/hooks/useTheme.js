import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'portfolio_theme'
const THEMES = ['dark', 'paper', 'blueprint']

// Browser-chrome color per theme — keep in sync with index.css tokens and
// the pre-paint script in index.html.
const THEME_COLOR = {
  dark: '#111014',
  paper: '#F4F1EA',
  blueprint: '#0E2842',
}

// Reads the persisted theme, else null (SSR-safe — no window access on server).
function readStored() {
  if (typeof window === 'undefined') return null
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    return THEMES.includes(v) ? v : null
  } catch { return null }
}

/**
 * Theme state: Dessau Dark (default), Paper (1923 white-poster inversion),
 * and Blueprint (construction-document mode with annotations). The sun/moon
 * button toggles dark↔paper; blueprint is entered via the footer nameplate,
 * the command palette, or ?theme=blueprint (handled pre-paint in index.html).
 */
export default function useTheme() {
  const [theme, setTheme] = useState(() => readStored() || 'dark')

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') root.removeAttribute('data-theme')
    else root.setAttribute('data-theme', theme)
    // Keep browser chrome (mobile address bar) in step with the theme.
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', THEME_COLOR[theme])
    try { localStorage.setItem(STORAGE_KEY, theme) } catch { /* private mode */ }
  }, [theme])

  const toggle = useCallback(() => {
    setTheme((t) => (t === 'paper' ? 'dark' : 'paper'))
  }, [])

  const toggleBlueprint = useCallback(() => {
    setTheme((t) => (t === 'blueprint' ? 'dark' : 'blueprint'))
  }, [])

  return {
    theme,
    isPaper: theme === 'paper',
    isBlueprint: theme === 'blueprint',
    toggle,
    toggleBlueprint,
  }
}
