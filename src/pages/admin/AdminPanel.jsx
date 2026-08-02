import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Logo from '../../components/brand/Logo'
import ProfileEditor from './sections/ProfileEditor'
import ProjectsEditor from './sections/ProjectsEditor'
import ExperienceEditor from './sections/ExperienceEditor'
import EducationEditor from './sections/EducationEditor'
import SkillsEditor from './sections/SkillsEditor'
import SocialEditor from './sections/SocialEditor'

const sections = [
  { id: 'profile', label: 'Profile' },
  { id: 'projects', label: 'Projects' },
  { id: 'experience', label: 'Experience' },
  { id: 'education', label: 'Education' },
  { id: 'skills', label: 'Skills' },
  { id: 'social', label: 'Social Links' },
]

// The localStorage draft keys bundled into the published config object.
const DRAFT_KEYS = {
  profile: 'portfolio_draft_profile',
  social: 'portfolio_draft_social',
  experience: 'portfolio_draft_experience',
  education: 'portfolio_draft_education',
  skills: 'portfolio_draft_skills',
  projects: 'portfolio_draft_projects',
  repoImages: 'portfolio_draft_repo_images',
}

function collectDrafts() {
  const bundle = {}
  let any = false
  for (const [name, key] of Object.entries(DRAFT_KEYS)) {
    try {
      const raw = localStorage.getItem(key)
      if (raw) { bundle[name] = JSON.parse(raw); any = true }
    } catch { /* skip malformed */ }
  }
  return any ? bundle : null
}

export default function AdminPanel() {
  const navigate = useNavigate()
  const [active, setActive] = useState('profile')
  const [notice, setNotice] = useState('')
  const [noticeKind, setNoticeKind] = useState('ok')
  const [publishing, setPublishing] = useState(false)

  useEffect(() => {
    if (!sessionStorage.getItem('admin_auth')) navigate('/admin', { replace: true })
  }, [navigate])

  const flash = (msg, kind = 'ok', ms = 5000) => {
    setNotice(msg)
    setNoticeKind(kind)
    setTimeout(() => setNotice(''), ms)
  }

  // Publish: POST drafts to /api/publish, which commits content.json to the
  // repo. Vercel's git integration then rebuilds — changes go live in ~1 min.
  const handlePublish = async () => {
    const bundle = collectDrafts()
    if (!bundle) { flash('No changes to publish yet.', 'err', 3000); return }

    setPublishing(true)
    try {
      const res = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: sessionStorage.getItem('admin_pw') || '',
          content: bundle,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || `Publish failed (${res.status})`)
      flash(data.message || 'Published — redeploying now.', 'ok', 8000)
    } catch (err) {
      // Local dev has no /api routes — fall back to the export flow.
      const local = /Failed to fetch|Unexpected token|404/.test(String(err.message))
      flash(
        local
          ? 'Publish API unavailable (local dev?) — use Export config instead.'
          : `Publish failed: ${err.message}`,
        'err',
        8000
      )
    } finally {
      setPublishing(false)
    }
  }

  // Manual fallback: bundle drafts into a JSON file to commit by hand.
  const handleExport = () => {
    const bundle = collectDrafts()
    if (!bundle) { flash('No changes to export yet.', 'err', 3000); return }

    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'portfolio-content.json'
    a.click()
    URL.revokeObjectURL(url)
    flash('Exported portfolio-content.json — commit it to persist across deploys.')
  }

  const logout = () => {
    sessionStorage.removeItem('admin_auth')
    sessionStorage.removeItem('admin_pw')
    navigate('/admin', { replace: true })
  }

  return (
    <div className="min-h-screen bg-paper flex flex-col lg:flex-row">
      {/* Sidebar (desktop) */}
      <aside className="hidden lg:flex w-56 shrink-0 bg-sunken border-r border-line flex-col">
        <div className="px-4 pt-6 pb-4 border-b border-line">
          <Logo variant="icon" size="sm" />
          <h2 className="h3 mt-3">Admin</h2>
          <p className="mono-label mt-1">Manage content</p>
        </div>
        <nav className="flex-1 py-3 px-2 space-y-0.5">
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => setActive(s.id)}
              className={`group w-full text-left flex items-center gap-3 px-3 py-2.5 font-mono text-[13px] uppercase tracking-label transition-colors duration-240 ${
                active === s.id ? 'text-ink' : 'text-ink-dim hover:text-ink'
              }`}
            >
              <span className={`shrink-0 w-2 h-2 transition-colors duration-120 ${active === s.id ? 'bg-yellow' : 'bg-line-strong group-hover:bg-ink-dim'}`} />
              {s.label}
            </button>
          ))}
        </nav>
        <div className="px-3 py-3 border-t border-line space-y-2">
          <button onClick={handlePublish} disabled={publishing} className="w-full btn-yellow justify-center disabled:opacity-50">
            <span>{publishing ? 'Publishing…' : 'Publish changes'}</span>
          </button>
          <button onClick={handleExport} className="admin-btn w-full justify-center">Export config</button>
          <a href="/" className="admin-btn w-full justify-center">← View portfolio</a>
          <button onClick={logout} className="admin-btn w-full justify-center">Log out</button>
        </div>
      </aside>

      {/* Mobile header — tabs + actions, scrollable */}
      <div className="lg:hidden bg-sunken border-b border-line">
        <div className="flex items-center gap-3 px-4 pt-4 pb-3">
          <Logo variant="icon" size="sm" />
          <div>
            <h2 className="h3">Admin</h2>
            <p className="mono-label">Manage content</p>
          </div>
          <button onClick={handlePublish} disabled={publishing} className="ml-auto btn-yellow px-3 py-1.5 disabled:opacity-50">
            <span>{publishing ? 'Publishing…' : 'Publish'}</span>
          </button>
        </div>
        <nav className="flex gap-1.5 overflow-x-auto scrollbar-thin px-4 pb-3">
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => setActive(s.id)}
              className={`shrink-0 whitespace-nowrap px-3 py-1.5 font-mono text-[12px] uppercase tracking-label border transition-colors duration-240 ${
                active === s.id ? 'bg-yellow text-paper border-yellow' : 'bg-surface text-ink-dim border-line hover:border-line-strong hover:text-ink'
              }`}
            >
              {s.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 sm:px-8 py-6 lg:py-8">
          {notice && (
            <div className={`mb-6 px-4 py-3 border mono-data ${
              noticeKind === 'err'
                ? 'border-red bg-red/5 text-red-bright'
                : 'border-live bg-live/5 text-live'
            }`}>
              {notice}
            </div>
          )}

          {active === 'profile' && <ProfileEditor />}
          {active === 'projects' && <ProjectsEditor />}
          {active === 'experience' && <ExperienceEditor />}
          {active === 'education' && <EducationEditor />}
          {active === 'skills' && <SkillsEditor />}
          {active === 'social' && <SocialEditor />}
        </div>
      </div>
    </div>
  )
}
