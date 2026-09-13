import useInView from '../../hooks/useInView'

/**
 * Skill bars — flat, ruled. Each proficiency is a square-cornered track with a
 * yellow fill that scales in from the left once in view (staggered). No
 * shimmer, no gradient, no "syncing" label — just the measure.
 */
export default function SkillBar({ category }) {
  const [ref, inView] = useInView({ once: true, threshold: 0.2 })

  return (
    <div ref={ref} className="card p-5 h-full">
      <div className="flex items-center gap-2 mb-5">
        <span className="shape-square bg-blue" aria-hidden />
        <span className="mono-label">{category.name}</span>
      </div>

      <div className="space-y-4">
        {category.skills.map((skill, i) => (
          <div key={skill.name}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-ink text-sm">{skill.name}</span>
              <span className="mono-data text-ink-faint tabular-nums">{skill.level}%</span>
            </div>
            <div className="relative h-1.5 bg-surface-hi overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-yellow origin-left transition-transform duration-480 ease-brake"
                style={{
                  width: `${skill.level}%`,
                  transform: inView ? 'scaleX(1)' : 'scaleX(0)',
                  transitionDelay: `${i * 70 + 40}ms`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
