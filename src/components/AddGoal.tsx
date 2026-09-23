import { useEffect, useMemo, useRef, useState } from 'react'
import { categorize } from '../lib/categorize'
import { categoryKey } from '../lib/format'
import { BACKLOG, CATEGORIES, type Bucket, type Category } from '../lib/types'
import { bucketLabel, useGoals } from '../store/goals'
import { useT } from '../store/lang'
import { useUi } from '../store/ui'
import { PlusIcon } from './Icons'

/**
 * Adding a goal.
 *
 * It used to be a field at the bottom of the list, which on a year of 74 rows meant
 * scrolling past all of them to find it — reported from the phone as "не понятно как
 * добавлять что-то новое куда либо". So the entry point is now a button that floats above
 * the list wherever goals are shown, and the year is a field in the form rather than
 * something implied by which screen you happened to be on.
 *
 * The sheet stays open after adding, cleared and refocused: goals arrive in batches when
 * planning, and reopening it for each one was the same complaint one step smaller.
 */
export function AddGoalFab({ defaultBucket, buckets }: { defaultBucket: Bucket; buckets: Bucket[] }) {
  const [open, setOpen] = useState(false)
  const t = useT()

  return (
    <>
      {/* The button is fixed, so it floats over whatever the list ends with. This reserves
          the height it covers, otherwise the last goal of a year can never be tapped. */}
      <div className="fab-spacer" aria-hidden="true" />
      <button type="button" className="fab" onClick={() => setOpen(true)} aria-label={t('add_goal')}>
        <PlusIcon size={24} />
      </button>
      {open && <AddSheet defaultBucket={defaultBucket} buckets={buckets} onClose={() => setOpen(false)} />}
    </>
  )
}

function AddSheet({
  defaultBucket,
  buckets,
  onClose,
}: {
  defaultBucket: Bucket
  buckets: Bucket[]
  onClose: () => void
}) {
  const add = useGoals((s) => s.add)
  const showToast = useUi((s) => s.showToast)
  const t = useT()

  const [title, setTitle] = useState('')
  const [bucket, setBucket] = useState<Bucket>(defaultBucket)
  /** Empty means "whatever the title suggests" — the guess is shown, not silently applied. */
  const [category, setCategory] = useState<Category | ''>('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // The guess updates as the title is typed, so the category shown is the one that will be
  // stored — and correcting it is a single tap rather than a later edit.
  const guessed = useMemo(() => (title.trim() ? categorize(title) : 'tech'), [title])
  const effective = category || guessed

  const submit = () => {
    if (!title.trim()) return
    add(title, bucket, category || undefined)
    showToast(t('toast_added', { bucket: bucketLabel(bucket, t('backlog')) }))
    setTitle('')
    setCategory('')
    inputRef.current?.focus()
  }

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div
        className="sheet"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={t('add_goal')}
      >
        <h2 className="sheet-title">{t('add_goal')}</h2>

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
              <span>{t('goal_year')}</span>
              <select
                value={String(bucket)}
                onChange={(e) => setBucket(e.target.value === BACKLOG ? BACKLOG : Number(e.target.value))}
              >
                {buckets.map((b) => (
                  <option key={String(b)} value={String(b)}>
                    {bucketLabel(b, t('backlog'))}
                  </option>
                ))}
              </select>
            </label>
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

          <div className="sheet-actions">
            <button type="button" className="btn" onClick={onClose}>
              {t('common_done')}
            </button>
            <button type="submit" className="btn btn-primary" disabled={!title.trim()}>
              {t('common_add')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
