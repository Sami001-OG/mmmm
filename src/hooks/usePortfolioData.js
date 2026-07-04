import { useState, useEffect } from 'react'
import { github, profile, navItems } from '../data/portfolio'

const draftKeys = {
  profile: 'portfolio_draft_profile',
  experience: 'portfolio_draft_experience',
  education: 'portfolio_draft_education',
  skills: 'portfolio_draft_skills',
  social: 'portfolio_draft_social',
}

function loadDraft(key) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

export default function usePortfolioData() {
  const [data, setData] = useState(() => buildData())

  useEffect(() => {
    const handler = () => setData(buildData())
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])

  return data
}

function buildData() {
  const draftProfile = loadDraft(draftKeys.profile)
  const draftExperience = loadDraft(draftKeys.experience)
  const draftEducation = loadDraft(draftKeys.education)
  const draftSkills = loadDraft(draftKeys.skills)
  const draftSocial = loadDraft(draftKeys.social)

  const mergedProfile = {
    ...profile,
    ...(draftProfile || {}),
    social: draftSocial
      ? profile.social.map((s) => ({
          ...s,
          href: draftSocial[s.name] || s.href,
        }))
      : profile.social,
  }

  return {
    profile: mergedProfile,
    experience: draftExperience || [],
    education: draftEducation || [],
    skills: draftSkills || [],
    navItems,
    github,
  }
}
