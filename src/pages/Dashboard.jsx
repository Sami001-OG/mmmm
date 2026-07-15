import { useState, useEffect } from 'react'
import Sidebar from '../components/layout/Sidebar'
import TopBar from '../components/layout/TopBar'
import StatCard from '../components/dashboard/StatCard'
import ProjectCard from '../components/dashboard/ProjectCard'
import SkillBar from '../components/dashboard/SkillBar'
import DonutChart from '../components/dashboard/DonutChart'
import ContributionGraph from '../components/dashboard/ContributionGraph'
import SectionHeader from '../components/dashboard/SectionHeader'
import Hero from '../components/dashboard/Hero'
import Reveal from '../components/ui/Reveal'
import CommandPalette from '../components/ui/CommandPalette'
import Icon from '../components/ui/Icon'
import Badge from '../components/ui/Badge'
import useGithubData from '../hooks/useGithubData'
import usePortfolioData from '../hooks/usePortfolioData'
import useTheme from '../hooks/useTheme'
import { github } from '../data/portfolio'

// Fixed exposed-grid backdrop — 12-col ruled field, aria-hidden, SSR-safe.
// Flat: no auroras, no blur, no scanlines (the cyber layer is gone).
function GridField() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 grid-lines opacity-[0.35]"
    />
  )
}

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState('overview')
  const [mounted, setMounted] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const gh = useGithubData(github.username)
  const pd = usePortfolioData()
  const { isPaper, toggle: toggleTheme } = useTheme()

  useEffect(() => { setMounted(true) }, [])

  // Global ⌘K / Ctrl+K toggles the command palette.
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPaletteOpen((v) => !v)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const scrollTo = (id) => {
    setActiveSection(id)
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      // Move keyboard focus with the viewport so SR/keyboard users don't lose
      // their place. tabIndex -1 makes the section programmatically focusable
      // without adding it to the tab order.
      el.setAttribute('tabindex', '-1')
      el.focus({ preventScroll: true })
    }
  }

  const mergedProfile = {
    ...pd.profile,
    name: gh.data?.name || pd.profile.name,
    bio: gh.data?.bio || pd.profile.bio,
    avatarUrl: gh.data?.avatarUrl || null,
    location: gh.data?.location || pd.profile.location,
    login: gh.data?.login || github.username,
    social: pd.profile.social,
  }

  const stats = gh.data
    ? [
        { label: 'Repositories', value: String(gh.data.repos.length + (gh.data.pinnedRepos?.length || 0)), icon: 'folder', accent: 'blue' },
        { label: 'Languages', value: String(gh.data.languages.length), icon: 'terminal', accent: 'yellow' },
        { label: 'Total Stars', value: String(gh.data.totalStars), icon: 'star', accent: 'red' },
        { label: 'Followers', value: String(gh.data.followers), icon: 'users', accent: 'blue' },
      ]
    : []

  const languagesCategory = gh.data?.languages?.length
    ? { name: 'Languages by code volume', icon: 'code', skills: gh.data.languages.map((l) => ({ name: l.name, level: l.percentage })) }
    : null

  // Merge manual projects (from admin) with GitHub repos. Manual entries win
  // on title collision; featured (pinned GitHub repos + manual-featured) lead.
  // Admin-set image URLs (repoImages, keyed by repo name) attach cover images
  // to fetched GitHub repos.
  const manual = pd.projects || []
  const manualTitles = new Set(manual.map((p) => p.title.toLowerCase()))
  const repoImages = pd.repoImages || {}
  const withImage = (r) => {
    const img = repoImages[r.title?.toLowerCase()]
    return img ? { ...r, image: img } : r
  }
  const ghPinned = (gh.data?.pinnedRepos || []).filter((r) => !manualTitles.has(r.title.toLowerCase())).map(withImage)
  const ghRepos = (gh.data?.repos || []).filter((r) => !manualTitles.has(r.title.toLowerCase())).map(withImage)

  const pinned = [...manual.filter((p) => p.featured), ...ghPinned]
  const regular = [...manual.filter((p) => !p.featured), ...ghRepos]
  const totalRepos = pinned.length + regular.length

  return (
    <div className="min-h-screen relative">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[60] focus:px-4 focus:py-2 focus:bg-yellow focus:text-paper focus:font-mono focus:text-[12px] focus:uppercase focus:tracking-label"
      >
        Skip to content
      </a>

      <GridField />

      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        navItems={pd.navItems}
        social={mergedProfile.social}
        onNavigate={scrollTo}
        isPaper={isPaper}
        onToggleTheme={toggleTheme}
      />

      <Sidebar
        profile={mergedProfile}
        navItems={pd.navItems}
        activeSection={activeSection}
        onNavClick={scrollTo}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className="lg:pl-[260px]">
        <TopBar
          profile={mergedProfile}
          onMenuToggle={() => setMobileOpen((v) => !v)}
          onSearchOpen={() => setPaletteOpen(true)}
          isPaper={isPaper}
          onToggleTheme={toggleTheme}
        />

        <main id="main" className={`px-4 sm:px-8 py-8 space-y-16 transition-opacity duration-480 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
          {/* Hero */}
          <Hero profile={mergedProfile} languages={gh.data?.languages} />

          {/* Overview */}
          <section id="overview">
            <SectionHeader index={1} title="Overview" description="Real data, pulled from GitHub" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat, i) => (
                <Reveal key={stat.label} delay={i * 60} className="h-full">
                  <StatCard {...stat} />
                </Reveal>
              ))}
            </div>
          </section>

          {/* Projects */}
          <section id="projects">
            <SectionHeader
              index={2}
              title="Projects"
              description={`${totalRepos} public repositories`}
              action={gh.data ? { label: 'All on GitHub', href: `https://github.com/${mergedProfile.login}?tab=repositories` } : null}
            />

            {pinned.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="shape-square bg-yellow" aria-hidden />
                  <span className="mono-label">Featured</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pinned.map((project, i) => (
                    <Reveal key={project.id} delay={i * 60} className="h-full">
                      <ProjectCard project={project} featured />
                    </Reveal>
                  ))}
                </div>
              </div>
            )}

            {regular.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {regular.map((project, i) => (
                  <Reveal key={project.id} delay={i * 50} className="h-full">
                    <ProjectCard project={project} />
                  </Reveal>
                ))}
              </div>
            )}

            {totalRepos === 0 && (
              <div className="card p-10 text-center">
                <p className="text-ink-dim text-sm">No public repositories to show yet.</p>
              </div>
            )}
          </section>

          {/* Skills */}
          <section id="skills">
            <SectionHeader
              index={3}
              title="Skills"
              description="Language composition from GitHub + proficiencies you define"
            />
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {gh.data?.languages?.length > 0 && <DonutChart data={gh.data.languages} />}
                {languagesCategory && <SkillBar category={languagesCategory} />}
              </div>
              {pd.skills.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pd.skills.map((cat, i) => (
                    <Reveal key={cat.name} delay={i * 80} className="h-full">
                      <SkillBar category={cat} />
                    </Reveal>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Experience */}
          <section id="experience">
            <SectionHeader
              index={4}
              title="Experience"
              description={pd.experience.length > 0 ? 'Work history and roles' : 'Current focus'}
            />
            {pd.experience.length > 0 ? (
              <div className="space-y-4">
                {pd.experience.map((exp, i) => (
                  <Reveal key={i} delay={i * 60}>
                    <div className="card card-lift p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="h3">{exp.role}</h3>
                          <p className="mono-label text-blue-bright normal-case tracking-normal mt-1">{exp.company}</p>
                        </div>
                        {exp.period && <Badge color="surface">{exp.period}</Badge>}
                      </div>
                      {exp.description && (
                        <p className="text-ink-dim text-sm mt-3 leading-relaxed">{exp.description}</p>
                      )}
                      {exp.highlights?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-4">
                          {exp.highlights.filter(Boolean).map((h, hi) => (
                            <span key={hi} className="chip">{h}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </Reveal>
                ))}
              </div>
            ) : (
              <div className="card p-6">
                <div className="flex items-start gap-4">
                  <span className="shape-dot bg-blue mt-2 shrink-0" aria-hidden />
                  <div>
                    <h3 className="h3">Student Developer</h3>
                    <p className="text-ink-dim text-sm mt-2 leading-relaxed">
                      Building projects, learning daily, and aiming for mastery. Open to internships and collaborations.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Education */}
          {pd.education.length > 0 && (
            <section id="education">
              <SectionHeader index={5} title="Education" description="Academic background" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {pd.education.map((edu, i) => (
                  <Reveal key={i} delay={i * 80} className="h-full">
                    <div className="card card-lift p-5 h-full">
                      <h3 className="h3">{edu.school}</h3>
                      <p className="mono-label text-blue-bright normal-case tracking-normal mt-1">
                        {edu.degree}{edu.field ? ` — ${edu.field}` : ''}
                      </p>
                      {edu.year && <p className="mono-data text-ink-faint mt-2">{edu.year}</p>}
                      {edu.notes && <p className="text-ink-dim text-sm mt-2">{edu.notes}</p>}
                    </div>
                  </Reveal>
                ))}
              </div>
            </section>
          )}

          {/* Activity */}
          <section id="activity">
            <SectionHeader index={6} title="Activity" description="GitHub contribution calendar" />
            {gh.data?.contributions ? (
              <ContributionGraph data={gh.data.contributions} />
            ) : (
              <div className="card p-5">
                <p className="text-ink-dim text-sm">Contribution data unavailable.</p>
              </div>
            )}

            <div className="card mt-4 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="shape-dot bg-live shrink-0" aria-hidden />
                <div>
                  <p className="h3">Let&apos;s connect</p>
                  <p className="text-ink-dim text-sm mt-0.5">{mergedProfile.location || 'Open to opportunities'}</p>
                </div>
              </div>
              <a
                href={`https://github.com/${mergedProfile.login}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-blue"
              >
                <span>View GitHub Profile</span>
                <Icon name="arrowUpRight" size={13} />
              </a>
            </div>
          </section>

          <footer className="flex flex-col sm:flex-row items-center justify-between gap-3 py-8 border-t border-line mono-data text-ink-faint">
            <span>© {new Date().getFullYear()} {mergedProfile.name} — built with React &amp; Tailwind.</span>
            <div className="flex items-center gap-4">
              {mergedProfile.social.map((s) => (
                <a key={s.name} href={s.href} target="_blank" rel="noopener noreferrer" className="hover:text-ink transition-colors duration-240">
                  {s.name}
                </a>
              ))}
            </div>
          </footer>
        </main>
      </div>
    </div>
  )
}
