import { useEffect, useRef, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import type { StringKey } from '../i18n'
import { useT } from '../store/lang'
import { useUi } from '../store/ui'
import { ArchiveIcon, CheckIcon, PlanIcon, ProfileIcon, TodayIcon, YearIcon } from './Icons'

/** Scrolls to the top on navigation. Without it a long year list keeps its offset. */
export function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

const NAV: Array<{ to: string; key: StringKey; Icon: typeof TodayIcon }> = [
  { to: '/today', key: 'nav_today', Icon: TodayIcon },
  { to: '/year', key: 'nav_year', Icon: YearIcon },
  { to: '/plan', key: 'nav_plan', Icon: PlanIcon },
  { to: '/archive', key: 'nav_years', Icon: ArchiveIcon },
  { to: '/profile', key: 'nav_profile', Icon: ProfileIcon },
]

export function BottomNav() {
  const t = useT()
  return (
    <nav className="nav" aria-label={t('nav_main')}>
      {NAV.map(({ to, key, Icon }) => (
        <NavLink key={to} to={to} className={({ isActive }) => `nav-item${isActive ? ' is-active' : ''}`}>
          <Icon size={22} />
          <span>{t(key)}</span>
        </NavLink>
      ))}
    </nav>
  )
}

export function ToastHost() {
  const toast = useUi((s) => s.toast)
  const dismiss = useUi((s) => s.dismissToast)
  if (!toast) return null
  return (
    <button type="button" className="toast" onClick={dismiss} role="status">
      {toast}
    </button>
  )
}

export function ConfirmHost() {
  const confirm = useUi((s) => s.confirm)
  const answer = useUi((s) => s.answerConfirm)
  const t = useT()
  if (!confirm) return null
  return (
    <div className="sheet-backdrop" onClick={() => answer(false)}>
      <div className="sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <p className="sheet-msg">{confirm.message}</p>
        <div className="sheet-actions">
          <button type="button" className="btn" onClick={() => answer(false)}>
            {t('common_cancel')}
          </button>
          <button
            type="button"
            className={`btn btn-primary${confirm.destructive ? ' btn-danger' : ''}`}
            onClick={() => answer(true)}
          >
            {confirm.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

interface ProgressRingProps {
  ratio: number
  size?: number
  label?: string
  sub?: string
}

/** The year at a glance. `ratio` is 0-1; the ring is drawn from 12 o'clock. */
export function ProgressRing({ ratio, size = 88, label, sub }: ProgressRingProps) {
  const stroke = size >= 70 ? 7 : 5
  const r = (size - stroke) / 2
  const circumference = 2 * Math.PI * r
  return (
    <div className="ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} className="ring-track" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          className="ring-value"
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - Math.min(1, Math.max(0, ratio)))}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      {/* Scaled with the ring: "100%" at the summary size does not fit a 56px archive
          card, and clipping the one number the card exists to show is the worst option. */}
      <div className="ring-text" style={{ fontSize: size >= 70 ? 17 : 12 }}>
        <strong>{label ?? `${Math.round(ratio * 100)}%`}</strong>
        {sub && <span>{sub}</span>}
      </div>
    </div>
  )
}

interface CheckboxProps {
  checked: boolean
  onChange: () => void
  label: string
}

/** The one control the whole app is built around — the tick in the spreadsheet column. */
export function Checkbox({ checked, onChange, label }: CheckboxProps) {
  return (
    <button
      type="button"
      className={`check${checked ? ' is-on' : ''}`}
      onClick={onChange}
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
    >
      {checked && <CheckIcon size={16} />}
    </button>
  )
}

interface InlineAddProps {
  placeholder: string
  onAdd: (value: string) => void
}

/** A one-field form that stays open after submitting, for entering several in a row. */
export function InlineAdd({ placeholder, onAdd }: InlineAddProps) {
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const t = useT()

  return (
    <form
      className="inline-add"
      onSubmit={(e) => {
        e.preventDefault()
        if (!value.trim()) return
        onAdd(value)
        setValue('')
        inputRef.current?.focus()
      }}
    >
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
      />
      <button type="submit" className="btn btn-primary" disabled={!value.trim()}>
        {t('common_add')}
      </button>
    </form>
  )
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="empty">
      <p className="empty-title">{title}</p>
      {hint && <p className="empty-hint">{hint}</p>}
    </div>
  )
}
