import { useState, useEffect, useRef, useMemo } from 'react'
import Icon from './Icon'

// cmdk-style launcher — Dessau modal. Keyboard-first: ↑/↓ move, ↵ run, Esc close.
// SSR-safe: renders null until open, so server HTML never contains the dialog.
export default function CommandPalette({ open, onClose, navItems = [], social = [], onNavigate, isPaper = false, onToggleTheme }) {
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const inputRef = useRef(null)
  const dialogRef = useRef(null)

  // Flatten nav + social into a single command index. Sections scroll in-page;
  // links (CV, socials) open a URL. Kind drives the icon + shape marker.
  const commands = useMemo(() => {
    const sections = navItems.map((n) =>
      n.href
        ? { id: n.id, label: n.label, icon: n.icon, kind: 'link', href: n.href, hint: 'Open' }
        : { id: n.id, label: n.label, icon: n.icon, kind: 'section', hint: 'Jump to' }
    )
    const actions = [
      { id: 'toggle-theme', label: isPaper ? 'Switch to dark mode' : 'Switch to paper mode', icon: 'palette', kind: 'action', hint: 'Toggle', run: onToggleTheme },
    ]
    const links = social
      .filter((s) => s.href && s.href !== '#')
      .map((s) => ({ id: `social-${s.name}`, label: s.name, icon: s.icon, kind: 'external', href: s.href, hint: 'Open' }))
    return [...sections, ...actions, ...links]
  }, [navItems, social, isPaper, onToggleTheme])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return commands
    return commands.filter((c) => c.label.toLowerCase().includes(q))
  }, [commands, query])

  // Reset + focus when the dialog opens.
  useEffect(() => {
    if (open) {
      setQuery('')
      setActive(0)
      const t = setTimeout(() => inputRef.current?.focus(), 0)
      return () => clearTimeout(t)
    }
  }, [open])

  // Keep the highlighted row in range as the filter narrows.
  useEffect(() => {
    if (active >= filtered.length) setActive(Math.max(0, filtered.length - 1))
  }, [filtered.length, active])

  // Lock body scroll behind the modal.
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [open])

  const run = (cmd) => {
    if (!cmd) return
    onClose()
    if (cmd.kind === 'section') {
      onNavigate?.(cmd.id)
    } else if (cmd.kind === 'action') {
      cmd.run?.()
    } else if (cmd.kind === 'link') {
      window.location.assign(cmd.href)
    } else if (cmd.kind === 'external') {
      window.open(cmd.href, '_blank', 'noopener,noreferrer')
    }
  }

  const onKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((i) => (filtered.length ? (i + 1) % filtered.length : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((i) => (filtered.length ? (i - 1 + filtered.length) % filtered.length : 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      run(filtered[active])
    } else if (e.key === 'Tab') {
      // Single focusable input — trap Tab inside the dialog.
      e.preventDefault()
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[12vh] animate-fade-in"
      role="presentation"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div aria-hidden className="absolute inset-0 bg-sunken/80" />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        onKeyDown={onKeyDown}
        className="relative w-full max-w-lg bg-surface border border-line-strong"
      >
        {/* Query row */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-line">
          <Icon name="search" size={16} className="text-ink-faint shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setActive(0) }}
            placeholder="Search sections and links…"
            className="flex-1 bg-transparent outline-none text-ink placeholder:text-ink-faint text-sm"
            aria-label="Search commands"
            autoComplete="off"
            spellCheck={false}
          />
          <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 mono-data text-[10px] text-ink-faint bg-surface-hi border border-line">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <ul className="max-h-[52vh] overflow-y-auto py-2" role="listbox" aria-label="Commands">
          {filtered.length === 0 && (
            <li className="px-4 py-6 text-center mono-label">No matches</li>
          )}
          {filtered.map((cmd, i) => {
            const isActive = i === active
            const marker =
              cmd.kind === 'section' ? 'shape-dot bg-blue'
              : cmd.kind === 'action' ? 'shape-tri text-yellow'
              : cmd.kind === 'link' ? 'shape-tri'
              : 'shape-square bg-red'
            return (
              <li key={cmd.id} role="option" aria-selected={isActive}>
                <button
                  type="button"
                  onMouseEnter={() => setActive(i)}
                  onClick={() => run(cmd)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors duration-120 ${isActive ? 'bg-surface-hi' : ''}`}
                >
                  <span className={`${marker} shrink-0`} aria-hidden />
                  <Icon name={cmd.icon} size={15} className={isActive ? 'text-ink' : 'text-ink-dim'} />
                  <span className={`flex-1 text-sm ${isActive ? 'text-ink' : 'text-ink-dim'}`}>{cmd.label}</span>
                  <span className="mono-label">{cmd.hint}</span>
                </button>
              </li>
            )
          })}
        </ul>

        {/* Footer hint bar */}
        <div className="flex items-center gap-4 px-4 py-2.5 border-t border-line mono-data text-ink-faint text-[11px]">
          <span className="flex items-center gap-1.5"><kbd className="px-1 bg-surface-hi border border-line">↑↓</kbd> navigate</span>
          <span className="flex items-center gap-1.5"><kbd className="px-1 bg-surface-hi border border-line">↵</kbd> select</span>
          <span className="flex items-center gap-1.5"><kbd className="px-1 bg-surface-hi border border-line">esc</kbd> close</span>
        </div>
      </div>
    </div>
  )
}
