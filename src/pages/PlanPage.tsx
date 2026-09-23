import { useMemo, useState } from 'react'
import { money, monthName } from '../lib/format'
import type { Goal, MonthPlan } from '../lib/types'
import { goalsIn, useGoals } from '../store/goals'
import { useLocale, useT } from '../store/lang'
import { plannedMoney, usePlan } from '../store/plan'

/**
 * The left block of the spreadsheet: twelve months, each with what to study, what to earn
 * and which language level to reach.
 *
 * On a phone this is a column and on a desktop a four-by-three grid, which is how it was
 * laid out in the sheet — the shape carries information (a quarter reads across a row) and
 * a wide screen is the one place it can be kept.
 */
export default function PlanPage() {
  const { year, months, updateMonth } = usePlan()
  const goals = useGoals((s) => s.goals)
  const [editing, setEditing] = useState<number | null>(null)
  const t = useT()
  const locale = useLocale()

  const yearGoals = useMemo(() => goalsIn(goals, year), [goals, year])

  const now = new Date()
  const currentMonth = now.getFullYear() === year ? now.getMonth() : -1
  const total = plannedMoney(months)

  return (
    <main className="page">
      <header className="page-head">
        <p className="eyebrow">{t('plan_eyebrow')}</p>
        <h1>{year}</h1>
        {total > 0 && <p className="page-sub">{t('plan_total', { amount: money(total, locale) })}</p>}
      </header>

      <div className="months">
        {months.map((m) => (
          <MonthCard
            key={m.month}
            month={m}
            year={year}
            yearGoals={yearGoals}
            isCurrent={m.month === currentMonth}
            isEditing={editing === m.month}
            onEdit={() => setEditing(m.month)}
            onClose={() => setEditing(null)}
            onSave={(patch) => {
              updateMonth(m.month, patch)
              setEditing(null)
            }}
          />
        ))}
      </div>
    </main>
  )
}

interface MonthCardProps {
  month: MonthPlan
  year: number
  yearGoals: Goal[]
  isCurrent: boolean
  isEditing: boolean
  onEdit: () => void
  onClose: () => void
  onSave: (patch: Partial<MonthPlan>) => void
}

function MonthCard({
  month,
  year,
  yearGoals,
  isCurrent,
  isEditing,
  onEdit,
  onClose,
  onSave,
}: MonthCardProps) {
  const t = useT()
  const locale = useLocale()

  const long = monthName(month.month, locale)
  const short = monthName(month.month, locale, 'short')

  // The editor is a separate component so that it mounts fresh every time it opens, and
  // its drafts start from what is actually saved. Keeping the drafts in this component
  // instead meant an edit that was cancelled came back the next time the month was
  // opened — this card never unmounts, so its state never reset.
  if (isEditing) {
    return (
      <MonthEditor month={month} year={year} yearGoals={yearGoals} onClose={onClose} onSave={onSave} />
    )
  }

  return (
    <section className={`month${isCurrent ? ' is-current' : ''}`}>
      <h2>
        <span className="month-short">{short}</span>
        <span className="month-full">{long}</span>
        {isCurrent && <em className="now">{t('plan_now')}</em>}
        <button type="button" className="month-edit" onClick={onEdit} aria-label={t('plan_edit_month', { month: long })}>
          {t('plan_edit')}
        </button>
      </h2>
      <ul className="month-focus">
        {month.focus.map((f) => (
          <li key={f}>{f}</li>
        ))}
      </ul>
      <div className="month-meta">
        {month.langs.map((l) => (
          <span key={l} className="pill cat-lang">
            {l}
          </span>
        ))}
        {month.money && <span className="pill cat-money">{month.money}</span>}
      </div>
    </section>
  )
}

