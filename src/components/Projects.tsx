import { useState } from 'react'
import {
  ALL_PRODUCTS_URL,
  PROJECT_TYPES,
  PROJECTS,
  STATUS_KEY,
  TYPE_KEY,
  type ProjectType,
} from '../lib/projects'
import { siteLink } from '../lib/from-app'
import { useT } from '../store/lang'

/**
 * The author's other projects, grouped by what they are.
 *
 * Grouped rather than badged per row: with ten projects across four kinds, the type is the
 * thing that decides whether a link is worth following at all — an iPhone app is not
 * useful to someone reading this in a desktop browser, and a Chrome extension is not
 * useful to anyone reading it on a phone.
 *
 * Collapsed by default. This is the bottom of a settings screen, not the point of the app.
 */
export function Projects() {
  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState<ProjectType | 'all'>('all')
  const t = useT()

  const visible = filter === 'all' ? PROJECTS : PROJECTS.filter((p) => p.type === filter)
  const groups = PROJECT_TYPES.map((type) => ({
    type,
    items: visible.filter((p) => p.type === type),
  })).filter((g) => g.items.length)

  return (
    <section className="card">
      <button type="button" className="card-head as-button" onClick={() => setOpen((v) => !v)}>
        {t('projects_title')}
        <span className="card-link">{open ? t('common_hide') : String(PROJECTS.length)}</span>
      </button>

      {open && (
        <>
          <div className="chips proj-filter">
            <button
              type="button"
              className={`chip${filter === 'all' ? ' is-active' : ''}`}
              onClick={() => setFilter('all')}
            >
              {t('filter_all')}
            </button>
            {PROJECT_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                className={`chip${filter === type ? ' is-active' : ''}`}
                onClick={() => setFilter(type)}
              >
                {t(TYPE_KEY[type])}
              </button>
            ))}
          </div>

          {groups.map(({ type, items }) => (
            <div key={type} className="proj-group">
              <h3 className="proj-group-head">{t(TYPE_KEY[type])}</h3>
              <ul className="projects">
                {items.map((p) => (
                  <li key={p.name}>
                    {/* Marked from the native app like every link to the author's sites;
                        the two Chrome Web Store pages simply ignore the parameter. */}
                    <a className="project" href={siteLink(p.url)} target="_blank" rel="noreferrer noopener">
                      {/* The tile takes the project's own accent, so a project looks the
                          same here as it does on the products page. */}
                      <span
                        className="project-icon"
                        style={{ background: `${p.accent}22`, borderColor: `${p.accent}55` }}
                        aria-hidden="true"
                      >
                        {p.icon}
                      </span>
                      <span className="project-body">
                        <span className="project-name">{p.name}</span>
                        <span className="project-tagline">{p.tagline}</span>
                      </span>
                      <span className="project-status" style={{ color: p.accent }}>
                        {t(STATUS_KEY[p.status])}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <p className="card-note proj-all">
            <a href={siteLink(ALL_PRODUCTS_URL)} target="_blank" rel="noreferrer noopener">
              {t('projects_all')}
            </a>
          </p>
        </>
      )}
    </section>
  )
}
