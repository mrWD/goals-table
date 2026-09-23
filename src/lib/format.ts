import type { Category } from './types'
import type { StringKey } from '../i18n'

/**
 * Everything the interface shows that is not a translated string: month names, dates and
 * amounts. All of it goes through `Intl` with the active locale rather than through lists
 * in the locale files — twelve month names in twenty languages is 240 strings the platform
 * already has, and it has them declined correctly, which a flat list does not.
 */

/** Any non-leap year works; only the month is read out of it. */
const SAMPLE_YEAR = 2021

export function monthName(month: number, locale: string, style: 'long' | 'short' = 'long'): string {
  return new Intl.DateTimeFormat(locale, { month: style }).format(new Date(SAMPLE_YEAR, month, 1))
}

/** The line above "Today": weekday, day and month, however the language orders them. */
export function dayHeading(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale, { weekday: 'long', day: 'numeric', month: 'long' }).format(date)
}

/**
 * The planned total.
 *
 * Deliberately USD rather than the reader's local currency: the amounts come from the
 * spreadsheet, where they were written as dollars. Converting them would invent a rate;
 * relabelling them would state a sum the owner never planned. Only the grouping and the
 * symbol's position follow the language.
 */
export function money(amount: number, locale: string): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function number(value: number, locale: string): string {
  return new Intl.NumberFormat(locale).format(value)
}

/** Category labels live in the locale files; this maps a category to its key. */
export function categoryKey(category: Category): StringKey {
  return `cat_${category}` as StringKey
}
