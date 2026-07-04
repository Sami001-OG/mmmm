import { useState, useEffect } from 'react'
import Sidebar from '../components/layout/Sidebar'
import TopBar from '../components/layout/TopBar'
import StatCard from '../components/dashboard/StatCard'
import ProjectCard from '../components/dashboard/ProjectCard'
import SkillBar from '../components/dashboard/SkillBar'
import DonutChart from '../components/dashboard/DonutChart'
import ContributionGraph from '../components/dashboard/ContributionGraph'
import SectionHeader from '../components/dashboard/SectionHeader'
import Icon from '../components/ui/Icon'
import Badge from '../components/ui/Badge'
import useGithubData from '../hooks/useGithubData'
import usePortfolioData from '../hooks/usePortfolioData'
import { github } from '../data/portfolio'

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState('overview')
  const [mounted, setMounted] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const gh = useGithubData(github.username)
  const pd = usePortfolioData()

  useEffect(() => { setMounted(true) }, [])

  const scrollTo = (id) => {
    setActiveSection(id)
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const mergedProfile = {
    ...pd.profile,
    name: gh.data?.name || pd.profile.name,
    bio: gh.data?.bio || pd.profile.bio,
    avatarUrl: gh.data?.avatarUrl || null,
    location: gh.data?.location || pd.profile.location,
    social: pd.profile.social,
  }

  const stats = gh.data
    ? [
        { label: 'Repositories', value: String(gh.data.repos.length + (gh.data.pinnedRepos?.length || 0)), icon: 'folder', trend: null },
        { label: 'Languages', value: String(gh.data.languages.length), icon: 'terminal', trend: null },
        { label: 'Total Stars', value: String(gh.data.totalStars), icon: 'star', trend: null },
        { label: 'Contributions', value: gh.data.contributions ? String(gh.data.contributions.totalContributions) : '-', icon: 'git-commit', trend: `+${gh.data.followers} followers` },
      ]
    : []

  const languagesCategory = gh.data?.languages?.length
    ? { name: 'Languages by code volume', icon: 'code', skills: gh.data.languages.map((l) => ({ name: l.name, level: l.percentage })) }
    : null

  const allRepos = [...(gh.data?.pinnedRepos || []), ...(gh.data?.repos || [])]

  const filteredRepos = searchQuery
    ? allRepos.filter((r) =>
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
        r.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allRepos

  const filteredPinned = searchQuery
    ? (gh.data?.pinnedRepos || []).filter((r) => filteredRepos.find((f) => f.id === r.id))
    : (gh.data?.pinnedRepos || [])

  const filteredRegular = searchQuery
    ? (gh.data?.repos || []).filter((r) => filteredRepos.find((f) => f.id === r.id))
    : (gh.data?.repos || [])

  return (
    <div className="min-h-screen bg-surface">
      <Sidebar
        profile={mergedProfile}
        navItems={pd.navItems}
        activeSection={activeSection}
        onNavClick={scrollTo}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className="lg:pl-[260px] transition-all duration-300">
        <TopBar
          profile={mergedProfile}
          onMenuToggle={() => setMobileOpen(!mobileOpen)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <main className={`px-4 sm:px-8 py-8 space-y-10 ${mounted ? 'animate-fade-in' : 'opacity-0'}`}>
          {/* Overview */}
          <section id="overview">
            <SectionHeader title="Overview" description="Real data from GitHub" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat) => (
                <StatCard key={stat.label} {...stat} />
              ))}
            </div>
          </section>

          {/* Projects */}
          <section id="projects">
            <SectionHeader
              title="Projects"
              description={
                searchQuery
                  ? `${filteredRepos.length} matching "${searchQuery}"`
                  : `${allRepos.length} public repositories`
              }
              action={gh.data ? 'View all on GitHub →' : null}
            />

            {filteredPinned.length > 0 && !searchQuery && (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <Icon name="star" size={13} className="text-amber-400" />
                  <span className="text-[11px] font-semibold text-amber-400/80 uppercase tracking-wider">Featured</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredPinned.map((project) => (
                    <ProjectCard key={project.id} project={project} featured />
                  ))}
                </div>
              </div>
            )}

            {filteredRepos.length === 0 ? (
              <div className="card p-8 text-center">
                <p className="text-sm text-surface-400">No projects match "{searchQuery}"</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredRegular.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            )}
          </section>

          {/* Skills */}
          <section id="skills">
            <SectionHeader
              title="Skills"
              description="Language composition from GitHub + proficiencies you define"
            />
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {gh.data?.languages?.length > 0 && (
                  <DonutChart data={gh.data.languages} />
                )}
                {languagesCategory && (
                  <SkillBar category={languagesCategory} />
                )}
              </div>
              {pd.skills.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pd.skills.map((cat) => (
                    <SkillBar key={cat.name} category={cat} />
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Experience */}
          <section id="experience">
            <SectionHeader
              title="Experience"
              description={pd.experience.length > 0 ? 'Work history and roles' : 'Current focus'}
            />
            {pd.experience.length > 0 ? (
              <div className="space-y-1">
                {pd.experience.map((exp, i) => (
                  <div key={i} className="relative pl-8 pb-8 last:pb-0 group">
                    <div className="absolute left-[7px] top-3 bottom-0 w-px bg-surface-600/20 last:hidden" />
                    <div className="absolute left-0 top-1.5 w-[15px] h-[15px] rounded-full border-2 border-accent-400/30 bg-surface-800">
                      <div className="absolute inset-[3px] rounded-full bg-accent-400/60" />
                    </div>
                    <div className="card-hover p-5">
                      <div className="flex items-start justify-between mb-1">
                        <div>
                          <h3 className="text-sm font-semibold text-surface-100">{exp.role}</h3>
                          <p className="text-xs text-accent-400 font-medium">{exp.company}</p>
                        </div>
                        {exp.period && <Badge color="surface">{exp.period}</Badge>}
                      </div>
                      {exp.description && (
                        <p className="text-xs text-surface-400 mt-2 leading-relaxed">{exp.description}</p>
                      )}
                      {exp.highlights?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {exp.highlights.filter(Boolean).map((h, hi) => (
                            <span key={hi} className="text-[11px] text-surface-400 bg-surface-700/40 px-2 py-0.5 rounded-md border border-surface-600/20">{h}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-accent-400/10 border border-accent-400/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon name="monitor" size={18} className="text-accent-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-surface-100">Student Developer</h3>
                    <p className="text-xs text-surface-400 mt-1.5 leading-relaxed">
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
              <SectionHeader title="Education" description="Academic background" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {pd.education.map((edu, i) => (
                  <div key={i} className="card p-5">
                    <h3 className="text-sm font-semibold text-surface-100">{edu.school}</h3>
                    <p className="text-xs text-accent-400 font-medium mt-0.5">{edu.degree}{edu.field ? ` — ${edu.field}` : ''}</p>
                    {edu.year && <p className="text-xs text-surface-500 mt-1">{edu.year}</p>}
                    {edu.notes && <p className="text-xs text-surface-400 mt-2">{edu.notes}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Activity */}
          <section id="activity">
            <SectionHeader title="Activity" description="GitHub contribution calendar" />
            {gh.data?.contributions ? (
              <ContributionGraph data={gh.data.contributions} />
            ) : (
              <div className="card p-5">
                <p className="text-xs text-surface-400">Contribution data unavailable.</p>
              </div>
            )}

            <div className="card mt-4 p-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-accent-400/10 border border-accent-400/20 flex items-center justify-center">
                  <Icon name="mail" size={18} className="text-accent-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-surface-100">Let&apos;s connect</p>
                  <p className="text-xs text-surface-400">{mergedProfile.location || 'Open to opportunities'}</p>
                </div>
              </div>
              <a
                href={`https://github.com/${gh.data?.login || github.username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-accent-400/10 border border-accent-400/20 text-accent-300 text-xs font-semibold hover:bg-accent-400/20 hover:shadow-glow transition-all"
              >
                View GitHub Profile
              </a>
            </div>
          </section>

          <footer className="flex items-center justify-between py-6 border-t border-surface-600/10 text-xs text-surface-500">
            <span>&copy; {new Date().getFullYear()} {mergedProfile.name}. Built with React & Tailwind CSS.</span>
            <div className="flex items-center gap-4">
              {mergedProfile.social.map((s) => (
                <a key={s.name} href={s.href} className="hover:text-surface-300 transition-colors">
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
