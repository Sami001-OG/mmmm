import Icon from '../ui/Icon'

/**
 * Mobile bottom icon nav — the desktop rail's mirror, pinned to the bottom
 * edge below lg. Icon-only cells, active section in yellow with a 2px top
 * marker; honors the iOS safe area. Sections only — links (CV) stay in the
 * avatar menu drawer.
 */
export default function MobileNav({ navItems = [], activeSection, onNavClick }) {
  const sections = navItems.filter((it) => !it.href)

  return (
    <nav
      aria-label="Sections"
      className="lg:hidden fixed inset-x-0 bottom-0 z-30 bg-sunken border-t border-line"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className={`grid ${sections.length === 7 ? 'grid-cols-7' : 'grid-cols-5'} divide-x divide-line`}>
        {sections.map((item) => {
          const active = activeSection === item.id
          return (
            <button
              key={item.id}
              onClick={() => onNavClick?.(item.id)}
              aria-label={item.label}
              aria-current={active ? 'true' : undefined}
              title={item.label}
              className={`relative flex items-center justify-center py-3 transition-colors duration-240 ${
                active ? 'text-yellow' : 'text-ink-dim hover:text-ink'
              }`}
            >
              {active && (
                <span aria-hidden className="absolute top-0 inset-x-3 h-0.5 bg-yellow" />
              )}
              <Icon name={item.icon} size={20} />
            </button>
          )
        })}
      </div>
    </nav>
  )
}
