// Square status chip — mono uppercase, section-accent border. Optional leading
// shape marker (square by default — chips are "work" metadata).
const styles = {
  blue: 'border-blue text-blue-bright',
  red: 'border-red text-red-bright',
  yellow: 'border-yellow text-yellow',
  live: 'border-live text-live',
  surface: 'border-line text-ink-dim',
}

const dotColor = {
  blue: '#4C8DFF',
  red: '#E5484D',
  yellow: '#F5C518',
  live: '#46A758',
  surface: '#A5A2A9',
}

// Legacy color names from the GitHub fetch script → new tokens.
const alias = { emerald: 'live', accent: 'blue', violet: 'blue', amber: 'yellow' }

export default function Badge({ children, color = 'surface', dot = false, className = '' }) {
  const key = alias[color] || color
  const style = styles[key] || styles.surface
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 font-mono text-[11px] font-medium uppercase tracking-label border ${style} ${className}`}
    >
      {dot && <span className="w-1.5 h-1.5" style={{ background: dotColor[key] || dotColor.surface }} />}
      {children}
    </span>
  )
}
