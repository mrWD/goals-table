/**
 * The spreadsheet had three kinds of thing in it, and they stay three kinds of thing here:
 * a goal that belongs to a year and is either done or not, a month that says what to work
 * on, and a routine that says when.
 */

/**
 * The columns of the original sheet were years, plus one headed "Backlog" — the someday
 * list, which is not a year and must not be averaged into the yearly statistics.
 */
export const BACKLOG = 'backlog'
export type Bucket = number | typeof BACKLOG

export function isYear(bucket: Bucket): bucket is number {
  return typeof bucket === 'number'
}

/**
 * Categories are inferred from the title (see `categorize`) rather than typed in, because
 * seven years of rows arrived without them. An inferred one can always be overridden, and
 * the override is what gets stored.
 */
export type Category = 'tech' | 'lang' | 'money' | 'health' | 'life' | 'project'

export const CATEGORIES: Category[] = ['tech', 'lang', 'money', 'health', 'life', 'project']

export interface Goal {
  id: string
  title: string
  bucket: Bucket
  done: boolean
  category: Category
  /** Set when the category was chosen by hand, so re-categorising never overwrites it. */
  pinnedCategory?: boolean
  note?: string
  /** ISO date. Absent on the rows imported from the sheet, which carry no history. */
  doneAt?: string
  createdAt: string
}

export interface MonthPlan {
  /** 0-11. The year is the plan's, not the month's. */
  month: number
  /** What the month is for: courses, topics, whatever the row said. */
  focus: string[]
  /** Free text, as in the sheet ("+ $2000"). Parsed for totals, never for arithmetic. */
  money: string
  /** Language targets, kept apart from focus because the sheet kept them apart. */
  langs: string[]
}

export interface YearPlan {
  year: number
  months: MonthPlan[]
}

/** One of the three hours the day is divided into. */
export interface RoutineBlock {
  id: string
  label: string
  hours: number
}

/** A row from the time column: a slot, and what it is reserved for if anything. */
export interface TimeSlot {
  time: string
  label?: string
}

// Month names are not a list here: they come from `Intl` in the active language.
// See lib/format.ts.
