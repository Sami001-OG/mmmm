import { Link } from 'react-router-dom'

// Real 404 — prerendered to dist/404.html so unknown URLs return an honest
// page instead of a soft-200 Dashboard snapshot. Pure Bauhaus shapes.
export default function NotFound() {
  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-6">
      <div className="w-full max-w-lg">
        <div className="flex items-center gap-4 mb-8" aria-hidden>
          <span className="w-6 h-6 rounded-full bg-blue" />
          <span className="w-6 h-6 bg-red" />
          <span
            className="w-0 h-0"
            style={{
              borderLeft: '13px solid #F5C518',
              borderTop: '11px solid transparent',
              borderBottom: '11px solid transparent',
            }}
          />
        </div>

        <p className="mono-label text-red mb-3">error // 404</p>
        <h1 className="display mb-4">page not found</h1>
        <p className="text-ink-dim mb-8 max-w-sm">
          The route you requested doesn&apos;t exist. It may have moved, or never
          existed at all.
        </p>

        <Link to="/" className="btn-yellow">
          <span>back to portfolio</span>
          <span className="shape-tri" />
        </Link>
      </div>
    </div>
  )
}
