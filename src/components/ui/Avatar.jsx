// Flat circle avatar — 2px ring, no glow, no gradient. Status = filled dot.
export default function Avatar({ initials, src, size = 'md', status, className = '' }) {
  const sizes = {
    sm: 'w-9 h-9 text-xs',
    md: 'w-11 h-11 text-sm',
    lg: 'w-16 h-16 text-lg',
    xl: 'w-20 h-20 text-2xl',
  }
  const dotSizes = {
    sm: 'w-2.5 h-2.5',
    md: 'w-3 h-3',
    lg: 'w-3.5 h-3.5',
    xl: 'w-4 h-4',
  }
  const dotColor =
    status === 'online' || status === 'green'
      ? 'bg-live'
      : status === 'away' || status === 'amber'
      ? 'bg-yellow'
      : 'bg-line-strong'

  return (
    <div className={`relative inline-flex shrink-0 ${className}`}>
      {src ? (
        <img
          src={src}
          alt={initials}
          className={`${sizes[size]} rounded-full object-cover border-2 border-line-strong`}
        />
      ) : (
        <div
          className={`${sizes[size]} rounded-full bg-surface-hi border-2 border-line-strong flex items-center justify-center font-mono font-semibold text-ink select-none`}
        >
          {initials}
        </div>
      )}
      {status && (
        <span
          className={`absolute right-0 bottom-0 ${dotSizes[size]} rounded-full border-2 border-paper ${dotColor}`}
        />
      )}
    </div>
  )
}
