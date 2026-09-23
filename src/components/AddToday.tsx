import { useEffect, useMemo, useRef, useState } from 'react'
import { categorize } from '../lib/categorize'
import { categoryKey, monthName } from '../lib/format'
import { CATEGORIES, isYear, type Category, type MonthPlan } from '../lib/types'
import { bucketLabel, useGoals } from '../store/goals'
import { useLocale, useT } from '../store/lang'
import { usePlan } from '../store/plan'
import { useUi } from '../store/ui'
import { PlusIcon, SearchIcon } from './Icons'

/**
 * Putting something into today.
 *
 * Three things happen on a given day and none of them had a route in: deciding to learn
 * something new, having already learnt it, and pulling something forward — out of a past
 * year, out of next year, out of the backlog — because today is when it is actually being
 * done.
 *
 * "Today" is not its own bucket in this app, and inventing one would split the year's
 * record in two. What the Today screen shows is the **current month's focus**, so that is
 * what these three routes write to: the goal joins the plan year and its title joins this
 * month. It then appears under "Still open from this month" — or, if it was already done,
 * under "Done today".
 */
export function AddTodayFab({ month }: { month: MonthPlan | undefined }) {
  const [open, setOpen] = useState(false)
  const t = useT()

  return (
    <>
      <div className="fab-spacer" aria-hidden="true" />
      <button type="button" className="fab" onClick={() => setOpen(true)} aria-label={t('today_add')}>
        <PlusIcon size={24} />
      </button>
      {open && <TodaySheet month={month} onClose={() => setOpen(false)} />}
    </>
  )
}

type Tab = 'new' | 'move'

function TodaySheet({ month, onClose }: { month: MonthPlan | undefined; onClose: () => void }) {
  const [tab, setTab] = useState<Tab>('new')
  const t = useT()
  const locale = useLocale()

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div
        className="sheet"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={t('today_add')}
      >
        <h2 className="sheet-title">
          {month ? monthName(month.month, locale) : t('today_add')}
        </h2>

        <div className="chips tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'new'}
            className={`chip${tab === 'new' ? ' is-active' : ''}`}
            onClick={() => setTab('new')}
          >
            {t('add_goal')}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'move'}
            className={`chip${tab === 'move' ? ' is-active' : ''}`}
            onClick={() => setTab('move')}
          >
            {t('add_tab_move')}
          </button>
        </div>

        {tab === 'new' ? (
          <NewGoal month={month} onClose={onClose} />
        ) : (
          <MoveGoal month={month} onClose={onClose} />
        )}
      </div>
    </div>
  )
}

/** Appends a title to a month's focus, without duplicating one already there. */
function useAddToMonth() {
  const { updateMonth, months } = usePlan()
  return (month: MonthPlan | undefined, title: string) => {
    if (!month) return
    const current = months.find((m) => m.month === month.month)?.focus ?? []
    if (current.includes(title)) return
    updateMonth(month.month, { focus: [...current, title] })
  }
}

