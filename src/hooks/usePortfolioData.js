import { useState, useEffect } from 'react'
import { github, profile, navItems } from '../data/portfolio'
import content from '../data/content.json'

const draftKeys = {
  profile: 'portfolio_draft_profile',
  experience: 'portfolio_draft_experience',
  education: 'portfolio_draft_education',
  skills: 'portfolio_draft_skills',
  social: 'portfolio_draft_social',
  projects: 'portfolio_draft_projects',
  repoImages: 'portfolio_draft_repo_images',
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
  // Layering: committed content.json (deployed, survives everywhere) is the
  // base; localStorage drafts (this browser only, from the admin panel) win
  // on top. Export bundles the drafts to a JSON you commit into content.json.
  const draftProfile = loadDraft(draftKeys.profile) || content.profile
  const draftExperience = loadDraft(draftKeys.experience) || content.experience
  const draftEducation = loadDraft(draftKeys.education) || content.education
  const draftSkills = loadDraft(draftKeys.skills) || content.skills
  const draftSocial = loadDraft(draftKeys.social) || content.social
  const draftProjects = loadDraft(draftKeys.projects) || content.projects
  // Map of GitHub repo title (lowercase) → image URL, editable in the admin
  // panel. Lets fetched repos carry cover images (e.g. imgbb links).
  const draftRepoImages = loadDraft(draftKeys.repoImages) || content.repoImages || {}

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
    projects: normalizeProjects(draftProjects),
    repoImages: draftRepoImages,
    navItems,
    github,
  }
}

// Normalize the admin project drafts into the same shape ProjectCard expects
// (tags as an array, a stable id, numeric stats). GitHub repos already match.
function normalizeProjects(drafts) {
  if (!Array.isArray(drafts)) return []
  return drafts
    .filter((p) => p && p.title)
    .map((p, i) => ({
      id: `manual-${i}`,
      title: p.title,
      description: p.description || '',
      tags: typeof p.tags === 'string'
        ? p.tags.split(',').map((t) => t.trim()).filter(Boolean)
        : Array.isArray(p.tags) ? p.tags : [],
      href: p.href || '#',
      image: p.image || '',
      stars: Number(p.stars) || 0,
      forks: Number(p.forks) || 0,
      status: p.status || 'Live',
      statusColor: p.statusColor || 'live',
      featured: !!p.featured,
      manual: true,
    }))
}
