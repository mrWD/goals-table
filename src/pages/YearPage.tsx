import { useMemo, useState } from 'react'
import { AddGoalFab } from '../components/AddGoal'
import { GoalList } from '../components/GoalList'
import { SearchIcon } from '../components/Icons'
import { EmptyState, ProgressRing } from '../components/ui'
import { categoryKey } from '../lib/format'
import { CATEGORIES, type Category } from '../lib/types'
import { bucketsOf, goalsIn, statsFor, useGoals } from '../store/goals'
import { useT } from '../store/lang'
import { usePlan } from '../store/plan'

type Filter = 'all' | 'open' | 'done'

/** The current year: the column of the spreadsheet that is still being filled in. */
export default function YearPage() {
  const goals = useGoals((s) => s.goals)
  const year = usePlan((s) => s.year)
  const t = useT()

  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [category, setCategory] = useState<Category | 'all'>('all')

  const buckets = useMemo(() => bucketsOf(goals), [goals])
  const yearGoals = useMemo(() => goalsIn(goals, year), [goals, year])
  const stats = useMemo(() => statsFor(yearGoals), [yearGoals])

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return yearGoals.filter((g) => {
      if (filter === 'open' && g.done) return false
      if (filter === 'done' && !g.done) return false
      if (category !== 'all' && g.category !== category) return false
      return !q || g.title.toLowerCase().includes(q)
    })
  }, [yearGoals, query, filter, category])

  const FILTER_LABEL: Record<Filter, string> = {
    all: t('filter_all'),
    open: t('filter_open'),
    done: t('filter_done'),
  }

  return (
    <main className="page">
      <header className="page-head">
        <p className="eyebrow">{t('year_eyebrow')}</p>
        <h1>{year}</h1>
      </header>

      <section className="card year-summary">
        <ProgressRing ratio={stats.ratio} sub={`${stats.done}/${stats.total}`} />
        <div className="year-legend">
          {CATEGORIES.map((c) => {
            const items = yearGoals.filter((g) => g.category === c)
            if (!items.length) return null
            const done = items.filter((i) => i.done).length
            return (
              <button
                key={c}
                type="button"
                className={`legend-row cat-${c}${category === c ? ' is-active' : ''}`}
                onClick={() => setCategory((prev) => (prev === c ? 'all' : c))}
              >
                <span className={`dot cat-${c}`} />
                <span className="legend-name">{t(categoryKey(c))}</span>
                <span className="legend-bar">
                  <i style={{ width: `${items.length ? (done / items.length) * 100 : 0}%` }} />
                </span>
                <span className="legend-num">
                  {done}/{items.length}
                </span>
              </button>
            )
          })}
        </div>
      </section>

      <div className="search">
        <SearchIcon size={18} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('year_search', { year })}
          aria-label={t('year_search', { year })}
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

      <div className="chips" role="tablist">
        {(['all', 'open', 'done'] as Filter[]).map((f) => (
          <button
            key={f}
            type="button"
            role="tab"
            aria-selected={filter === f}
            className={`chip${filter === f ? ' is-active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {FILTER_LABEL[f]}
          </button>
        ))}
        {category !== 'all' && (
          <button type="button" className="chip is-active" onClick={() => setCategory('all')}>
            {t(categoryKey(category))} ×
          </button>
        )}
      </div>

      {visible.length ? (
        <GoalList goals={visible} buckets={buckets} />
      ) : (
        <EmptyState
          title={t('year_empty')}
          hint={query ? t('year_empty_search') : t('year_empty_hint')}
        />
      )}

      <AddGoalFab defaultBucket={year} buckets={buckets} />
    </main>
  )
}
