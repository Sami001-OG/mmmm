// Systems board — the deployed projects as a status wall. Results come from
// build-time pings (scripts/fetch-github.mjs), so this is the state as of the
// last deploy, not a live probe: honest, and free of client-side CORS pain.
export default function SystemsBoard({ systems }) {
  if (!systems || systems.length === 0) return null
  const up = systems.filter((s) => s.ok).length

  return (
    <div className="card mt-4">
      <div className="flex items-center justify-between px-5 py-3 border-b border-line">
        <span className="mono-label">Systems</span>
        <span className="mono-data text-[11px] text-ink-faint">
          {up}/{systems.length} OPERATIONAL · CHECKED AT BUILD
        </span>
      </div>
      <ul className="divide-y divide-line">
        {systems.map((s) => (
          <li key={s.url}>
            <a
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 px-5 py-2.5"
            >
              <span
                aria-hidden
                className={`shape-dot shrink-0 ${s.ok ? 'bg-live' : 'bg-red'}`}
              />
              <span className="mono-data text-[12px] text-ink group-hover:text-blue-bright transition-colors duration-240 truncate">
                {s.name}
              </span>
              <span className="mono-data text-[11px] text-ink-faint truncate hidden sm:inline">
                {s.url.replace(/^https?:\/\//, '').replace(/\/$/, '')}
              </span>
              <span className="ml-auto mono-data text-[11px] text-ink-faint tabular-nums shrink-0">
                {s.ok ? `LIVE · ${s.ms}MS` : `DOWN · ${s.status || 'ERR'}`}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