function MonthEditor({
  month,
  year,
  yearGoals,
  onClose,
  onSave,
}: {
  month: MonthPlan
  year: number
  yearGoals: Goal[]
  onClose: () => void
  onSave: (patch: Partial<MonthPlan>) => void
}) {
  const t = useT()
  const locale = useLocale()
  const [focus, setFocus] = useState<string[]>(month.focus)
  const [langs, setLangs] = useState<string[]>(month.langs)
  const [moneyDraft, setMoneyDraft] = useState(month.money)

  return (
    <section className="month is-editing">
      <h2>{monthName(month.month, locale)}</h2>

      {/* Languages are picked from the year's language goals, everything else from the
          rest — the sheet kept the two apart, and mixing them here would put "Italian B2"
          in the same list as "Docker Cloud". */}
      <Picker
        label={t('plan_focus')}
        year={year}
        options={yearGoals.filter((g) => g.category !== 'lang')}
        selected={focus}
        onChange={setFocus}
      />
      <Picker
        label={t('plan_langs')}
        year={year}
        options={yearGoals.filter((g) => g.category === 'lang')}
        selected={langs}
        onChange={setLangs}
      />

      <label>
        <span>{t('plan_money')}</span>
        <input value={moneyDraft} onChange={(e) => setMoneyDraft(e.target.value)} />
      </label>

      <div className="month-actions">
        <button type="button" className="btn btn-quiet" onClick={onClose}>
          {t('common_cancel')}
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => onSave({ focus, langs, money: moneyDraft.trim() })}
        >
          {t('common_save')}
        </button>
      </div>
    </section>
  )
}

interface PickerProps {
  label: string
  year: number
  options: Goal[]
  selected: string[]
  onChange: (next: string[]) => void
}

/**
 * Choosing a month's contents from the year's goals.
 *
 * This was two free-text areas, one line per item, which meant retyping goal titles that
 * already existed a screen away — and a typo silently broke the match that Today uses to
 * show what is still open from the month.
 *
 * Free text does not disappear, because the sheet had entries that were never goals
 * ("Good fit, healthy feeling"). Anything selected that is not in the year's list is kept,
 * shown as a removable chip, and can still be typed in.
 */
function Picker({ label, year, options, selected, onChange }: PickerProps) {
  const [query, setQuery] = useState('')
  const [custom, setCustom] = useState('')
  const t = useT()

  const titles = useMemo(() => new Set(options.map((o) => o.title)), [options])
  const extras = selected.filter((s) => !titles.has(s))

  /**
   * What is already chosen, first — a year holds seventy goals, and three ticks somewhere
   * in the middle of that told you nothing about the month you opened.
   *
   * The order is worked out once, when the editor opens, and then frozen. Re-sorting on
   * every tap would make the row you just touched jump to the top and the next one you
   * meant to tap slide under your finger.
   */
  const [order] = useState(() => {
    const chosen = new Set(selected)
    return [...options].sort((a, b) => Number(chosen.has(b.title)) - Number(chosen.has(a.title)))
  })

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return q ? order.filter((o) => o.title.toLowerCase().includes(q)) : order
  }, [order, query])

  const toggle = (title: string) =>
    onChange(selected.includes(title) ? selected.filter((s) => s !== title) : [...selected, title])

  const addCustom = () => {
    const clean = custom.trim()
    if (!clean || selected.includes(clean)) return
    onChange([...selected, clean])
    setCustom('')
  }

  return (
    <div className="picker">
      <span className="picker-label">
        {label}
        <em>{selected.length}</em>
      </span>

      {options.length > 6 && (
        <input
          className="picker-search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('year_search', { year })}
          aria-label={t('year_search', { year })}
        />
      )}

      <div className="picker-options">
        {visible.map((o) => {
          const on = selected.includes(o.title)
          return (
            <button
              key={o.id}
              type="button"
              className={`picker-option${on ? ' is-on' : ''}`}
              onClick={() => toggle(o.title)}
              aria-pressed={on}
            >
              <span className={`dot cat-${o.category}`} />
              <span className="picker-option-title">{o.title}</span>
              {o.done && <span className="picker-option-done">✓</span>}
            </button>
          )
        })}
      </div>

      {extras.length > 0 && (
        <div className="picker-extras">
          {extras.map((e) => (
            <button key={e} type="button" className="picker-extra" onClick={() => toggle(e)}>
              {e} <span aria-hidden="true">×</span>
            </button>
          ))}
        </div>
      )}

      <div className="picker-custom">
        <input
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              addCustom()
            }
          }}
          placeholder={t('month_custom_placeholder')}
          aria-label={t('month_custom_placeholder')}
        />
        <button type="button" className="btn" onClick={addCustom} disabled={!custom.trim()}>
          {t('common_add')}
        </button>
      </div>
    </div>
  )
}
