import { useEffect, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Icon from '../ui/Icon'
import Avatar from '../ui/Avatar'
import Logo from '../brand/Logo'

export default function Sidebar({ profile, navItems, activeSection, onNavClick, mobileOpen, onMobileClose }) {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const railRef = useRef(null)
  const itemsRef = useRef(new Map())
  const [railStyle, setRailStyle] = useState({ opacity: 0, top: 0, height: 0 })

  // Active marker snaps between items on steps(1) — mechanical, not eased.
  useEffect(() => {
    const active = navItems.find((it) =>
      it.href ? location.pathname === it.href : activeSection === it.id
    )
    const node = active ? itemsRef.current.get(active.id) : null
    if (node) setRailStyle({ opacity: 1, top: node.offsetTop, height: node.offsetHeight })
    else setRailStyle((s) => ({ ...s, opacity: 0 }))
  }, [activeSection, location.pathname, navItems, collapsed])

  const handleClick = (item) => {
    if (item.href) {
      if (item.href.startsWith('/')) navigate(item.href)
      else window.open(item.href, '_blank')
    } else {
      onNavClick(item.id)
    }
    if (onMobileClose) onMobileClose()
  }

  const isActive = (item) =>
    item.href ? location.pathname === item.href : activeSection === item.id

  const sidebarContent = (
    <div className="flex-1 flex flex-col bg-sunken border-r border-line h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 pt-6 pb-5 border-b border-line">
        <Logo variant={collapsed ? 'icon' : 'full'} size="sm" collapsed={collapsed} />
        <button
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="ml-auto p-1.5 text-ink-dim hover:text-ink transition-colors duration-240 hidden lg:block"
        >
          <Icon name={collapsed ? 'chevronRight' : 'chevronDown'} size={14} />
        </button>
      </div>

      {/* Profile */}
      <div className="px-5 py-5 border-b border-line">
        <div className={`flex ${collapsed ? 'flex-col items-center' : 'items-center gap-4'}`}>
          <Avatar initials={profile.avatar} src={profile.avatarUrl} size={collapsed ? 'sm' : 'lg'} status="online" />
          {!collapsed && (
            <div className="min-w-0">
              <h2 className="font-display font-bold text-ink truncate text-[15px]">{profile.name}</h2>
              <p className="text-[13px] text-ink-dim truncate">{profile.title}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="w-2 h-2 rounded-full bg-live" />
                <span className="mono-label text-live normal-case tracking-normal">{profile.status}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav ref={railRef} className="relative flex-1 py-4 px-3 overflow-y-auto scrollbar-thin">
        {/* Sliding active marker: 2px yellow left rule spanning the item. */}
        <span
          aria-hidden
          className="pointer-events-none absolute left-0 w-0.5 bg-yellow transition-all duration-240 ease-snap"
          style={{ opacity: railStyle.opacity, top: railStyle.top, height: railStyle.height }}
        />
        {navItems.map((item) => {
          const active = isActive(item)
          return (
            <button
              key={item.id}
              ref={(el) => { if (el) itemsRef.current.set(item.id, el) }}
              onClick={() => handleClick(item)}
              title={collapsed ? item.label : undefined}
              className={`group relative z-[1] w-full text-left flex items-center gap-3 px-3 py-2.5 font-mono text-[13px] uppercase tracking-label transition-colors duration-240 ${
                active ? 'text-ink' : 'text-ink-dim hover:text-ink'
              } ${collapsed ? 'justify-center' : ''}`}
            >
              {/* 8x8 square marker snaps in on active */}
              <span
                aria-hidden
                className={`shrink-0 w-2 h-2 transition-all duration-120 ease-snap ${
                  active ? 'bg-yellow' : 'bg-line-strong group-hover:bg-ink-dim'
                }`}
              />
              {!collapsed && <span>{item.label}</span>}
            </button>
          )
        })}
      </nav>

      {/* Social + admin */}
      <div className={`px-4 py-4 border-t border-line ${collapsed ? 'flex flex-col items-center gap-3' : 'flex items-center justify-between'}`}>
        <div className={`flex items-center gap-1 ${collapsed ? 'flex-col' : ''}`}>
          {profile.social.filter((s) => s.href && s.href !== '#').map((s) => (
            <a
              key={s.name}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-ink-dim hover:text-yellow transition-colors duration-240"
              title={s.name}
              aria-label={s.name}
            >
              <Icon name={s.icon} size={16} />
            </a>
          ))}
        </div>
        <a
          href="/admin"
          className="p-2 text-ink-dim hover:text-yellow transition-colors duration-240"
          title="Admin"
          aria-label="Admin"
        >
          <Icon name="gear" size={16} />
        </a>
      </div>
    </div>
  )

  return (
    <>
      <aside
        className={`fixed left-0 top-0 h-screen z-30 flex-col transition-[width] duration-360 ease-machine hidden lg:flex ${
          collapsed ? 'w-[72px]' : 'w-[260px]'
        }`}
      >
        {sidebarContent}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-sunken/80 animate-fade-in" onClick={onMobileClose} />
          <aside className="relative w-[260px] h-full flex flex-col">{sidebarContent}</aside>
        </div>
      )}
    </>
  )
}
