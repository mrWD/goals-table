import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AddTodayFab } from '../components/AddToday'
import { FlameIcon } from '../components/Icons'
import { MetricsNotice } from '../components/MetricsNotice'
import { Checkbox, EmptyState } from '../components/ui'
import { dayHeading, monthName } from '../lib/format'
import { blocksDone, currentStreak, dayKey, fromDayKey, recentDays, usePlan } from '../store/plan'
import { goalsIn, useGoals } from '../store/goals'
import { useLocale, useT } from '../store/lang'

/**
 * The screen the app opens on.
 *
 * The spreadsheet had two things the other views cannot show: the day split into three
 * hours ("1h : Prof / 1h : Langs / 1h : Others") and the evening's time slots. Those are a
 * routine, and a routine is about today rather than about the year — so they get their own
 * screen, and the year's goals appear here only as the handful the current month is for.
 */
export default function TodayPage() {
  const { months, blocks, slots, log, year, toggleBlock } = usePlan()
  const goals = useGoals((s) => s.goals)
  const [showSlots, setShowSlots] = useState(false)
  const t = useT()
  const locale = useLocale()

  const today = new Date()
  const key = dayKey(today)
  const doneToday = blocksDone(log, key)
  const streak = useMemo(() => currentStreak(log, blocks), [log, blocks])
  // Keyed on the date string, not on the Date object: a new Date() every render would make
  // this memo recompute every render, which is the one thing a memo is for avoiding.
  const last14 = useMemo(() => recentDays(14, fromDayKey(key)), [key])

  // The plan is a 2026 plan; in any other year there is no "this month" to show.
  const monthIndex = today.getFullYear() === year ? today.getMonth() : -1
  const month = months.find((m) => m.month === monthIndex)

  const openThisMonth = useMemo(() => {
    if (!month) return []
    const titles = new Set(month.focus.map((f) => f.toLowerCase()))
    return goalsIn(goals, year).filter((g) => !g.done && titles.has(g.title.toLowerCase()))
  }, [goals, month, year])

  /**
   * Anything ticked today, whatever month or year it belongs to.
   *
   * Without this, marking something as already done made it vanish — it left the open list
   * and there was nothing to show it had been counted. `doneAt` is compared as a local
   * date, not as the ISO string's prefix, which would roll over at UTC midnight.
   */
  const doneTodayGoals = useMemo(
    () => Object.values(goals).filter((g) => g.done && g.doneAt && dayKey(new Date(g.doneAt)) === key),
    [goals, key],
  )

  return (
    <main className="page">
      <header className="page-head">
        <p className="eyebrow">{dayHeading(today, locale)}</p>
        <h1>{t('today_title')}</h1>
      </header>

      <MetricsNotice />

      <section className="card streak-card">
        <div className="streak-top">
          <div className={`streak-count${streak ? ' is-live' : ''}`}>
            <FlameIcon size={20} />
            <strong>{streak}</strong>
            <span>{t('streak_days', { n: streak })}</span>
          </div>
          <span className="streak-note">
            {t('today_blocks_done', { done: doneToday.length, total: blocks.length })}
          </span>
        </div>
        <div className="dots" aria-hidden="true">
          {last14.map((d) => {
            const done = (log[d] ?? []).length
            const full = blocks.length > 0 && done >= blocks.length
            return <span key={d} className={`day-dot${full ? ' is-full' : done ? ' is-part' : ''}`} />
          })}
        </div>
      </section>

      <section className="blocks">
        {blocks.map((b) => (
          <button
            key={b.id}
            type="button"
            className={`block${doneToday.includes(b.id) ? ' is-done' : ''}`}
            onClick={() => toggleBlock(key, b.id)}
            aria-pressed={doneToday.includes(b.id)}
          >
            <span className="block-hours">{b.hours}h</span>
            {/* Not translated: the labels are the user's own data, like goal titles. */}
            <span className="block-label">{b.label}</span>
          </button>
        ))}
      </section>

      {month ? (
        <section className="card">
          <h2 className="card-head">
            {t('today_focus', { month: monthName(month.month, locale) })}
            <Link to="/plan" className="card-link">
              {t('nav_plan')}
            </Link>
          </h2>
          <ul className="focus-list">
            {month.focus.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
          <div className="focus-meta">
            {month.langs.map((l) => (
              <span key={l} className="pill cat-lang">
                {l}
              </span>
            ))}
            {month.money && <span className="pill cat-money">{month.money}</span>}
          </div>
        </section>
      ) : (
        <EmptyState
          title={t('today_no_plan', { year: today.getFullYear() })}
          hint={t('today_no_plan_hint', { year })}
        />
      )}

      {openThisMonth.length > 0 && (
        <section className="card">
          <h2 className="card-head">
            {t('today_open')}
            <Link to="/year" className="card-link">
              {t('nav_year')}
            </Link>
          </h2>
          <ul className="goals">
            {openThisMonth.map((g) => (
              <li key={g.id} className="goal">
                <div className="goal-main">
                  <Checkbox
                    checked={g.done}
                    onChange={() => useGoals.getState().toggle(g.id)}
                    label={g.title}
                  />
                  <span className="goal-title as-text">{g.title}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {doneTodayGoals.length > 0 && (
        <section className="card">
          <h2 className="card-head">{t('today_done_today')}</h2>
          <ul className="goals">
            {doneTodayGoals.map((g) => (
              <li key={g.id} className="goal is-done">
                <div className="goal-main">
                  <Checkbox
                    checked={g.done}
                    onChange={() => useGoals.getState().toggle(g.id)}
                    label={g.title}
                  />
                  <span className="goal-title as-text">{g.title}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="card">
        <button type="button" className="card-head as-button" onClick={() => setShowSlots((v) => !v)}>
          {t('today_slots')}
          <span className="card-link">{showSlots ? t('common_hide') : `${slots.length}`}</span>
        </button>
        {showSlots && (
          <ul className="slots">
            {slots.map((s) => (
              <li key={s.time}>
                <span className="slot-time">{s.time}</span>
                {s.label && <span className="slot-label">{s.label}</span>}
              </li>
            ))}
          </ul>
        )}
      </section>

      <AddTodayFab month={month} />
    </main>
  )
}
