import Badge from '../ui/Badge'
import Icon from '../ui/Icon'
import { langColors } from '../../data/langColors'

/**
 * Project card — flat, ruled, with an optional 16:9 image slot for manually
 * added projects (GitHub repos have none and fall back to a shape plate).
 * Featured cards carry a yellow top rule; the whole card lifts 4px on hover
 * with a 2px outline. No glare, tilt, or glow.
 */
export default function ProjectCard({ project, featured = false }) {
  const tags = project.tags || []
  const hasImage = Boolean(project.image)

  return (
    <a
      href={project.href}
      target="_blank"
      rel="noopener noreferrer"
      className="card card-lift group h-full p-0 flex flex-col overflow-hidden"
      aria-label={`Open ${project.title}`}
    >
      {featured && <span aria-hidden className="absolute inset-x-0 top-0 h-1 bg-yellow z-[1]" />}

      {/* Image / shape plate — 16:9 */}
      <div className="relative aspect-[16/9] bg-surface-hi border-b border-line overflow-hidden">
        {hasImage ? (
          <img
            src={project.image}
            alt=""
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-480 ease-machine group-hover:scale-[1.03]"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Bauhaus shape plate stand-in */}
            <svg viewBox="0 0 120 68" className="w-2/3 h-2/3 opacity-70" aria-hidden>
              <circle cx="38" cy="34" r="20" fill="#4C8DFF" />
              <rect x="60" y="14" width="34" height="34" fill="#E5484D" />
            </svg>
          </div>
        )}
      </div>

      <div className="flex flex-col flex-1 p-5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="h3 truncate group-hover:text-blue-bright transition-colors duration-240">
            {project.title}
          </h3>
          {project.status && (
            <Badge color={project.statusColor} dot>{project.status}</Badge>
          )}
        </div>

        <p className="text-ink-dim text-sm leading-relaxed mb-4 flex-1 line-clamp-2">
          {project.description}
        </p>

        {/* Tags — square chips, language color dot when known */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {tags.slice(0, 4).map((tag) => (
            <span key={tag} className="chip">
              {langColors[tag] && (
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: langColors[tag] }} />
              )}
              {tag}
            </span>
          ))}
          {tags.length > 4 && <span className="chip">+{tags.length - 4}</span>}
        </div>

        {/* Footer stats */}
        <div className="flex items-center gap-4 pt-3 border-t border-line mt-auto mono-data text-ink-faint">
          <span className="flex items-center gap-1.5">
            <Icon name="star" size={13} />
            <span className="tabular-nums">{project.stars ?? 0}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Icon name="fork" size={13} />
            <span className="tabular-nums">{project.forks ?? 0}</span>
          </span>
          <Icon name="arrowUpRight" size={14} className="ml-auto text-ink-dim group-hover:text-yellow transition-colors duration-240" />
        </div>
      </div>
    </a>
  )
}
