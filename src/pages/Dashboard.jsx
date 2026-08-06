import { useState, useEffect } from 'react'
import Sidebar from '../components/layout/Sidebar'
import TopBar from '../components/layout/TopBar'
import MobileNav from '../components/layout/MobileNav'
import StatCard from '../components/dashboard/StatCard'
import ProjectCard from '../components/dashboard/ProjectCard'
import SkillBar from '../components/dashboard/SkillBar'
import DonutChart from '../components/dashboard/DonutChart'
import ContributionGraph from '../components/dashboard/ContributionGraph'
import Timeline from '../components/dashboard/Timeline'
import SystemsBoard from '../components/dashboard/SystemsBoard'
import SectionHeader from '../components/dashboard/SectionHeader'
import Hero from '../components/dashboard/Hero'
import Nameplate from '../components/Nameplate'
import Reveal from '../components/ui/Reveal'
import CommandPalette from '../components/ui/CommandPalette'
import Icon from '../components/ui/Icon'
import Badge from '../components/ui/Badge'
import useGithubData from '../hooks/useGithubData'
import usePortfolioData from '../hooks/usePortfolioData'
import useTheme from '../hooks/useTheme'
import { downloadPosterPNG, downloadPoster } from '../lib/poster-svg'
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
  const { isPaper, isBlueprint, toggle: toggleTheme, toggleBlueprint } = useTheme()

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
    // Admin-authored bio wins; GitHub bio is only a fallback when none is set.
    bio: pd.profile.bio || gh.data?.bio,
    avatarUrl: gh.data?.avatarUrl || null,
    location: gh.data?.location || pd.profile.location,
    login: gh.data?.login || github.username,
    social: pd.profile.social,
  }

  // Social links with real destinations — '#' placeholders are dead links.
  const liveSocial = mergedProfile.social.filter((s) => s.href && s.href !== '#')

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

  // Proof-of-work timeline: GitHub repos span first commit → last push;
  // manual projects join when the admin supplies a started date.
  const timelineItems = [
    ...[...ghPinned, ...ghRepos]
      .filter((r) => r.createdAt)
      .map((r) => ({ id: r.id, title: r.title, start: r.createdAt, end: r.updatedAt, lang: r.tags?.[0] })),
    ...manual
      .filter((m) => m.started)
      .map((m) => ({ id: m.id, title: m.title, start: m.started, end: m.ended || null, lang: (m.tags || [])[0] })),
  ]

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
        isBlueprint={isBlueprint}
        onToggleBlueprint={toggleBlueprint}
      />

      <Sidebar
        profile={mergedProfile}
        navItems={pd.navItems}
        activeSection={activeSection}
        onNavClick={scrollTo}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className="lg:pl-[72px]">
        <TopBar
          profile={mergedProfile}
          onMenuToggle={() => setMobileOpen((v) => !v)}
          onSearchOpen={() => setPaletteOpen(true)}
          isPaper={isPaper}
          onToggleTheme={toggleTheme}
        />

        <main id="main" className={`px-4 sm:px-8 pt-8 pb-24 lg:pb-8 space-y-16 transition-opacity duration-480 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
          {/* Hero */}
          <Hero profile={mergedProfile} languages={gh.data?.languages} />

          {/* Overview */}
          <section id="overview">
            <SectionHeader index={1} title="Overview" description="Real data, pulled from GitHub" />
            {gh.data ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                  <Reveal key={stat.label} delay={i * 60} className="h-full">
                    <StatCard {...stat} />
                  </Reveal>
                ))}
              </div>
            ) : (
              <div className="card p-5 flex items-start gap-4">
                <span className="shape-dot bg-yellow mt-1.5 shrink-0" aria-hidden />
                <div>
                  <p className="h3">GitHub data unavailable</p>
                  <p className="text-ink-dim text-sm mt-1 leading-relaxed">
                    {gh.error || 'Could not load GitHub data.'} The site still works — projects
                    and stats refresh automatically from GitHub on the next visit.
                  </p>
                </div>
              </div>
            )}
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

          {/* Timeline — proof of work */}
          {timelineItems.length > 0 && (
            <section id="timeline">
              <SectionHeader
                index={3}
                title="Timeline"
                description="Proof of work — first commit to last push, per project"
              />
              <Timeline items={timelineItems} />
            </section>
          )}

          {/* Skills */}
          <section id="skills">
            <SectionHeader
              index={4}
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
              index={5}
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
              <SectionHeader index={6} title="Education" description="Academic background" />
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
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <SectionHeader index={7} title="Activity" description="Contribution calendar + deployed-system status" />
              <button
                type="button"
                onClick={async () => {
                  const d = gh.data
                  if (!d) return
                  const opts = {
                    name: (d.name || 'sami').toLowerCase(),
                    login: d.login,
                    weeks: d.contributions?.weeks || [],
                    totalContributions: d.contributions?.totalContributions || 0,
                    repoCount: d.repos.length + (d.pinnedRepos?.length || 0),
                    totalStars: d.totalStars || 0,
                    languages: d.languages || [],
                    year: new Date().getFullYear(),
                  }
                  const ok = await downloadPosterPNG(opts)
                  if (!ok) downloadPoster(opts)
                }}
                className="btn-ghost shrink-0 gap-2"
                title="Download the year-in-code poster as PNG — generated live from your GitHub data"
              >
                <Icon name="download" size={14} />
                <span className="mono-label">{new Date().getFullYear()} poster</span>
              </button>
            </div>
            {gh.data?.contributions ? (
              <ContributionGraph data={gh.data.contributions} />
            ) : (
              <div className="card p-5">
                <p className="text-ink-dim text-sm">Contribution data unavailable.</p>
              </div>
            )}
            <SystemsBoard systems={gh.data?.systems} />
          </section>

          {/* Contact */}
          <section id="contact">
            <SectionHeader index={8} title="Contact" description="Reach out — open to opportunities" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="card p-5 space-y-4">
                {mergedProfile.email && (
                  <a href={`mailto:${mergedProfile.email}`} className="group flex items-center gap-4">
                    <span className="shrink-0 w-9 h-9 border border-line flex items-center justify-center text-ink-dim group-hover:text-yellow group-hover:border-line-strong transition-colors duration-240">
                      <Icon name="mail" size={15} />
                    </span>
                    <span className="min-w-0">
                      <span className="mono-label block">Email</span>
                      <span className="mono-data text-ink group-hover:text-blue-bright transition-colors duration-240 break-all">{mergedProfile.email}</span>
                    </span>
                  </a>
                )}
                {mergedProfile.phone && (
                  <a href={`tel:${String(mergedProfile.phone).replace(/\s/g, '')}`} className="group flex items-center gap-4">
                    <span className="shrink-0 w-9 h-9 border border-line flex items-center justify-center text-ink-dim group-hover:text-yellow group-hover:border-line-strong transition-colors duration-240">
                      <Icon name="phone" size={15} />
                    </span>
                    <span className="min-w-0">
                      <span className="mono-label block">Phone</span>
                      <span className="mono-data text-ink group-hover:text-blue-bright transition-colors duration-240">{mergedProfile.phone}</span>
                    </span>
                  </a>
                )}
                {mergedProfile.location && (
                  <div className="flex items-center gap-4">
                    <span className="shrink-0 w-9 h-9 border border-line flex items-center justify-center text-ink-dim">
                      <Icon name="mapPin" size={15} />
                    </span>
                    <span className="min-w-0">
                      <span className="mono-label block">Location</span>
                      <span className="mono-data text-ink">{mergedProfile.location}</span>
                    </span>
                  </div>
                )}
              </div>

              <div className="card p-5 flex flex-col justify-between gap-5">
                <div className="flex items-start gap-4">
                  <span className="shape-dot bg-live mt-1.5 shrink-0" aria-hidden />
                  <div>
                    <p className="h3">Let&apos;s connect</p>
                    <p className="text-ink-dim text-sm mt-1 leading-relaxed">
                      Open to internships, collaborations, and interesting projects.
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {liveSocial.map((s) => (
                    <a
                      key={s.name}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-ghost"
                    >
                      <Icon name={s.icon} size={13} />
                      <span>{s.name}</span>
                    </a>
                  ))}
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
              </div>
            </div>
          </section>

          <div>
          <Nameplate dataSync={gh.data?.fetchedAt} onActivate={toggleBlueprint} />

          <footer className="flex flex-col sm:flex-row items-center justify-between gap-3 py-8 border-t border-line mono-data text-ink-faint">
            <span>© {new Date().getFullYear()} {mergedProfile.name} — built with React &amp; Tailwind.</span>
            <div className="flex items-center gap-4">
              {liveSocial.map((s) => (
                <a key={s.name} href={s.href} target="_blank" rel="noopener noreferrer" className="hover:text-ink transition-colors duration-240">
                  {s.name}
                </a>
              ))}
            </div>
          </footer>
          </div>
        </main>
      </div>
      <MobileNav navItems={pd.navItems} activeSection={activeSection} onNavClick={scrollTo} />
    </div>
  )
}
