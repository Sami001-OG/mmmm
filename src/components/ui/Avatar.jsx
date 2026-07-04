export default function Avatar({ initials, src, size = 'md', status, className = '' }) {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-lg',
    xl: 'w-20 h-20 text-2xl',
  }

  const dotSizes = {
    sm: 'w-2.5 h-2.5 right-0 bottom-0',
    md: 'w-3 h-3 right-0 bottom-0',
    lg: 'w-3.5 h-3.5 right-0.5 bottom-0.5',
    xl: 'w-4 h-4 right-0.5 bottom-0.5',
  }

  return (
    <div className={`relative inline-flex shrink-0 ${className}`}>
      {src ? (
        <img
          src={src}
          alt={initials}
          className={`${sizes[size]} rounded-xl object-cover border border-surface-600/20`}
        />
      ) : (
        <div
          className={`${sizes[size]} rounded-xl bg-gradient-to-br from-accent-400/20 to-violet-400/20 border border-accent-400/20 flex items-center justify-center font-semibold text-accent-300 select-none`}
        >
          {initials}
        </div>
      )}
      {status && (
        <span
          className={`absolute ${dotSizes[size]} rounded-full border-2 border-surface ring-1 ring-surface-900 ${
            status === 'online' || status === 'green'
              ? 'bg-emerald-400'
              : status === 'away' || status === 'amber'
              ? 'bg-amber-400'
              : 'bg-surface-500'
          }`}
        />
      )}
    </div>
  )
}
