import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Icon from '../ui/Icon'
import Avatar from '../ui/Avatar'
import Logo from '../brand/Logo'

export default function Sidebar({ profile, navItems, activeSection, onNavClick, mobileOpen, onMobileClose }) {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const handleClick = (item) => {
    if (item.href) {
      if (item.href.startsWith('/')) navigate(item.href)
      else window.open(item.href, '_blank')
    } else {
      onNavClick(item.id)
    }
    if (onMobileClose) onMobileClose()
  }

  const isActive = (item) => {
    if (item.href) return location.pathname === item.href
    return activeSection === item.id
  }

  const sidebarContent = (
    <div className="flex-1 flex flex-col bg-surface-900/95 backdrop-blur-2xl border-r border-surface-600/20 h-full">
      {/* Logo area */}
      <div className="flex items-center gap-3 px-5 pt-6 pb-5 border-b border-surface-600/10">
        <Logo variant="icon" size="sm" />
        {!collapsed && (
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-semibold tracking-[0.15em] bg-clip-text text-transparent bg-gradient-to-r from-accent-300 to-violet-300">
              SAMI
            </span>
            <span className="text-[10px] text-surface-500 font-medium tracking-[0.08em] uppercase">
              Portfolio
            </span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto p-1.5 rounded-lg text-surface-500 hover:text-surface-300 hover:bg-surface-700/40 transition-colors hidden lg:block"
        >
          <Icon name={collapsed ? 'chevronRight' : 'chevronDown'} size={14} />
        </button>
      </div>

      {/* Profile */}
      <div className="px-4 py-5 border-b border-surface-600/10">
        <div className={`flex ${collapsed ? 'flex-col items-center' : 'items-center gap-4'}`}>
          <Avatar initials={profile.avatar} src={profile.avatarUrl} size={collapsed ? 'sm' : 'lg'} status="online" />
          {!collapsed && (
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-surface-100 truncate">{profile.name}</h2>
              <p className="text-xs text-surface-400 truncate">{profile.title}</p>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 relative">
                  <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-50" />
                </span>
                <span className="text-[11px] text-emerald-400/80 font-medium">{profile.status}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto scrollbar-thin">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleClick(item)}
            className={`nav-link w-full text-left ${
              isActive(item) ? 'nav-link-active' : 'nav-link-inactive'
            } ${collapsed ? 'justify-center px-3' : ''}`}
            title={collapsed ? item.label : undefined}
          >
            <Icon name={item.icon} size={18} />
            {!collapsed && <span>{item.label}</span>}
            {isActive(item) && !collapsed && (
              <span className="ml-auto w-1.5 h-1.5 rounded-full bg-accent-400" />
            )}
          </button>
        ))}
      </nav>

      {/* Social links */}
      <div className={`px-4 py-4 border-t border-surface-600/10 ${collapsed ? 'flex flex-col items-center gap-3' : ''}`}>
        {collapsed ? (
          <div className="flex flex-col items-center gap-3">
            {profile.social.slice(0, 2).map((s) => (
              <a key={s.name} href={s.href} className="text-surface-500 hover:text-accent-400 transition-colors" title={s.name}>
                <Icon name={s.icon} size={16} />
              </a>
            ))}
            <a href="/admin" className="text-surface-500 hover:text-accent-400 transition-colors" title="Admin">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
              </svg>
            </a>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {profile.social.map((s) => (
                <a key={s.name} href={s.href} className="p-2 rounded-lg text-surface-500 hover:text-accent-400 hover:bg-surface-700/30 transition-all" title={s.name}>
                  <Icon name={s.icon} size={16} />
                </a>
              ))}
            </div>
            <a
              href="/admin"
              className="p-2 rounded-lg text-surface-500 hover:text-accent-400 hover:bg-surface-700/30 transition-all"
              title="Admin"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
              </svg>
            </a>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen z-30 flex-col transition-all duration-300 ease-out hidden lg:flex ${
          collapsed ? 'w-[72px]' : 'w-[260px]'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-surface-950/60 backdrop-blur-sm" onClick={onMobileClose} />
          <aside className="relative w-[260px] h-full flex flex-col animate-slide-up">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  )
}
