import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { categorize } from '../lib/categorize'
import { successFeedback, tapFeedback } from '../lib/native-ui'
import { buildSeedGoals } from '../lib/seed'
import { deviceStorage } from '../lib/storage'
import { BACKLOG, type Bucket, type Category, type Goal, isYear } from '../lib/types'

interface GoalsState {
  goals: Record<string, Goal>
  /** Set once the demo goals have been laid down, so an emptied year is not refilled. */
  seeded: boolean

  applySeed: () => void
  /**
   * `category` overrides the one inferred from the title, and counts as hand-picked.
   * Returns the new id, so a caller that has to act on the goal straight away — marking it
   * done, putting it in a month — does not have to search for what it just created.
   */
  add: (title: string, bucket: Bucket, category?: Category) => string | undefined
  toggle: (id: string) => void
  rename: (id: string, title: string) => void
  setCategory: (id: string, category: Category) => void
  move: (id: string, bucket: Bucket) => void
  remove: (id: string) => void
  replaceAll: (goals: Goal[]) => void
}

function makeId(): string {
  return `g${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`
}

export const useGoals = create<GoalsState>()(
  persist(
    (set) => ({
      goals: {},
      seeded: false,

      /**
       * First run only. Guarded on `seeded` rather than on the goals being empty, because
       * someone who deletes every goal on purpose should get an empty app, not the
       * demo back.
       */
      applySeed: () =>
        set((s) => {
          if (s.seeded) return s
          const goals: Record<string, Goal> = { ...s.goals }
          for (const goal of buildSeedGoals()) goals[goal.id] ??= goal
          return { goals, seeded: true }
        }),

      add: (title, bucket, category) => {
        const clean = title.trim()
        if (!clean) return undefined
        // The id is minted outside `set` so it can be returned; `set` stays a pure update.
        const id = makeId()
        set((s) => ({
          goals: {
            ...s.goals,
            [id]: {
              id,
              title: clean,
              bucket,
              done: false,
              category: category ?? categorize(clean),
              pinnedCategory: category !== undefined,
              createdAt: new Date().toISOString(),
            },
          },
        }))
        return id
      },

      toggle: (id) =>
        set((s) => {
          const goal = s.goals[id]
          if (!goal) return s
          const done = !goal.done
          if (done) successFeedback()
          else tapFeedback()
          return {
            goals: {
              ...s.goals,
              // doneAt is dropped on un-ticking: a goal that is not done has no date on
              // which it was, and a stale one would distort the year's timeline.
              [id]: { ...goal, done, doneAt: done ? new Date().toISOString() : undefined },
            },
          }
        }),

      rename: (id, title) =>
        set((s) => {
          const goal = s.goals[id]
          const clean = title.trim()
          if (!goal || !clean) return s
          // A hand-picked category survives a rename; an inferred one is re-inferred,
          // because the title is all it was ever based on.
          const category = goal.pinnedCategory ? goal.category : categorize(clean)
          return { goals: { ...s.goals, [id]: { ...goal, title: clean, category } } }
        }),

      setCategory: (id, category) =>
        set((s) => {
          const goal = s.goals[id]
          if (!goal) return s
          return { goals: { ...s.goals, [id]: { ...goal, category, pinnedCategory: true } } }
        }),

      move: (id, bucket) =>
        set((s) => {
          const goal = s.goals[id]
          if (!goal) return s
          return { goals: { ...s.goals, [id]: { ...goal, bucket } } }
        }),

      remove: (id) =>
        set((s) => {
          const goals = { ...s.goals }
          delete goals[id]
          return { goals }
        }),

      /** Used by import. Seeding is marked done so a restored backup is not topped up. */
      replaceAll: (list) =>
        set(() => ({
          goals: Object.fromEntries(list.map((g) => [g.id, g])),
          seeded: true,
        })),
    }),
    {
      name: 'goalstable-goals-v1',
      version: 1,
      storage: createJSONStorage(() => deviceStorage),
      partialize: (s) => ({ goals: s.goals, seeded: s.seeded }),
      onRehydrateStorage: () => (state) => {
        // Nothing stored yet — this is the first launch, so the demo goes in.
        if (state && !state.seeded) state.applySeed()
      },
    },
  ),
)

export interface BucketStats {
  total: number
  done: number
  /** 0-1. A bucket with nothing in it counts as 0, not as complete. */
  ratio: number
}

export function statsFor(goals: Goal[]): BucketStats {
  const done = goals.filter((g) => g.done).length
  return { total: goals.length, done, ratio: goals.length ? done / goals.length : 0 }
}

/** Every bucket that has at least one goal — years newest first, backlog last. */
export function bucketsOf(goals: Record<string, Goal>): Bucket[] {
  const years = new Set<number>()
  let backlog = false
  for (const goal of Object.values(goals)) {
    if (isYear(goal.bucket)) years.add(goal.bucket)
    else backlog = true
  }
  const sorted: Bucket[] = [...years].sort((a, b) => b - a)
  if (backlog) sorted.push(BACKLOG)
  return sorted
}

export function goalsIn(goals: Record<string, Goal>, bucket: Bucket): Goal[] {
  return Object.values(goals).filter((g) => g.bucket === bucket)
}

/**
 * A year prints as itself in every language; the backlog is a word, so its translation is
 * passed in rather than looked up here — this module has no business importing the
 * interface language.
 */
export function bucketLabel(bucket: Bucket, backlogLabel: string): string {
  return isYear(bucket) ? String(bucket) : backlogLabel
}
