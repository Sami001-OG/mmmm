import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'portfolio_theme'

// Reads the persisted theme, else null (SSR-safe — no window access on server).
function readStored() {
  if (typeof window === 'undefined') return null
  try { return localStorage.getItem(STORAGE_KEY) } catch { return null }
}

/**
 * Paper mode toggle. Persists to localStorage and reflects onto
 * <html data-theme>, which src/index.css keys the light token swap off.
 * Default is Dessau Dark; only an explicit 'paper' choice opts into light.
 */
export default function useTheme() {
  const [theme, setTheme] = useState(() => (readStored() === 'paper' ? 'paper' : 'dark'))

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'paper') root.setAttribute('data-theme', 'paper')
    else root.removeAttribute('data-theme')
    // Keep browser chrome (mobile address bar) in step with the theme.
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', theme === 'paper' ? '#F4F1EA' : '#111014')
    try { localStorage.setItem(STORAGE_KEY, theme) } catch { /* private mode */ }
  }, [theme])

  const toggle = useCallback(() => {
    setTheme((t) => (t === 'paper' ? 'dark' : 'paper'))
  }, [])

  return { theme, isPaper: theme === 'paper', toggle }
}
