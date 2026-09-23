import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronIcon, SearchIcon } from '../components/Icons'
import { EmptyState, ProgressRing } from '../components/ui'
import { categoryKey } from '../lib/format'
import { BACKLOG, CATEGORIES, isYear } from '../lib/types'
import { bucketLabel, bucketsOf, goalsIn, statsFor, useGoals } from '../store/goals'
import { useT } from '../store/lang'

/**
 * Every year at once, newest first, with the backlog at the end.
 *
 * The search here is deliberately across all of them: with seven years in the app the
 * question "when did I do Docker?" is a more common one than anything a single year's
 * list answers, and it is the thing the spreadsheet was worst at.
 */
export default function ArchivePage() {
  const goals = useGoals((s) => s.goals)
  const [query, setQuery] = useState('')
  const t = useT()
  const backlog = t('backlog')

  const buckets = useMemo(() => bucketsOf(goals), [goals])
  const all = useMemo(() => Object.values(goals), [goals])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return all
      .filter((g) => g.title.toLowerCase().includes(q))
      .sort((a, b) => {
        // Years descending, backlog last: the same order as the cards below.
        const av = isYear(a.bucket) ? a.bucket : -1
        const bv = isYear(b.bucket) ? b.bucket : -1
        return bv - av || a.title.localeCompare(b.title)
      })
  }, [all, query])

  const lifetime = useMemo(() => statsFor(all.filter((g) => isYear(g.bucket))), [all])
  const yearCount = buckets.filter(isYear).length

  return (
    <main className="page">
      <header className="page-head">
        <p className="eyebrow">{t('archive_eyebrow')}</p>
        <h1>{t('archive_title')}</h1>
        <p className="page-sub">
          {t('archive_summary', { done: lifetime.done, n: yearCount, years: yearCount })}
        </p>
      </header>

      <div className="search">
        <SearchIcon size={18} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('archive_search')}
          aria-label={t('archive_search')}
        />
        {query && (
          <button
            type="button"
            className="search-clear"
            onClick={() => setQuery('')}
            aria-label={t('search_clear')}
          >
            ×
          </button>
        )}
      </div>

      {query ? (
        results.length ? (
          <ul className="results">
            {results.map((g) => (
              <li key={g.id}>
                <Link to={`/archive/${g.bucket}`} className="result">
                  <span className={`dot cat-${g.category}`} />
                  <span className="result-title">{g.title}</span>
                  <span className={`result-year${g.done ? ' is-done' : ''}`}>
                    {bucketLabel(g.bucket, backlog)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState title={t('archive_no_match')} hint={t('archive_no_match_hint', { query })} />
        )
      ) : (
        <div className="year-cards">
          {buckets.map((bucket) => {
            const items = goalsIn(goals, bucket)
            const stats = statsFor(items)
            const top = CATEGORIES.map((c) => ({ c, n: items.filter((i) => i.category === c).length }))
              .filter((x) => x.n)
              .sort((a, b) => b.n - a.n)
              .slice(0, 3)

            return (
              <Link key={String(bucket)} to={`/archive/${bucket}`} className="year-card">
                <ProgressRing
                  ratio={stats.ratio}
                  size={56}
                  label={bucket === BACKLOG ? String(stats.total) : `${Math.round(stats.ratio * 100)}%`}
                />
                <div className="year-card-body">
                  <h2>{bucketLabel(bucket, backlog)}</h2>
                  <p className="year-card-sub">
                    {bucket === BACKLOG
                      ? t('archive_someday', { total: stats.total, n: stats.total })
                      : t('archive_done_of', { done: stats.done, total: stats.total })}
                  </p>
                  <div className="year-card-cats">
                    {top.map(({ c, n }) => (
                      <span key={c} className={`pill cat-${c}`}>
                        {t(categoryKey(c))} {n}
                      </span>
                    ))}
                  </div>
                </div>
                <ChevronIcon size={18} />
              </Link>
            )
          })}
        </div>
      )}
    </main>
  )
}
