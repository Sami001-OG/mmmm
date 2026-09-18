import { useState, useEffect, useCallback, useRef } from 'react'

const STORAGE_KEY = 'portfolio_theme'
const THEMES = ['dark', 'paper']

// Browser-chrome color per theme — keep in sync with index.css tokens and
// the pre-paint script in index.html.
const THEME_COLOR = {
  dark: '#111014',
  paper: '#F4F1EA',
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
 * Theme state: Dessau Dark (default) and Paper (1923 white-poster
 * inversion). The sun/moon button toggles dark↔paper.
 */
export default function useTheme() {
  const [theme, setTheme] = useState(() => readStored() || 'dark')
  // Click origin for the pending toggle — feeds the circular reveal (see
  // index.css) so the theme grows outward from the button that was pressed.
  // Null when triggered from the keyboard/command palette; CSS falls back
  // to the top-right corner, where the toggle button lives.
  const originRef = useRef(null)

  useEffect(() => {
    const root = document.documentElement
    const applyTheme = () => {
      if (theme === 'dark') root.removeAttribute('data-theme')
      else root.setAttribute('data-theme', theme)
    }

    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const canViewTransition = typeof document.startViewTransition === 'function' && !reduceMotion

    let cleanupClassTimeout = null

    if (canViewTransition) {
      // Smooth path: a single circular reveal swapping two full-page
      // snapshots, instead of forcing a transition on every DOM node.
      // Far cheaper, and hides sub-systems (WebGL canvas, background
      // images) that can't animate their own colors.
      const { x, y } = originRef.current || {}
      root.style.setProperty('--vt-x', x != null ? `${x}px` : '100%')
      root.style.setProperty('--vt-y', y != null ? `${y}px` : '0%')
      originRef.current = null
      document.startViewTransition(applyTheme)
    } else {
      applyTheme()
      // Fallback for browsers without View Transitions: ease every
      // surface/border/ink color directly (see index.css). Cleaned up
      // after ~500ms so element transitions (hover lifts, etc.) resume
      // normally.
      root.classList.add('theme-anim')
      cleanupClassTimeout = setTimeout(() => root.classList.remove('theme-anim'), 500)
    }

    // Keep browser chrome (mobile address bar) in step with the theme.
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', THEME_COLOR[theme])
    try { localStorage.setItem(STORAGE_KEY, theme) } catch { /* private mode */ }

    return () => { if (cleanupClassTimeout) clearTimeout(cleanupClassTimeout) }
  }, [theme])

  // Reads the click position off the triggering event (if any) so the
  // reveal can grow from wherever the user actually pressed.
  const captureOrigin = (e) => {
    originRef.current = e && typeof e.clientX === 'number' ? { x: e.clientX, y: e.clientY } : null
  }

  const toggle = useCallback((e) => {
    captureOrigin(e)
    setTheme((t) => (t === 'paper' ? 'dark' : 'paper'))
  }, [])

  return {
    theme,
    isPaper: theme === 'paper',
    toggle,
  }
}
