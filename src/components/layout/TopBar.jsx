import { useState } from 'react'
import Icon from '../ui/Icon'
import Avatar from '../ui/Avatar'

export default function TopBar({ profile, onMenuToggle, searchQuery, onSearchChange }) {
  const [searchFocused, setSearchFocused] = useState(false)

  return (
    <header className="sticky top-0 z-20 bg-surface-900/80 backdrop-blur-2xl border-b border-surface-600/10">
      <div className="flex items-center justify-between px-4 sm:px-8 py-3.5">
        {/* Left: Hamburger + Greeting */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuToggle}
            className="p-2 rounded-xl text-surface-400 hover:text-surface-200 hover:bg-surface-700/40 transition-all lg:hidden"
            aria-label="Toggle menu"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          </button>

          <div className="hidden sm:block">
            <h1 className="text-base font-semibold text-surface-100">
              Welcome back, <span className="text-accent-400">{profile.name?.split(' ')[0]}</span>
            </h1>
            <p className="text-xs text-surface-400 mt-0.5">{profile.bio}</p>
          </div>
        </div>

        {/* Right: Search + Actions */}
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border transition-all duration-200 ${
              searchFocused
                ? 'bg-surface-800 border-accent-400/30 shadow-glow'
                : 'bg-surface-800/50 border-surface-600/20 hover:border-surface-500/30'
            }`}
          >
            <Icon name="search" size={14} className="text-surface-400 shrink-0" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery || ''}
              onChange={(e) => onSearchChange?.(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className="bg-transparent text-sm text-surface-200 placeholder-surface-500 border-none outline-none w-28 sm:w-44 focus:w-32 sm:focus:w-56 transition-all duration-200"
            />
            <span className="text-[10px] text-surface-500 font-mono px-1.5 py-0.5 rounded bg-surface-700/50 border border-surface-600/20 hidden sm:inline">
              Ctrl+K
            </span>
          </div>

          <Avatar initials={profile.avatar} src={profile.avatarUrl} size="sm" status="online" className="ml-1" />
        </div>
      </div>
    </header>
  )
}
