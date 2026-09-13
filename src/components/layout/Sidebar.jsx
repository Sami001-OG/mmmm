import { useEffect, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Icon from '../ui/Icon'
import Avatar from '../ui/Avatar'
import Logo from '../brand/Logo'

export default function Sidebar({ profile, navItems, activeSection, onNavClick, mobileOpen, onMobileClose }) {
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
  }, [activeSection, location.pathname, navItems])

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

  // One builder, two layouts: the desktop icon rail (expanded=false) and the
  // mobile drawer (expanded=true, full labels). Never mounted at the same
  // time, so the rail marker refs stay unambiguous.
  const sidebarContent = (expanded) => (
    <div className="flex-1 flex flex-col bg-sunken border-r border-line h-full">
      {/* Logo */}
      <div className={`flex items-center border-b border-line ${expanded ? 'gap-3 px-5 pt-6 pb-5' : 'justify-center px-2 py-5'}`}>
        <Logo variant={expanded ? 'full' : 'icon'} size="sm" />
      </div>

      {/* Profile */}
      <div className={`border-b border-line ${expanded ? 'px-5 py-5' : 'py-4 flex justify-center'}`}>
        {expanded ? (
          <div className="flex items-center gap-4">
            <Avatar initials={profile.avatar} src={profile.avatarUrl} size="lg" status="online" />
            <div className="min-w-0">
              <h2 className="font-display font-bold text-ink truncate text-[15px]">{profile.name}</h2>
              <p className="text-[13px] text-ink-dim truncate">{profile.title}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="w-2 h-2 rounded-full bg-live" />
                <span className="mono-label text-live normal-case tracking-normal">{profile.status}</span>
              </div>
            </div>
          </div>
        ) : (
          <Avatar initials={profile.avatar} src={profile.avatarUrl} size="sm" status="online" />
        )}
      </div>

      {/* Navigation */}
      <nav ref={railRef} className={`relative flex-1 overflow-y-auto scrollbar-thin ${expanded ? 'py-4 px-3' : 'py-4'}`}>
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
              title={expanded ? undefined : item.label}
              aria-label={expanded ? undefined : item.label}
              className={`group relative z-[1] w-full text-left flex items-center font-mono text-[13px] uppercase tracking-label active:scale-[0.98] transition-[transform,color] duration-240 ease-brake ${
                active ? 'text-ink' : 'text-ink-dim hover:text-ink'
              } ${expanded ? 'gap-3 px-3 py-2.5' : 'justify-center px-2 py-3'}`}
            >
              {expanded ? (
                <>
                  {/* 8x8 square marker snaps in on active */}
                  <span
                    aria-hidden
                    className={`shrink-0 w-2 h-2 transition-all duration-120 ease-snap ${
                      active ? 'bg-yellow' : 'bg-line-strong group-hover:bg-ink-dim'
                    }`}
                  />
                  <span>{item.label}</span>
                </>
              ) : (
                <Icon
                  name={item.icon}
                  size={18}
                  className={active ? 'text-yellow' : 'text-ink-dim group-hover:text-ink transition-colors duration-240'}
                />
              )}
            </button>
          )
        })}
      </nav>

      {/* Social + admin */}
      <div className={`border-t border-line ${expanded ? 'px-4 py-4 flex items-center justify-between' : 'py-4 flex flex-col items-center gap-3'}`}>
        <div className={`flex items-center gap-1 ${expanded ? '' : 'flex-col'}`}>
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
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen z-30 flex-col w-[72px]">
        {sidebarContent(false)}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-sunken/80 animate-fade-in" onClick={onMobileClose} />
          <aside className="relative w-[260px] h-full flex flex-col">{sidebarContent(true)}</aside>
        </div>
      )}
    </>
  )
}
