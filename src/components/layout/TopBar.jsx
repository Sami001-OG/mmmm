import { useState, useEffect } from 'react'
import Icon from '../ui/Icon'
import Avatar from '../ui/Avatar'

// Mono UTC clock + blue data dot. Mounted-gate so SSR HTML has no time string
// (hydration parity — server can't know the clock).
function UTCClock() {
  const [now, setNow] = useState(null)
  useEffect(() => {
    const tick = () => setNow(new Date())
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])
  const label = now
    ? now.toISOString().slice(11, 19) + ' UTC'
    : '--:--:-- UTC'
  return (
    <span className="hidden sm:flex items-center gap-2 mono-data text-ink-dim">
      <span className="w-2 h-2 rounded-full bg-blue" />
      {label}
    </span>
  )
}

export default function TopBar({ profile, onMenuToggle, onSearchOpen, isPaper, onToggleTheme }) {
  return (
    <header className="sticky top-0 z-20 bg-paper border-b border-line">
      <div className="flex items-center justify-between px-4 sm:px-8 py-4">
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col leading-none">
            <span className="mono-label">portfolio // 2026</span>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-5">
          <UTCClock />

          {/* cmdk trigger — sharp 2px outline, square kbd chip */}
          <button
            onClick={onSearchOpen}
            className="group flex items-center gap-2 px-3 py-2 border border-line hover:border-line-strong transition-colors duration-240"
            aria-label="Open command palette"
          >
            <Icon name="search" size={14} className="text-ink-dim group-hover:text-ink transition-colors" />
            <span className="hidden sm:inline mono-label normal-case tracking-normal text-ink-dim">Search</span>
            <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 mono-data text-[10px] text-ink-dim bg-surface-hi border border-line">
              ⌘K
            </kbd>
          </button>

          {/* Paper-mode toggle — one keystroke inverts to 1923 white-poster. */}
          <button
            onClick={onToggleTheme}
            className="p-2 border border-line text-ink-dim hover:text-ink hover:border-line-strong transition-colors duration-240"
            aria-label={isPaper ? 'Switch to dark mode' : 'Switch to paper mode'}
            aria-pressed={isPaper}
            title={isPaper ? 'Dark mode' : 'Paper mode'}
          >
            <Icon name={isPaper ? 'moon' : 'sun'} size={16} />
          </button>

          <button
            onClick={onMenuToggle}
            className="p-1 rounded-full hover:opacity-80 transition-opacity duration-240"
            aria-label="Open menu"
            title="Menu"
          >
            <Avatar initials={profile.avatar} src={profile.avatarUrl} size="sm" status="online" />
          </button>
        </div>
      </div>
    </header>
  )
}
