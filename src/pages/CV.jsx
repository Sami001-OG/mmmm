import { useRef } from 'react'
import { Link } from 'react-router-dom'
import useGithubData from '../hooks/useGithubData'
import usePortfolioData from '../hooks/usePortfolioData'
import { github } from '../data/portfolio'

const pageStyle = {
  fontFamily: "'Segoe UI', Arial, Helvetica, sans-serif",
  color: '#000',
  background: '#fff',
  lineHeight: 1.4,
  fontSize: '11px',
  margin: 0,
  padding: 0,
}

const sectionHeaderStyle = {
  fontSize: '11px',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  borderBottom: '1px solid #000',
  paddingBottom: '3px',
  marginBottom: '8px',
}

const sectionStyle = {
  marginBottom: '18px',
}

export default function CV() {
  const portfolio = usePortfolioData()
  const gh = useGithubData(github.username)
  const printRef = useRef(null)

  const p = portfolio.profile
  const experience = portfolio.experience || []
  const education = portfolio.education || []
  const skills = portfolio.skills || []
  const repos = gh.data?.repos || []
  const pinned = gh.data?.pinnedRepos || []
  const languages = gh.data?.languages || []

  const allProjects = [...pinned, ...repos]
    .filter((r, i, arr) => arr.findIndex((x) => x.id === r.id) === i)
    .sort((a, b) => (b.stars || 0) - (a.stars || 0))
    .slice(0, 4)

  const socialLinks = p.social || []
  const linkedIn = socialLinks.find((s) => s.name === 'LinkedIn')?.href
  const twitter = socialLinks.find((s) => s.name === 'Twitter')?.href
  const githubUrl = `github.com/${github.username}`

  const contactParts = [
    p.email && p.email,
    githubUrl,
    linkedIn && linkedIn !== '#' && linkedIn.replace(/^https?:\/\//, ''),
    twitter && twitter.replace(/^https?:\/\//, ''),
    p.phone && p.phone,
  ].filter(Boolean)

  return (
    <div style={pageStyle}>
      {/* Controls — hidden when printing */}
      <div className="no-print" style={{ maxWidth: '700px', margin: '0.75in auto 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/" style={{ fontSize: '12px', color: '#555', textDecoration: 'none' }}>
          ← Back to portfolio
        </Link>
        <button
          onClick={() => window.print()}
          style={{
            padding: '8px 20px',
            background: '#000',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '12px',
            cursor: 'pointer',
          }}
        >
          Download PDF
        </button>
      </div>

      <div ref={printRef} style={{ maxWidth: '700px', margin: '0.75in auto', padding: '0' }}>
        {/* Header */}
        <div style={{ marginBottom: '18px' }}>
          <h1 style={{ fontSize: '20px', fontWeight: 700, margin: 0, lineHeight: 1.2 }}>{p.name}</h1>
          <div style={{ fontSize: '11px', color: '#000', marginTop: '2px', fontWeight: 500 }}>{p.title}</div>
          {p.location && (
            <div style={{ fontSize: '11px', color: '#444', marginTop: '1px' }}>{p.location}</div>
          )}
          <div style={{ fontSize: '10px', color: '#555', marginTop: '6px' }}>
            {contactParts.join('  ·  ')}
          </div>
        </div>

        {/* Professional Summary */}
        {p.bio && (
          <div style={sectionStyle}>
            <div style={sectionHeaderStyle}>Professional Summary</div>
            <p style={{ margin: 0, fontSize: '11px', lineHeight: 1.4 }}>{p.bio}</p>
          </div>
        )}

        {/* Skills */}
        {(skills.length > 0 || languages.length > 0) && (
          <div style={sectionStyle}>
            <div style={sectionHeaderStyle}>Skills</div>
            {skills.length > 0 ? (
              skills.map((cat, i) => (
                <div key={i} style={{ marginBottom: '4px', fontSize: '11px', lineHeight: 1.5 }}>
                  <span style={{ fontWeight: 600 }}>{cat.name}: </span>
                  {cat.skills.map((s) => s.name).join(', ')}
                </div>
              ))
            ) : (
              <div style={{ fontSize: '11px', lineHeight: 1.5 }}>
                <span style={{ fontWeight: 600 }}>Languages: </span>
                {languages.map((l) => `${l.name} (${l.percentage}%)`).join(', ')}
              </div>
            )}
          </div>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <div style={sectionStyle}>
            <div style={sectionHeaderStyle}>Experience</div>
            {experience.map((exp, i) => (
              <div key={i} style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontSize: '11px' }}>
                  <div>
                    <span style={{ fontWeight: 700 }}>{exp.company}</span>
                    {exp.role && <span> — {exp.role}</span>}
                  </div>
                  {exp.period && <span style={{ fontSize: '10px', color: '#555', whiteSpace: 'nowrap', marginLeft: '12px' }}>{exp.period}</span>}
                </div>
                {exp.description && (
                  <p style={{ margin: '3px 0 0 0', fontSize: '11px', lineHeight: 1.4 }}>{exp.description}</p>
                )}
                {exp.highlights && exp.highlights.filter(Boolean).length > 0 && (
                  <ul style={{ margin: '4px 0 0 0', paddingLeft: '16px', fontSize: '11px', lineHeight: 1.5 }}>
                    {exp.highlights.filter(Boolean).map((h, hi) => (
                      <li key={hi}>{h}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Education */}
        {education.length > 0 && (
          <div style={sectionStyle}>
            <div style={sectionHeaderStyle}>Education</div>
            {education.map((edu, i) => (
              <div key={i} style={{ marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontSize: '11px' }}>
                  <div>
                    <span style={{ fontWeight: 700 }}>{edu.school}</span>
                    {edu.degree && <span> — {edu.degree}</span>}
                    {edu.field && <span>, {edu.field}</span>}
                  </div>
                  {edu.year && <span style={{ fontSize: '10px', color: '#555', whiteSpace: 'nowrap', marginLeft: '12px' }}>{edu.year}</span>}
                </div>
                {edu.notes && (
                  <p style={{ margin: '2px 0 0 0', fontSize: '11px', lineHeight: 1.4, color: '#444' }}>{edu.notes}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Projects */}
        {allProjects.length > 0 && (
          <div style={sectionStyle}>
            <div style={sectionHeaderStyle}>Projects</div>
            {allProjects.map((r) => (
              <div key={r.id} style={{ marginBottom: '8px' }}>
                <div style={{ fontSize: '11px', fontWeight: 600 }}>
                  <a
                    href={r.url || `https://github.com/${github.username}/${r.title}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#000', textDecoration: 'underline' }}
                  >
                    {r.title}
                  </a>
                  {r.description && <span style={{ fontWeight: 400 }}> — {r.description}</span>}
                </div>
                {r.tags && r.tags.length > 0 && (
                  <div style={{ fontSize: '10px', color: '#555', marginTop: '1px' }}>
                    Tech: {r.tags.join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Print styles */}
      <style>{`
        @page { size: A4; margin: 0.75in; }
        @media print {
          .no-print { display: none !important; }
          body { margin: 0; padding: 0; }
        }
      `}</style>
    </div>
  )
}
