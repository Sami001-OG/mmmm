import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import useGithubData from '../hooks/useGithubData'
import usePortfolioData from '../hooks/usePortfolioData'
import { github } from '../data/portfolio'

// ─────────────────────────────────────────────────────────────────────────
// CV — classic ATS-clean résumé.
// Hard rules: single column, real text (no tables/columns/icons in the
// print area), real hyperlinks, semantic order. Screen shows a white A4
// sheet on a neutral field; print strips all chrome via the inline styles.
// "Download PDF" = window.print() — document.title becomes the filename.
// ─────────────────────────────────────────────────────────────────────────

const serif = "Georgia, 'Times New Roman', serif"

const sheet = {
  fontFamily: serif,
  color: '#111',
  background: '#fff',
  lineHeight: 1.45,
  fontSize: '11px',
  maxWidth: '794px', // A4 width at 96dpi
  margin: '16px auto',
  padding: '56px 64px',
  boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
}

const sectionHeaderStyle = {
  fontFamily: serif,
  fontSize: '11px',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '1.5px',
  borderBottom: '1px solid #999',
  paddingBottom: '4px',
  marginBottom: '10px',
}

const sectionStyle = { marginBottom: '18px' }

const dateStyle = {
  fontSize: '10px',
  color: '#444',
  whiteSpace: 'nowrap',
  marginLeft: '12px',
}

const linkStyle = { color: '#1a4f9c', textDecoration: 'none' }

// Contact line entry — renders a real link when href given, plain text otherwise.
function ContactItem({ href, children }) {
  if (!href) return <span>{children}</span>
  return (
    <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" style={linkStyle}>
      {children}
    </a>
  )
}

