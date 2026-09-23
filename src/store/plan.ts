import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { successFeedback, tapFeedback } from '../lib/native-ui'
import { PLAN_YEAR, SEED_BLOCKS, SEED_MONTHS, SEED_RESOURCES, SEED_SLOTS } from '../lib/seed'
import { deviceStorage } from '../lib/storage'
import type { MonthPlan, RoutineBlock, TimeSlot } from '../lib/types'

interface PlanState {
  year: number
  months: MonthPlan[]
  blocks: RoutineBlock[]
  slots: TimeSlot[]
  resources: string[]
  /** `YYYY-MM-DD` → the ids of the blocks closed that day. The habit half of the app. */
  log: Record<string, string[]>
  seeded: boolean

  applySeed: () => void
  updateMonth: (month: number, patch: Partial<MonthPlan>) => void
  toggleBlock: (date: string, blockId: string) => void
  addResource: (name: string) => void
  removeResource: (name: string) => void
  replaceAll: (next: Pick<PlanState, 'year' | 'months' | 'blocks' | 'slots' | 'resources' | 'log'>) => void
}

/** Local date, not ISO/UTC: a day ends at the user's midnight, not London's. */
export function dayKey(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/**
 * The inverse. Built from parts rather than `new Date(key)`, which parses `YYYY-MM-DD` as
 * UTC midnight and lands on the previous day for anyone west of Greenwich.
 */
export function fromDayKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export const usePlan = create<PlanState>()(
  persist(
    (set) => ({
      year: PLAN_YEAR,
      months: [],
      blocks: [],
      slots: [],
      resources: [],
      log: {},
      seeded: false,

      applySeed: () =>
        set((s) => {
          if (s.seeded) return s
          return {
            year: PLAN_YEAR,
            months: SEED_MONTHS,
            blocks: SEED_BLOCKS,
            slots: SEED_SLOTS,
            resources: SEED_RESOURCES,
            seeded: true,
          }
        }),

      updateMonth: (month, patch) =>
        set((s) => ({
          months: s.months.map((m) => (m.month === month ? { ...m, ...patch } : m)),
        })),

      toggleBlock: (date, blockId) =>
        set((s) => {
          const current = s.log[date] ?? []
          const next = current.includes(blockId)
            ? current.filter((id) => id !== blockId)
            : [...current, blockId]
          // A day with every block closed is the thing streaks are counted from, so it is
          // the one that gets the heavier feedback.
          const closedTheDay = next.length === s.blocks.length && next.length > current.length
          if (closedTheDay) successFeedback()
          else tapFeedback()

          const log = { ...s.log }
          // An empty array would keep the date in storage forever and make the log grow by
          // one key per day opened but not worked.
          if (next.length) log[date] = next
          else delete log[date]
          return { log }
        }),

      addResource: (name) =>
        set((s) => {
          const clean = name.trim()
          if (!clean || s.resources.includes(clean)) return s
          return { resources: [...s.resources, clean] }
        }),

      removeResource: (name) => set((s) => ({ resources: s.resources.filter((r) => r !== name) })),

      replaceAll: (next) => set({ ...next, seeded: true }),
    }),
    {
      name: 'goalstable-plan-v1',
      version: 1,
      storage: createJSONStorage(() => deviceStorage),
      partialize: (s) => ({
        year: s.year,
        months: s.months,
        blocks: s.blocks,
        slots: s.slots,
        resources: s.resources,
        log: s.log,
        seeded: s.seeded,
      }),
      onRehydrateStorage: () => (state) => {
        if (state && !state.seeded) state.applySeed()
      },
    },
  ),
)

function isFullDay(log: Record<string, string[]>, blocks: RoutineBlock[], date: string): boolean {
  const done = log[date]
  return !!done && blocks.length > 0 && blocks.every((b) => done.includes(b.id))
}

/**
 * Consecutive full days ending today.
 *
 * A day that is not finished yet does not break the streak — at nine in the morning
 * nothing is done and the honest count is still yesterday's. So an incomplete *today* is
 * skipped rather than counted as a miss; any earlier incomplete day ends it.
 */
export function currentStreak(log: Record<string, string[]>, blocks: RoutineBlock[], today = new Date()): number {
  const cursor = new Date(today)
  if (!isFullDay(log, blocks, dayKey(cursor))) cursor.setDate(cursor.getDate() - 1)

  let streak = 0
  while (isFullDay(log, blocks, dayKey(cursor))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

/** The last `days` dates, oldest first — the row of dots on the Today screen. */
export function recentDays(days: number, today = new Date()): string[] {
  const out: string[] = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    out.push(dayKey(d))
  }
  return out
}

export function blocksDone(log: Record<string, string[]>, date: string): string[] {
  return log[date] ?? []
}

/**
 * The money column, added up. The cells are free text ("+ $2000"), so this pulls the
 * digits out and ignores anything it cannot read rather than guessing.
 */
export function plannedMoney(months: MonthPlan[]): number {
  return months.reduce((sum, m) => {
    const digits = m.money.replace(/[^\d]/g, '')
    return sum + (digits ? Number(digits) : 0)
  }, 0)
}

export type { TimeSlot }
