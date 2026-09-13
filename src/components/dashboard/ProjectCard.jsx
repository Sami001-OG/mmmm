import { useState } from 'react'
import Badge from '../ui/Badge'
import Icon from '../ui/Icon'
import { langColors } from '../../data/langColors'

/**
 * Project card — flat, ruled, with an optional 16:9 image slot for manually
 * added projects (GitHub repos have none and fall back to a shape plate).
 * The card itself is NOT a link: actions live in the two explicit buttons —
 * "Repo" (source on GitHub) and "Live" (deployed project). Featured cards
 * carry a yellow top rule. No glare, tilt, or glow.
 */
export default function ProjectCard({ project, featured = false }) {
  const tags = project.tags || []
  // Dead hotlinks (e.g. removed imgbb uploads) fall back to the shape plate.
  const [imgFailed, setImgFailed] = useState(false)
  const hasImage = Boolean(project.image) && !imgFailed

  // Manual projects: href = live link, repo = source. GitHub repos: href =
  // repo URL, homepage = live link (the repo's "Website" field on GitHub).
  const clean = (url) => (url && url !== '#' ? url : null)
  const repoUrl = project.manual ? clean(project.repo) : clean(project.href)
  const liveUrl = project.manual ? clean(project.href) : clean(project.homepage)

  return (
    <div className="card card-lift group h-full p-0 flex flex-col overflow-hidden">
      {featured && <span aria-hidden className="absolute inset-x-0 top-0 h-1 bg-yellow z-[1]" />}

      {/* Image / shape plate — 16:9 */}
      <div className="relative aspect-[16/9] bg-surface-hi border-b border-line overflow-hidden">
        {hasImage ? (
          <img
            src={project.image}
            alt=""
            loading="lazy"
            decoding="async"
            draggable={false}
            onError={() => setImgFailed(true)}
            className="w-full h-full object-cover transition-transform duration-240 ease-brake group-hover:scale-[1.03]"
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
          <h3 className="h3 truncate" title={project.title}>{project.title}</h3>
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

        {/* Stats row */}
        <div className="flex items-center gap-4 pt-3 border-t border-line mt-auto mono-data text-ink-faint">
          <span className="flex items-center gap-1.5">
            <Icon name="star" size={13} />
            <span className="tabular-nums">{project.stars ?? 0}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Icon name="fork" size={13} />
            <span className="tabular-nums">{project.forks ?? 0}</span>
          </span>
        </div>

        {/* Actions — the only clickable surfaces on the card */}
        {(repoUrl || liveUrl) && (
          <div className="grid grid-cols-2 gap-2 mt-3">
            {repoUrl && (
              <a
                href={repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center justify-center gap-1.5 px-2.5 py-2 border border-line font-mono text-[11px] font-medium uppercase tracking-label text-ink-dim hover:text-ink hover:border-line-strong active:scale-[0.97] transition-[transform,border-color,color] duration-240 ease-brake ${!liveUrl ? 'col-span-2' : ''}`}
                aria-label={`${project.title} — source repository`}
              >
                <Icon name="github" size={13} />
                <span>Repo</span>
              </a>
            )}
            {liveUrl && (
              <a
                href={liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center justify-center gap-1.5 px-2.5 py-2 border border-yellow/60 font-mono text-[11px] font-medium uppercase tracking-label text-yellow hover:bg-yellow hover:text-paper active:scale-[0.97] transition-[transform,background-color,color] duration-240 ease-brake ${!repoUrl ? 'col-span-2' : ''}`}
                aria-label={`${project.title} — live project`}
              >
                <Icon name="external-link" size={13} />
                <span>Live</span>
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
