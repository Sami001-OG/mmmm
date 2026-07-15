import LogoIcon from './LogoIcon'

export default function Logo({ variant = 'full', size = 'md', collapsed = false }) {
  const iconSizes = { sm: 26, md: 30, lg: 40 }

  if (variant === 'icon') {
    return <LogoIcon size={iconSizes[size]} className="shrink-0" />
  }

  return (
    <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
      <LogoIcon size={iconSizes[size]} />
      {!collapsed && (
        <div className="flex flex-col min-w-0 leading-none">
          <span className="font-display font-black lowercase text-ink text-base tracking-tightest">
            sami
          </span>
          <span className="mono-label mt-1">portfolio</span>
        </div>
      )}
    </div>
  )
}
