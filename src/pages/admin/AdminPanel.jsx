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

// The localStorage draft keys the export bundles into one config object.
const DRAFT_KEYS = {
  profile: 'portfolio_draft_profile',
  social: 'portfolio_draft_social',
  experience: 'portfolio_draft_experience',
  education: 'portfolio_draft_education',
  skills: 'portfolio_draft_skills',
  projects: 'portfolio_draft_projects',
}

export default function AdminPanel() {
  const navigate = useNavigate()
  const [active, setActive] = useState('profile')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    if (!sessionStorage.getItem('admin_auth')) navigate('/admin', { replace: true })
  }, [navigate])

  // Bundle every draft into a single JSON file the user can commit into the
  // repo (drafts live only in this browser otherwise — they don't deploy).
  const handleExport = () => {
    const bundle = {}
    let any = false
    for (const [name, key] of Object.entries(DRAFT_KEYS)) {
      try {
        const raw = localStorage.getItem(key)
        if (raw) { bundle[name] = JSON.parse(raw); any = true }
      } catch { /* skip malformed */ }
    }
    if (!any) { setNotice('No changes to export yet.'); setTimeout(() => setNotice(''), 3000); return }

    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'portfolio-content.json'
    a.click()
    URL.revokeObjectURL(url)
    setNotice('Exported portfolio-content.json — commit it to persist across deploys.')
    setTimeout(() => setNotice(''), 5000)
  }

  const logout = () => {
    sessionStorage.removeItem('admin_auth')
    navigate('/admin', { replace: true })
  }

  return (
    <div className="min-h-screen bg-paper flex">
      {/* Sidebar */}
      <div className="w-56 shrink-0 bg-sunken border-r border-line flex flex-col">
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
          <button onClick={handleExport} className="w-full btn-yellow justify-center">
            <span>Export config</span>
          </button>
          <a href="/" className="admin-btn w-full justify-center">← View portfolio</a>
          <button onClick={logout} className="admin-btn w-full justify-center">Log out</button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-8 py-8">
          {notice && (
            <div className="mb-6 px-4 py-3 border border-live bg-live/5 mono-data text-live">
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
