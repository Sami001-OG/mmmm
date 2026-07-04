import Badge from '../ui/Badge'
import Icon from '../ui/Icon'

const langColors = {
  TypeScript: '#3178c6',
  JavaScript: '#f7df1e',
  Python: '#3572a5',
  HTML: '#e34f26',
  CSS: '#563d7c',
  Rust: '#dea584',
  Go: '#00add8',
  Java: '#b07219',
  C: '#555555',
  'C++': '#f34b7d',
  Solidity: '#363636',
}

export default function ProjectCard({ project, featured = false }) {
  return (
    <div className={`card-hover group p-5 flex flex-col ${featured ? 'ring-1 ring-amber-400/15 bg-amber-400/[0.02]' : ''}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className={`w-9 h-9 rounded-xl ${featured ? 'bg-amber-400/10 border-amber-400/20' : 'bg-gradient-to-br from-accent-400/10 to-violet-400/10 border-accent-400/10'} border flex items-center justify-center shrink-0`}>
          <Icon name="code" size={16} className={featured ? 'text-amber-400' : 'text-accent-400'} />
        </div>
        <div className="flex items-center gap-2">
          {featured && (
            <span className="text-[10px] font-semibold text-amber-400/80 uppercase tracking-wider">Featured</span>
          )}
          <Badge color={project.statusColor} dot>
            {project.status}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <h3 className="text-sm font-semibold text-surface-100 mb-1.5 group-hover:text-accent-400 transition-colors">
        {project.title}
      </h3>
      <p className="text-xs text-surface-400 leading-relaxed mb-4 flex-1 line-clamp-2">
        {project.description}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {project.tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 text-[11px] font-mono text-surface-400 bg-surface-700/40 px-2 py-0.5 rounded-md border border-surface-600/20"
          >
            {langColors[tag] && (
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: langColors[tag] }} />
            )}
            {tag}
          </span>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center gap-4 pt-3 border-t border-surface-600/10 mt-auto">
        <div className="flex items-center gap-1.5 text-surface-500">
          <Icon name="star" size={13} />
          <span className="text-xs font-medium">{project.stars}</span>
        </div>
        <div className="flex items-center gap-1.5 text-surface-500">
          <Icon name="fork" size={13} />
          <span className="text-xs font-medium">{project.forks}</span>
        </div>
        <a
          href={project.href}
          className="ml-auto text-surface-500 hover:text-accent-400 transition-colors"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Icon name="external-link" size={14} />
        </a>
      </div>
    </div>
  )
}
