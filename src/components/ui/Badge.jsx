const colorMap = {
  emerald: 'badge-emerald',
  violet: 'badge-violet',
  amber: 'badge-amber',
  accent: 'badge-accent',
  surface: 'badge-surface',
}

const dotColorMap = {
  emerald: 'bg-emerald-400',
  violet: 'bg-violet-400',
  amber: 'bg-amber-400',
  accent: 'bg-accent-400',
  surface: 'bg-surface-400',
}

export default function Badge({ children, color = 'surface', dot = false, className = '' }) {
  return (
    <span className={`${colorMap[color]} ${className}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColorMap[color]} mr-1.5`} />}
      {children}
    </span>
  )
}
