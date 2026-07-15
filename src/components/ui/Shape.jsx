// Functional Bauhaus shapes — circle (data), square (work), triangle (action).
// Kept as one component so the three-shape grammar is used, never invented ad hoc.

export function Circle({ size = 8, color = 'currentColor', className = '', filled = true, stroke = 2 }) {
  return (
    <span
      className={`inline-block rounded-full ${className}`}
      style={{
        width: size,
        height: size,
        background: filled ? color : 'transparent',
        border: filled ? 'none' : `${stroke}px solid ${color}`,
      }}
      aria-hidden
    />
  )
}

export function Square({ size = 8, color = 'currentColor', className = '' }) {
  return (
    <span
      className={`inline-block ${className}`}
      style={{ width: size, height: size, background: color }}
      aria-hidden
    />
  )
}

// Right-pointing triangle via CSS borders (replaces chevron link arrows).
export function Triangle({ size = 8, color = 'currentColor', className = '', dir = 'right' }) {
  const h = size
  const w = Math.round(size * 0.85)
  const styles = {
    right: { borderLeft: `${w}px solid ${color}`, borderTop: `${h / 2}px solid transparent`, borderBottom: `${h / 2}px solid transparent` },
    down: { borderTop: `${w}px solid ${color}`, borderLeft: `${h / 2}px solid transparent`, borderRight: `${h / 2}px solid transparent` },
    up: { borderBottom: `${w}px solid ${color}`, borderLeft: `${h / 2}px solid transparent`, borderRight: `${h / 2}px solid transparent` },
  }
  return <span className={`inline-block ${className}`} style={{ width: 0, height: 0, ...styles[dir] }} aria-hidden />
}
