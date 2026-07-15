import { useEffect, useRef, useState } from 'react'

/**
 * Parses a numeric value from any string — keeps non-digit prefix/suffix
 * stable so values like "1,234" or "128" animate cleanly.
 */
function parseNumber(value) {
  if (typeof value === 'number') return value
  const match = String(value).replace(/[^0-9.]/g, '')
  const n = Number(match)
  return Number.isFinite(n) ? n : 0
}

/**
 * Animates a number from 0 to the target using requestAnimationFrame
 * with an ease-out cubic curve. Only starts once `active` is true so
 * callers can tie it to scroll-into-view via useInView.
 */
export default function useCountUp(target, { active = true, duration = 1200, decimals = 0 } = {}) {
  const targetNum = parseNumber(target)
  const [value, setValue] = useState(0)
  const rafRef = useRef(0)
  const startRef = useRef(0)

  useEffect(() => {
    if (!active) return
    if (targetNum === 0) {
      setValue(0)
      return
    }

    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (reduce) {
      setValue(targetNum)
      return
    }

    startRef.current = 0
    const start = performance.now()

    const tick = (now) => {
      const elapsed = now - start
      const t = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      const next = targetNum * eased
      setValue(next)
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        setValue(targetNum)
      }
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [targetNum, active, duration])

  const display =
    decimals > 0
      ? value.toFixed(decimals)
      : Math.round(value).toLocaleString('en-US')

  return display
}
