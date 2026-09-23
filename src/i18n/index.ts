import EN from './locales/en'

/**
 * Interface languages.
 *
 * The list follows the one in AI Job Search — same codes, same "endonym as its own label"
 * rule, so a language is recognisable to someone who cannot read the current interface. It
 * adds Dutch, Czech, Serbian and Bulgarian, which are the languages left over from the
 * owner's own backlog, plus Korean and Indonesian.
 *
 * Alphabetically by code, as system lists usually have them.
 */
export const UI_LANGS = {
  ar: 'العربية',
  bg: 'Български',
  cs: 'Čeština',
  de: 'Deutsch',
  en: 'English',
  es: 'Español',
  fr: 'Français',
  hi: 'हिन्दी',
  id: 'Bahasa Indonesia',
  it: 'Italiano',
  ja: '日本語',
  ko: '한국어',
  nl: 'Nederlands',
  pl: 'Polski',
  pt: 'Português',
  ru: 'Русский',
  sr: 'Српски',
  tr: 'Türkçe',
  uk: 'Українська',
  zh: '中文',
} as const

export type LangCode = keyof typeof UI_LANGS

/** Written right to left — the app sets `dir="rtl"` for these. */
export const RTL_LANGS = new Set<LangCode>(['ar'])

export type Strings = typeof EN
export type StringKey = keyof Strings

/**
 * All six categories `Intl.PluralRules` can return. English needs two, Russian and Polish
 * four, Arabic all six — so a locale file is typed against this rather than against the
 * shape English happens to have, which would reject `few` and `many` as unknown keys.
 */
export type PluralForms = {
  zero?: string
  one?: string
  two?: string
  few?: string
  many?: string
  other: string
}

/** What a locale file exports: any subset of the keys, plurals in that language's forms. */
export type LocaleStrings = {
  [K in StringKey]?: Strings[K] extends string ? string : PluralForms
}

/**
 * Locales are loaded on demand, one chunk each, rather than all twenty being bundled into
 * the first paint. English is static because it is the fallback and has to be there before
 * anything can render. The chunks are precached by the service worker and shipped inside
 * the native app, so a language still switches with no network.
 */
const LOADERS: Record<LangCode, () => Promise<{ default: LocaleStrings }>> = {
  ar: () => import('./locales/ar'),
  bg: () => import('./locales/bg'),
  cs: () => import('./locales/cs'),
  de: () => import('./locales/de'),
  en: () => Promise.resolve({ default: EN }),
  es: () => import('./locales/es'),
  fr: () => import('./locales/fr'),
  hi: () => import('./locales/hi'),
  id: () => import('./locales/id'),
  it: () => import('./locales/it'),
  ja: () => import('./locales/ja'),
  ko: () => import('./locales/ko'),
  nl: () => import('./locales/nl'),
  pl: () => import('./locales/pl'),
  pt: () => import('./locales/pt'),
  ru: () => import('./locales/ru'),
  sr: () => import('./locales/sr'),
  tr: () => import('./locales/tr'),
  uk: () => import('./locales/uk'),
  zh: () => import('./locales/zh'),
}

const cache = new Map<LangCode, Strings>([['en', EN]])

export async function loadLocale(code: LangCode): Promise<Strings> {
  const hit = cache.get(code)
  if (hit) return hit
  try {
    const mod = await LOADERS[code]()
    // Merged over English so a key added here but not yet translated shows the English
    // word rather than the raw key — a half-translated screen still reads.
    const merged = { ...EN, ...mod.default } as Strings
    cache.set(code, merged)
    return merged
  } catch {
    // A chunk that will not load (offline before it was ever cached, a corrupt asset)
    // must not leave the app blank.
    return EN
  }
}

export function isLangCode(value: string): value is LangCode {
  return value in UI_LANGS
}

/**
 * The system language, so the first launch is not in a foreign one.
 *
 * `navigator.languages` is in the user's own order of preference, so the first entry the
 * app actually has is the best answer — someone whose list is [sv, de, en] is better served
 * German than English. Regional tags are cut to the base language: `pt-BR` is Portuguese.
 */
export function systemLang(fallback: LangCode = 'en'): LangCode {
  const preferred = navigator.languages?.length ? navigator.languages : [navigator.language]
  for (const tag of preferred) {
    const base = tag?.toLowerCase().split('-')[0]
    if (base && isLangCode(base)) return base
  }
  return fallback
}

/**
 * Looks a key up and fills in its `{placeholders}`.
 *
 * When the value is a set of plural forms, `Intl.PluralRules` picks one from `vars.n` (or
 * the single numeric var, for the strings whose count is called something else). This is
 * why the forms are not hardcoded to one/other: Russian and Polish need `few` and `many`,
 * Japanese and Chinese need only `other`, and Arabic can use six.
 */
export function translate(
  strings: Strings,
  locale: LangCode,
  key: StringKey,
  vars?: Record<string, string | number>,
): string {
  const entry = strings[key] as string | PluralForms
  let template: string

  if (typeof entry === 'string') {
    template = entry
  } else {
    const count = pluralCount(vars)
    const category = count === undefined ? 'other' : new Intl.PluralRules(locale).select(count)
    template = entry[category as keyof PluralForms] ?? entry.other
  }

  if (!vars) return template
  return template.replace(/\{(\w+)\}/g, (match, name) => String(vars[name] ?? match))
}

/** `n` if present, otherwise the only number in the vars — which is what decides the form. */
function pluralCount(vars?: Record<string, string | number>): number | undefined {
  if (!vars) return undefined
  if (typeof vars.n === 'number') return vars.n
  const numbers = Object.values(vars).filter((v): v is number => typeof v === 'number')
  return numbers.length === 1 ? numbers[0] : undefined
}
