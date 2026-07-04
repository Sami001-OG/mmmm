import { useState } from 'react'
import { profile } from '../../../data/portfolio'

const socials = [
  { name: 'LinkedIn', icon: 'linkedin', desc: 'Your LinkedIn profile URL' },
  { name: 'Twitter', icon: 'twitter', desc: 'Your Twitter/X profile URL (auto-fetched from GitHub if available)' },
  { name: 'Blog', icon: 'external-link', desc: 'Your personal website or blog' },
]

export default function SocialEditor() {
  const [links, setLinks] = useState(() => {
    try {
      const saved = localStorage.getItem('portfolio_draft_social')
      return saved ? JSON.parse(saved) : profile.social.reduce((acc, s) => { acc[s.name] = s.href; return acc }, {})
    } catch { return {} }
  })

  const update = (name, val) => {
    const next = { ...links, [name]: val }
    setLinks(next)
    localStorage.setItem('portfolio_draft_social', JSON.stringify(next))
  }

  return (
    <div>
      <h2 className="text-base font-semibold text-surface-100 mb-1">Social Links</h2>
      <p className="text-xs text-surface-400 mb-6">Links to your professional profiles.</p>

      <div className="space-y-4">
        {socials.map((s) => (
          <div key={s.name}>
            <label className="text-xs font-medium text-surface-300 mb-1.5 block">{s.name}</label>
            <input
              type="url"
              value={links[s.name] || ''}
              onChange={(e) => update(s.name, e.target.value)}
              placeholder="https://..."
              className="w-full px-3.5 py-2 rounded-xl bg-surface-800 border border-surface-600/30 text-sm text-surface-200 placeholder-surface-500 outline-none focus:border-accent-400/30 transition-all"
            />
            <p className="text-[11px] text-surface-500 mt-1">{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
