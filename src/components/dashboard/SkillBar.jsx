export default function SkillBar({ category }) {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs font-semibold text-surface-300 uppercase tracking-wider">{category.name}</span>
      </div>
      <div className="space-y-3.5">
        {category.skills.map((skill) => (
          <div key={skill.name}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-surface-200">{skill.name}</span>
              <span className="text-[11px] font-mono text-surface-500">{skill.level}%</span>
            </div>
            <div className="h-1.5 bg-surface-700/60 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-accent-400/80 to-violet-400/80 transition-all duration-1000 ease-out"
                style={{ width: `${skill.level}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