function NewGoal({ month, onClose }: { month: MonthPlan | undefined; onClose: () => void }) {
  const add = useGoals((s) => s.add)
  const toggle = useGoals((s) => s.toggle)
  const year = usePlan((s) => s.year)
  const addToMonth = useAddToMonth()
  const showToast = useUi((s) => s.showToast)
  const t = useT()
  const locale = useLocale()

  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<Category | ''>('')
  /** "I already did this today" — the other half of why someone opens this at all. */
  const [alreadyDone, setAlreadyDone] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const guessed = useMemo(() => (title.trim() ? categorize(title) : 'tech'), [title])
  const effective = category || guessed

  const submit = () => {
    if (!title.trim()) return
    const id = add(title, year, category || undefined)
    if (!id) return
    // Ticking through `toggle` rather than storing done:true directly, so the goal gets its
    // doneAt and the haptic — this is the same event as ticking it by hand.
    if (alreadyDone) toggle(id)
    addToMonth(month, title.trim())
    showToast(
      month
        ? t('toast_moved', { month: monthName(month.month, locale) })
        : t('toast_added', { bucket: String(year) }),
    )
    setTitle('')
    setCategory('')
    setAlreadyDone(false)
    inputRef.current?.focus()
  }

  return (
    <form
      className="add-form"
      onSubmit={(e) => {
        e.preventDefault()
        submit()
      }}
    >
      <input
        ref={inputRef}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={t('add_placeholder')}
        aria-label={t('goal_title_label')}
        enterKeyHint="done"
      />

      <div className="add-row">
        <label>
          <span>{t('goal_category')}</span>
          <select value={effective} onChange={(e) => setCategory(e.target.value as Category)}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {t(categoryKey(c))}
              </option>
            ))}
          </select>
        </label>
      </div>

      <button
        type="button"
        className={`toggle-row${alreadyDone ? ' is-on' : ''}`}
        onClick={() => setAlreadyDone((v) => !v)}
        role="checkbox"
        aria-checked={alreadyDone}
      >
        <span className={`check${alreadyDone ? ' is-on' : ''}`} aria-hidden="true">
          {alreadyDone && '✓'}
        </span>
        {t('add_done_already')}
      </button>

      <div className="sheet-actions">
        <button type="button" className="btn" onClick={onClose}>
          {t('common_done')}
        </button>
        <button type="submit" className="btn btn-primary" disabled={!title.trim()}>
          {t('common_add')}
        </button>
      </div>
    </form>
  )
}

function MoveGoal({ month, onClose }: { month: MonthPlan | undefined; onClose: () => void }) {
  const goals = useGoals((s) => s.goals)
  const move = useGoals((s) => s.move)
  const year = usePlan((s) => s.year)
  const addToMonth = useAddToMonth()
  const showToast = useUi((s) => s.showToast)
  const t = useT()
  const locale = useLocale()
  const [query, setQuery] = useState('')

  /**
   * Everything that is not already in this month — other years, the backlog, and the
   * current year's own goals that this month simply does not list yet. All three are the
   * same wish: do this one now.
   */
  const candidates = useMemo(() => {
    const inMonth = new Set(month?.focus ?? [])
    const q = query.trim().toLowerCase()
    return Object.values(goals)
      .filter((g) => !inMonth.has(g.title))
      .filter((g) => !q || g.title.toLowerCase().includes(q))
      .sort((a, b) => {
        // Not-done first — moving a finished goal into this month is the rarer intent —
        // then by bucket, newest year first and the backlog last.
        if (a.done !== b.done) return Number(a.done) - Number(b.done)
        const av = isYear(a.bucket) ? a.bucket : -1
        const bv = isYear(b.bucket) ? b.bucket : -1
        return bv - av
      })
      .slice(0, 60)
  }, [goals, month, query])

  const pick = (id: string, title: string, bucket: string) => {
    if (bucket !== String(year)) move(id, year)
    addToMonth(month, title)
    showToast(
      month ? t('toast_moved', { month: monthName(month.month, locale) }) : t('toast_added', { bucket: String(year) }),
    )
    onClose()
  }

  return (
    <div className="move-pane">
      <div className="search">
        <SearchIcon size={18} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('archive_search')}
          aria-label={t('archive_search')}
          autoFocus
        />
      </div>

      {candidates.length ? (
        <div className="picker-options move-options">
          {candidates.map((g) => (
            <button
              key={g.id}
              type="button"
              className="picker-option"
              onClick={() => pick(g.id, g.title, String(g.bucket))}
            >
              <span className={`dot cat-${g.category}`} />
              <span className="picker-option-title">{g.title}</span>
              <span className="move-bucket">{bucketLabel(g.bucket, t('backlog'))}</span>
              {g.done && <span className="picker-option-done">✓</span>}
            </button>
          ))}
        </div>
      ) : (
        <p className="card-note">{t('archive_no_match')}</p>
      )}

      <div className="sheet-actions">
        <button type="button" className="btn" onClick={onClose}>
          {t('common_cancel')}
        </button>
      </div>
    </div>
  )
}
