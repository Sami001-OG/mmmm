import Badge from '../ui/Badge'

export default function TimelineItem({ experience }) {
  return (
    <div className="relative pl-8 pb-8 last:pb-0 group">
      {/* Timeline line */}
      <div className="absolute left-[7px] top-3 bottom-0 w-px bg-surface-600/20 last:hidden" />

      {/* Timeline dot */}
      <div className="absolute left-0 top-1.5 w-[15px] h-[15px] rounded-full border-2 border-accent-400/30 bg-surface-800 group-hover:border-accent-400/60 transition-colors">
        <div className="absolute inset-[3px] rounded-full bg-accent-400/60 group-hover:bg-accent-400 transition-colors" />
      </div>

      {/* Content */}
      <div className="card-hover p-5">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h3 className="text-sm font-semibold text-surface-100">{experience.role}</h3>
            <p className="text-xs text-accent-400 font-medium">{experience.company}</p>
          </div>
          <Badge color="surface">{experience.period}</Badge>
        </div>
        <p className="text-xs text-surface-400 mt-2 leading-relaxed">{experience.description}</p>

        {experience.highlights && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {experience.highlights.map((h, i) => (
              <span
                key={i}
                className="text-[11px] text-surface-400 bg-surface-700/40 px-2 py-0.5 rounded-md border border-surface-600/20"
              >
                {h}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
