import { useState } from 'react'
import { categoryKey } from '../lib/format'
import { bucketLabel, useGoals } from '../store/goals'
import { useT } from '../store/lang'
import { useUi } from '../store/ui'
import { BACKLOG, CATEGORIES, type Bucket, type Category, type Goal } from '../lib/types'
import { Checkbox } from './ui'

/**
 * The goal row, and the editor it opens into.
 *
 * The editor is inline rather than a modal because the common case is fixing a typo in a
 * seven-year-old row while reading the list, and a dialog would take the list away to do
 * it.
 */
function GoalRow({ goal, buckets }: { goal: Goal; buckets: Bucket[] }) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState(goal.title)
  const { toggle, rename, setCategory, move, remove } = useGoals()
  const askConfirm = useUi((s) => s.askConfirm)
  const t = useT()

  const commit = () => {
    if (draft.trim() && draft !== goal.title) rename(goal.id, draft)
    setOpen(false)
  }

  return (
    <li className={`goal${goal.done ? ' is-done' : ''}`}>
      <div className="goal-main">
        <Checkbox checked={goal.done} onChange={() => toggle(goal.id)} label={goal.title} />
        <button type="button" className="goal-title" onClick={() => setOpen((v) => !v)}>
          {goal.title}
        </button>
        <span className={`pill cat-${goal.category}`}>{t(categoryKey(goal.category))}</span>
      </div>

      {open && (
        <div className="goal-editor">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commit()
              if (e.key === 'Escape') {
                setDraft(goal.title)
                setOpen(false)
              }
            }}
            aria-label={t('goal_title_label')}
          />
          <div className="goal-editor-row">
            <label>
              <span>{t('goal_category')}</span>
              <select value={goal.category} onChange={(e) => setCategory(goal.id, e.target.value as Category)}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {t(categoryKey(c))}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>{t('goal_year')}</span>
              <select
                value={String(goal.bucket)}
                onChange={(e) => move(goal.id, e.target.value === BACKLOG ? BACKLOG : Number(e.target.value))}
              >
                {buckets.map((b) => (
                  <option key={String(b)} value={String(b)}>
                    {bucketLabel(b, t('backlog'))}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="goal-editor-actions">
            <button
              type="button"
              className="btn btn-quiet btn-danger"
              onClick={async () => {
                const ok = await askConfirm(t('goal_delete_confirm', { title: goal.title }), {
                  confirmLabel: t('common_delete'),
                  destructive: true,
                })
                if (ok) remove(goal.id)
              }}
            >
              {t('common_delete')}
            </button>
            <button type="button" className="btn btn-primary" onClick={commit}>
              {t('common_done')}
            </button>
          </div>
        </div>
      )}
    </li>
  )
}

interface GoalListProps {
  goals: Goal[]
  buckets: Bucket[]
  /** Off for closed years, where every row is ticked and headings only add noise. */
  groupByCategory?: boolean
}

/**
 * Unticked first, ticked at the bottom.
 *
 * The open half is the part that can still be acted on; in a year that is 61% done, the
 * remaining goals were scattered between long runs of struck-through ones and had to be
 * hunted for. `sort` is stable, so within each half the order the rows already had is kept
 * — the list reorganises around the tick, it does not reshuffle.
 *
 * Ticking a goal does drop it down the list. That is the intended feedback: the thing has
 * left the pile of work.
 */
function openFirst(goals: Goal[]): Goal[] {
  return [...goals].sort((a, b) => Number(a.done) - Number(b.done))
}

export function GoalList({ goals, buckets, groupByCategory = true }: GoalListProps) {
  const t = useT()

  if (!groupByCategory) {
    return (
      <ul className="goals">
        {openFirst(goals).map((g) => (
          <GoalRow key={g.id} goal={g} buckets={buckets} />
        ))}
      </ul>
    )
  }

  // Category order is fixed rather than by size, so a list does not reshuffle itself under
  // the reader every time something is ticked.
  const groups = CATEGORIES.map((category) => ({
    category,
    items: openFirst(goals.filter((g) => g.category === category)),
  })).filter((g) => g.items.length)

  return (
    <>
      {groups.map(({ category, items }) => {
        const done = items.filter((i) => i.done).length
        return (
          <section key={category} className="group">
            <h3 className="group-head">
              <span className={`dot cat-${category}`} />
              {t(categoryKey(category))}
              <em>
                {done}/{items.length}
              </em>
            </h3>
            <ul className="goals">
              {items.map((g) => (
                <GoalRow key={g.id} goal={g} buckets={buckets} />
              ))}
            </ul>
          </section>
        )
      })}
    </>
  )
}
