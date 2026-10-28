import { App as CapApp } from '@capacitor/app'
import { Capacitor } from '@capacitor/core'
import { useSyncExternalStore } from 'react'

/**
 * Anonymous usage counters, sent once a day — the app's side of mrWD/app-metrics.
 *
 * The contract is `docs/CLIENT.md` in that repository, and its server refuses anything
 * that strays from it, so read that before changing what goes out. In short: counts of
 * fixed event names and error kinds pile up here, on the device, and leave in one ping at
 * the first launch of a local day. No identifier of any kind, no titles, nothing typed, no
 * error messages, nothing finer than the date. The switch in Profile turns it off and
 * drops whatever was counted.
 *
 * Added on 2026-10-28 with the owner's consent; before that the app sent nothing at all,
 * which is why installs from then carry the `legacy` cohort (see `initMetrics`).
 */

const APP = 'goals-table'
const KEY = 'goalstable-metrics'
/** Production. In development, point it at app-metrics' `scripts/dev-server.mjs`. */
const ENDPOINT = import.meta.env.VITE_METRICS_URL || 'https://mrwd-metrics.vercel.app/api/ping'

/** The server's limits: a ping with more distinct names than these is refused outright. */
const MAX_EVENTS = 40
const MAX_ERRORS = 20
const EVENT_NAME = /^[a-z][a-z0-9_]{1,31}$/
const ERROR_KIND = /^[A-Za-z][A-Za-z0-9_]{1,31}$/

interface MetricsState {
  enabled: boolean
  installDay: string
  /** ISO week of the first launch with metrics, or `legacy` for someone who was here before. */
  cohort: string
  lastDay?: string
  lastWeek?: string
  lastMonth?: string
  events: Record<string, number>
  errors: Record<string, number>
  /** The one-line notice is still to be dismissed. Stays on the device. */
  notice: boolean
}

