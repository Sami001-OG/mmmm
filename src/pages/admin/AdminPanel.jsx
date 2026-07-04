import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Logo from '../../components/brand/Logo'
import ProfileEditor from './sections/ProfileEditor'
import ExperienceEditor from './sections/ExperienceEditor'
import EducationEditor from './sections/EducationEditor'
import SkillsEditor from './sections/SkillsEditor'
import SocialEditor from './sections/SocialEditor'

const sections = [
  { id: 'profile', label: 'Profile' },
  { id: 'experience', label: 'Experience' },
  { id: 'education', label: 'Education' },
  { id: 'skills', label: 'Skills' },
  { id: 'social', label: 'Social Links' },
]

export default function AdminPanel() {
  const navigate = useNavigate()
  const [active, setActive] = useState('profile')
  const [exported, setExported] = useState('')

  useEffect(() => {
    if (!sessionStorage.getItem('admin_auth')) navigate('/admin', { replace: true })
  }, [navigate])

  const handleExport = () => {
    const draft = localStorage.getItem('portfolio_draft')
    if (!draft) {
      setExported('No changes to export.')
      return
    }
    const blob = new Blob([draft], { type: 'text/javascript' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'portfolio-exported.js'
    a.click()
    URL.revokeObjectURL(url)
    setExported('Config exported! Replace src/data/portfolio.js and rebuild.')
    setTimeout(() => setExported(''), 4000)
  }

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Sidebar */}
      <div className="w-56 shrink-0 bg-surface-900/95 border-r border-surface-600/10 flex flex-col">
        <div className="px-4 pt-6 pb-4 border-b border-surface-600/10">
          <Logo variant="icon" size="sm" />
          <h2 className="text-sm font-semibold text-surface-100 mt-3">Admin Panel</h2>
          <p className="text-[11px] text-surface-400">Manage your portfolio</p>
        </div>
        <nav className="flex-1 py-3 px-2 space-y-0.5">
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => setActive(s.id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                active === s.id
                  ? 'bg-accent-400/10 text-accent-400'
                  : 'text-surface-400 hover:text-surface-200 hover:bg-surface-700/30'
              }`}
            >
              {s.label}
            </button>
          ))}
        </nav>
        <div className="px-3 py-3 border-t border-surface-600/10 space-y-2">
          <button
            onClick={handleExport}
            className="w-full py-2 rounded-lg bg-accent-400/10 border border-accent-400/20 text-accent-300 text-xs font-semibold hover:bg-accent-400/20 transition-all"
          >
            Export Config
          </button>
          <a
            href="/"
            className="block w-full text-center py-2 rounded-lg text-surface-400 text-xs hover:text-surface-200 transition-colors"
          >
            ← View Portfolio
          </a>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-8 py-8">
          {exported && (
            <div className="mb-6 px-4 py-3 rounded-xl bg-emerald-400/5 border border-emerald-400/15 text-xs text-emerald-400/80">
              {exported}
            </div>
          )}

          {active === 'profile' && <ProfileEditor />}
          {active === 'experience' && <ExperienceEditor />}
          {active === 'education' && <EducationEditor />}
          {active === 'skills' && <SkillsEditor />}
          {active === 'social' && <SocialEditor />}
        </div>
      </div>
    </div>
  )
}
