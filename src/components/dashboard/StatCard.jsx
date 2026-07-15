import Icon from '../ui/Icon'
import useInView from '../../hooks/useInView'
import useCountUp from '../../hooks/useCountUp'

// accent → the section-accent color used for the top rule + icon.
const ACCENT = {
  blue: { rule: 'bg-blue', text: 'text-blue-bright' },
  red: { rule: 'bg-red', text: 'text-red' },
  yellow: { rule: 'bg-yellow', text: 'text-yellow' },
}

/**
 * Stat card — flat, ruled. A 4px accent rule caps the card, a mono label sits
 * above an oversized tabular count-up value, with the glyph in the corner.
 * No glare, no tilt, no sparkline — elevation is the 1px outline only.
 */
export default function StatCard({ label, value, icon, accent = 'blue' }) {
  const [ref, inView] = useInView({ once: true, threshold: 0.3 })
  const animated = useCountUp(value, { active: inView, duration: 1200 })
  const a = ACCENT[accent] || ACCENT.blue

  return (
    <div ref={ref} className="card card-lift h-full p-5 pt-6">
      {/* Accent rule pinned to the top edge */}
      <span aria-hidden className={`absolute inset-x-0 top-0 h-1 ${a.rule}`} />

      <div className="flex items-start justify-between mb-6">
        <span className="mono-label">{label}</span>
        <Icon name={icon} size={16} className={a.text} />
      </div>

      <span className="block font-display font-black tabular-nums text-ink text-4xl leading-none">
        {animated}
      </span>
    </div>
  )
}
