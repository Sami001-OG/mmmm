import LogoIcon from './LogoIcon'

export default function Logo({ variant = 'full', size = 'md', collapsed = false }) {
  const iconSizes = { sm: 28, md: 36, lg: 44 }
  const textSizes = { sm: 'text-xs', md: 'text-sm', lg: 'text-base' }

  if (variant === 'icon') {
    return (
      <LogoIcon size={iconSizes[size]} className="shrink-0" />
    )
  }

  return (
    <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
      <div className="relative shrink-0">
        <LogoIcon size={iconSizes[size]} />
        <div className="absolute -inset-1 bg-gradient-to-br from-accent-400/10 to-violet-400/10 rounded-xl blur-sm -z-10" />
      </div>
      {!collapsed && (
        <div className="flex flex-col min-w-0">
          <span className={`${textSizes[size]} font-bold tracking-[0.15em] bg-clip-text text-transparent bg-gradient-to-r from-accent-300 to-violet-300`}>
            SAMI
          </span>
          <span className="text-[10px] text-surface-500 font-medium tracking-[0.08em] uppercase -mt-0.5">
            Portfolio
          </span>
        </div>
      )}
    </div>
  )
}