export default function CV() {
  const portfolio = usePortfolioData()
  const gh = useGithubData(github.username)

  const p = portfolio.profile
  const experience = portfolio.experience || []
  const education = portfolio.education || []
  const skills = portfolio.skills || []
  const manual = portfolio.projects || []
  const repos = gh.data?.repos || []
  const pinned = gh.data?.pinnedRepos || []
  const languages = gh.data?.languages || []

  // Browsers use document.title as the print-to-PDF filename.
  useEffect(() => {
    const prev = document.title
    document.title = `${p.name} — CV`
    return () => { document.title = prev }
  }, [p.name])

  // Merge manual admin projects with GitHub repos — parity with the
  // dashboard: dedupe by id, manual titles win, featured/pinned lead,
  // the rest by stars. Top 6 keeps the CV to one page.
  const manualTitles = new Set(manual.map((m) => m.title.toLowerCase()))
  const pinnedIds = new Set(pinned.map((r) => r.id))
  const ghAll = [...pinned, ...repos]
    .filter((r, i, arr) => arr.findIndex((x) => x.id === r.id) === i)
    .filter((r) => !manualTitles.has(r.title.toLowerCase()))
  const rest = [...manual.filter((m) => !m.featured), ...ghAll.filter((r) => !pinnedIds.has(r.id))]
    .sort((a, b) => (b.stars || 0) - (a.stars || 0))
  const allProjects = [
    ...manual.filter((m) => m.featured),
    ...ghAll.filter((r) => pinnedIds.has(r.id)),
    ...rest,
  ].slice(0, 6)

  const summary = p.bio || gh.data?.bio
  const socialLinks = p.social || []
  const linkedIn = socialLinks.find((s) => s.name === 'LinkedIn')?.href
  const twitter = socialLinks.find((s) => s.name === 'Twitter')?.href

  // Contact entries: [key, href, label]
  const contactItems = [
    p.email && ['email', `mailto:${p.email}`, p.email],
    ['github', `https://github.com/${github.username}`, `github.com/${github.username}`],
    linkedIn && linkedIn !== '#' && ['linkedin', linkedIn, linkedIn.replace(/^https?:\/\//, '')],
    twitter && twitter !== '#' && ['twitter', twitter, twitter.replace(/^https?:\/\//, '')],
    p.phone && ['phone', `tel:${String(p.phone).replace(/\s/g, '')}`, p.phone],
  ].filter(Boolean)

  const projectHref = (r) => {
    if (r.href && r.href !== '#') return r.href
    if (r.manual) return r.repo || null
    return `https://github.com/${github.username}/${r.title}`
  }

  return (
    <div className="cv-page" style={{ background: '#E9EAEC', minHeight: '100vh', padding: '32px 16px' }}>
      {/* Toolbar — hidden when printing */}
      <div
        className="no-print"
        style={{ maxWidth: '794px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: "'Segoe UI', Arial, sans-serif" }}
      >
        <Link to="/" style={{ fontSize: '13px', color: '#444', textDecoration: 'none' }}>
          ← Back to portfolio
        </Link>
        <button
          onClick={() => window.print()}
          style={{
            padding: '9px 22px',
            background: '#111',
            color: '#fff',
            border: 'none',
            fontSize: '13px',
            cursor: 'pointer',
          }}
        >
          Download PDF
        </button>
      </div>

      {/* The sheet */}
      <div className="cv-sheet" style={sheet}>
        {/* Header */}
        <header style={{ marginBottom: '20px' }}>
          <h1 style={{ fontSize: '27px', fontWeight: 700, margin: 0, lineHeight: 1.15, letterSpacing: '0.5px' }}>
            {p.name}
          </h1>
          <div style={{ fontSize: '12.5px', fontWeight: 500, color: '#222', marginTop: '3px' }}>{p.title}</div>
          {p.location && (
            <div style={{ fontSize: '10.5px', color: '#444', marginTop: '2px' }}>{p.location}</div>
          )}
          <div style={{ fontSize: '10px', color: '#333', marginTop: '8px' }}>
            {contactItems.map(([key, href, label], i) => (
              <span key={key}>
                {i > 0 && <span style={{ margin: '0 6px', color: '#999' }}>·</span>}
                <ContactItem href={href}>{label}</ContactItem>
              </span>
            ))}
          </div>
        </header>

        {/* Professional Summary */}
        {summary && (
          <section className="cv-section" style={sectionStyle}>
            <div style={sectionHeaderStyle}>Professional Summary</div>
            <p style={{ margin: 0, fontSize: '11px', lineHeight: 1.5 }}>{summary}</p>
          </section>
        )}

        {/* Skills */}
        {(skills.length > 0 || languages.length > 0) && (
          <section className="cv-section" style={sectionStyle}>
            <div style={sectionHeaderStyle}>Skills</div>
            {skills.length > 0 ? (
              skills.map((cat, i) => (
                <div key={i} style={{ marginBottom: '4px', fontSize: '11px', lineHeight: 1.55 }}>
                  <span style={{ fontWeight: 700 }}>{cat.name}: </span>
                  {cat.skills.map((s) => s.name).join(', ')}
                </div>
              ))
            ) : (
              <div style={{ fontSize: '11px', lineHeight: 1.55 }}>
                <span style={{ fontWeight: 700 }}>Languages: </span>
                {languages.map((l) => `${l.name} (${l.percentage}%)`).join(', ')}
              </div>
            )}
          </section>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <section className="cv-section" style={sectionStyle}>
            <div style={sectionHeaderStyle}>Experience</div>
            {experience.map((exp, i) => (
              <div key={i} className="cv-entry" style={{ marginBottom: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontSize: '11.5px' }}>
                  <div>
                    <span style={{ fontWeight: 700 }}>{exp.role || exp.company}</span>
                    {exp.role && exp.company && <span style={{ color: '#333' }}> — {exp.company}</span>}
                  </div>
                  {exp.period && <span style={dateStyle}>{exp.period}</span>}
                </div>
                {exp.description && (
                  <p style={{ margin: '3px 0 0 0', fontSize: '11px', lineHeight: 1.5 }}>{exp.description}</p>
                )}
                {exp.highlights && exp.highlights.filter(Boolean).length > 0 && (
                  <ul style={{ margin: '4px 0 0 0', paddingLeft: '18px', fontSize: '11px', lineHeight: 1.55 }}>
                    {exp.highlights.filter(Boolean).map((h, hi) => (
                      <li key={hi}>{h}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </section>
        )}

        {/* Education */}
        {education.length > 0 && (
          <section className="cv-section" style={sectionStyle}>
            <div style={sectionHeaderStyle}>Education</div>
            {education.map((edu, i) => (
              <div key={i} className="cv-entry" style={{ marginBottom: '11px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontSize: '11.5px' }}>
                  <div>
                    <span style={{ fontWeight: 700 }}>{edu.school}</span>
                    {edu.degree && <span style={{ color: '#333' }}> — {edu.degree}</span>}
                    {edu.field && <span style={{ color: '#333' }}>, {edu.field}</span>}
                  </div>
                  {edu.year && <span style={dateStyle}>{edu.year}</span>}
                </div>
                {edu.notes && (
                  <p style={{ margin: '2px 0 0 0', fontSize: '10.5px', lineHeight: 1.5, color: '#444' }}>{edu.notes}</p>
                )}
              </div>
            ))}
          </section>
        )}

        {/* Projects */}
        {allProjects.length > 0 && (
          <section className="cv-section" style={sectionStyle}>
            <div style={sectionHeaderStyle}>Projects</div>
            {allProjects.map((r) => {
              const href = projectHref(r)
              return (
                <div key={r.id} className="cv-entry" style={{ marginBottom: '9px' }}>
                  <div style={{ fontSize: '11px' }}>
                    {href ? (
                      <a href={href} target="_blank" rel="noopener noreferrer" style={{ ...linkStyle, fontWeight: 700 }}>
                        {r.title}
                      </a>
                    ) : (
                      <span style={{ fontWeight: 700 }}>{r.title}</span>
                    )}
                    {r.description && <span> — {r.description}</span>}
                  </div>
                  {r.tags && r.tags.length > 0 && (
                    <div style={{ fontSize: '10px', color: '#555', marginTop: '1px' }}>
                      Tech: {r.tags.join(', ')}
                    </div>
                  )}
                </div>
              )
            })}
          </section>
        )}
      </div>

      {/* Print styles */}
      <style>{`
        @page { size: A4; margin: 0.75in; }
        @media print {
          .no-print { display: none !important; }
          body { background: #fff !important; margin: 0; padding: 0; }
          .cv-page { background: #fff !important; padding: 0 !important; min-height: 0 !important; }
          .cv-sheet {
            box-shadow: none !important;
            margin: 0 !important;
            padding: 0 !important;
            max-width: 100% !important;
          }
          .cv-sheet a { color: #000 !important; text-decoration: none !important; }
          .cv-entry { break-inside: avoid; page-break-inside: avoid; }
        }
      `}</style>
    </div>
  )
}
