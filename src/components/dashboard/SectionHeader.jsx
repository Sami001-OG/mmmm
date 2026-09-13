import Icon from '../ui/Icon'

/**
 * Section header — type-as-architecture. Oversized ghost index numeral behind
 * a lowercase display title, a mono description, and an optional accent-link
 * action. No HUD brackets, no animated ticks — flat Dessau grammar.
 */
export default function SectionHeader({ title, description, action, index }) {
  const padded = typeof index === 'number' ? String(index).padStart(2, '0') : null

  return (
    <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
      <div className="relative min-w-0">
        {padded && (
          <span
            aria-hidden
            className="section-index absolute -top-7 -left-1 text-[76px] leading-none"
          >
            {padded}
          </span>
        )}
        <div className="relative">
          <div className="flex items-center gap-3">
            <span className="h-6 w-1 bg-yellow shrink-0" aria-hidden />
            <h2 className="h2">{title}</h2>
          </div>
          {description && <p className="font-mono text-[12px] normal-case tracking-normal text-ink-dim mt-2 ml-4">{description}</p>}
        </div>
      </div>

      {action && (
        <a
          href={action.href}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-ghost shrink-0"
        >
          <span>{action.label}</span>
          <Icon name="arrowUpRight" size={13} />
        </a>
      )}
    </div>
  )
}