/** The device's local date. A day ends at the user's midnight, as the contract asks. */
function localDay(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** ISO 8601 week, as `YYYY-Www` — the same arithmetic as the server's `isoWeek`. */
export function isoWeek(day: string): string {
  const date = new Date(`${day}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() - ((date.getUTCDay() + 6) % 7) + 3)
  const year = date.getUTCFullYear()
  const week = 1 + Math.floor((date.getTime() - Date.UTC(year, 0, 1)) / (7 * 86_400_000))
  return `${year}-W${String(week).padStart(2, '0')}`
}

function read(): MetricsState | null {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as MetricsState) : null
  } catch {
    return null
  }
}

/* The switch and the notice re-render from here; counting alone changes neither. */
const listeners = new Set<() => void>()
let snapshot = { enabled: false, notice: false }

function write(state: MetricsState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    // Full or blocked storage: a lost count is not worth an error.
  }
  if (state.enabled !== snapshot.enabled || state.notice !== snapshot.notice) {
    snapshot = { enabled: state.enabled, notice: state.notice }
    for (const listener of listeners) listener()
  }
}

/** Add to a local counter. Never touches the network; does nothing while switched off. */
export function count(name: string, n = 1): void {
  const state = read()
  if (!state?.enabled || !EVENT_NAME.test(name)) return
  if (!(name in state.events) && Object.keys(state.events).length >= MAX_EVENTS) return
  state.events[name] = (state.events[name] ?? 0) + n
  write(state)
}

/** An error by its kind (`TypeError`, `api_rates`) — never its message. */
export function countError(kind: string): void {
  const state = read()
  if (!state?.enabled) return
  let key = ERROR_KIND.test(kind) ? kind : 'Other'
  // One slot is kept back for `Other`, so an unusual error can never push a ping over the limit.
  if (!(key in state.errors) && Object.keys(state.errors).length >= MAX_ERRORS - 1) key = 'Other'
  state.errors[key] = (state.errors[key] ?? 0) + 1
  write(state)
}

const kindOf = (error: unknown): string => (error instanceof Error ? error.name : 'Other')

let version: Promise<string> | undefined

/** `1.0 (3)` in the store builds; the build date on the web, which has no version number. */
function appVersion(): Promise<string> {
  version ??= Capacitor.isNativePlatform()
    ? CapApp.getInfo()
        .then(({ version: v, build }) => `${v} (${build})`.replace(/[^0-9A-Za-z.()\- ]/g, '').slice(0, 24))
        .catch(() => 'unknown')
    : Promise.resolve(__BUILD_TIME__.slice(0, 10))
  return version
}

const minus = (from: Record<string, number>, sent: Record<string, number>) => {
  const left: Record<string, number> = {}
  for (const [name, n] of Object.entries(from)) if (n > (sent[name] ?? 0)) left[name] = n - (sent[name] ?? 0)
  return left
}

let currentLang = () => 'en'
let sending = false

/** At most one ping per local day, with everything counted since the last one that got through. */
export async function flush(): Promise<void> {
  const state = read()
  const day = localDay()
  if (sending || !state?.enabled || state.lastDay === day) return
  sending = true
  try {
    const week = isoWeek(day)
    const month = day.slice(0, 7)
    const ever = state.lastDay === undefined && state.cohort !== 'legacy'
    // The server takes a first-ever ping only with its own week as the cohort. A first
    // launch that never got through — offline, or switched off — joins the week it does.
    const cohort = ever ? week : state.cohort
    const body = {
      v: 1,
      app: APP,
      platform: Capacitor.getPlatform(),
      version: await appVersion(),
      lang: currentLang(),
      day,
      cohort,
      first: { ever, week: state.lastWeek !== week, month: state.lastMonth !== month },
      events: state.events,
      errors: state.errors,
    }
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      // text/plain keeps the browser from sending a CORS preflight first.
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(body),
      keepalive: true,
    })
    // 400 is a bug here, 429/503 a busy server: either way nothing changes, and the
    // counters go out with the next launch.
    if (response.status !== 204) return
    // Re-read: whatever was counted while the request was out stays for tomorrow.
    const now = read() ?? state
    write({
      ...now,
      cohort,
      lastDay: day,
      lastWeek: week,
      lastMonth: month,
      events: minus(now.events, body.events),
      errors: minus(now.errors, body.errors),
    })
  } catch {
    // Offline. Everything stays where it is.
  } finally {
    sending = false
  }
}

/**
 * Once, after the stores have loaded and before the first render.
 *
 * `hasUserData` is asked only on the first launch of a build with metrics: someone who
 * already had goals of their own gets the `legacy` cohort, so the rollout does not look
 * like a wave of installs. Global Privacy Control, where a browser sends it, starts the
 * switch off.
 */
export function initMetrics(options: { hasUserData: () => boolean; lang: () => string }): void {
  currentLang = options.lang
  let state = read()
  if (!state) {
    const day = localDay()
    const gpc =
      !Capacitor.isNativePlatform() &&
      (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl === true
    state = {
      enabled: !gpc,
      installDay: day,
      cohort: options.hasUserData() ? 'legacy' : isoWeek(day),
      events: {},
      errors: {},
      // Under GPC nothing is sent, and a notice saying otherwise would be untrue.
      notice: !gpc,
    }
    write(state)
  }
  snapshot = { enabled: state.enabled, notice: state.notice }

  window.addEventListener('error', (event) => countError(kindOf(event.error)))
  window.addEventListener('unhandledrejection', (event) => countError(kindOf(event.reason)))
  // Coming back to the foreground. Natively `resume` is the reliable signal; the web view's
  // visibilitychange usually fires too, and `flush` sends at most once a day either way.
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') void flush()
  })
  if (Capacitor.isNativePlatform()) void CapApp.addListener('resume', () => void flush())
  void flush()
}

/** Off clears what was counted and sends nothing more. On again keeps the cohort. */
export function setMetricsEnabled(enabled: boolean): void {
  const state = read()
  if (!state) return
  write(enabled ? { ...state, enabled, notice: false } : { ...state, enabled, notice: false, events: {}, errors: {} })
}

export function dismissMetricsNotice(): void {
  const state = read()
  if (state) write({ ...state, notice: false })
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** The switch's position and whether the notice is still due. */
export function useMetrics(): { enabled: boolean; notice: boolean } {
  return useSyncExternalStore(subscribe, () => snapshot)
}
