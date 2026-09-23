import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import EN from '../i18n/locales/en'
import {
  isLangCode,
  loadLocale,
  RTL_LANGS,
  systemLang,
  translate,
  type LangCode,
  type Strings,
  type StringKey,
} from '../i18n'

export type LangChoice = 'system' | LangCode

interface LangState {
  choice: LangChoice
  /** The choice resolved to a real language — never 'system'. */
  locale: LangCode
  strings: Strings
  setLang: (choice: LangChoice) => Promise<void>
  applyLoaded: (locale: LangCode, strings: Strings) => void
}

export function resolveLang(choice: LangChoice): LangCode {
  return choice === 'system' ? systemLang() : choice
}

/**
 * Sets `lang` and `dir` on the document.
 *
 * `lang` is not decoration: it is what the browser hyphenates, spell-checks and — on a
 * phone — reads aloud by. `dir` is what flips the whole layout for Arabic, which is why
 * the stylesheet uses logical properties rather than left and right.
 */
function applyDocumentLang(locale: LangCode): void {
  const root = document.documentElement
  root.lang = locale
  root.dir = RTL_LANGS.has(locale) ? 'rtl' : 'ltr'
}

/**
 * Kept in localStorage rather than the device storage the goals use: it is a two-letter
 * code, and it has to be readable synchronously at startup to pick the first locale to
 * fetch. Only the choice is stored — the strings are a loaded chunk, not user data.
 */
export const useLang = create<LangState>()(
  persist(
    (set) => ({
      choice: 'system',
      locale: 'en',
      strings: EN,

      setLang: async (choice) => {
        const locale = resolveLang(choice)
        const strings = await loadLocale(locale)
        applyDocumentLang(locale)
        set({ choice, locale, strings })
      },

      applyLoaded: (locale, strings) => {
        applyDocumentLang(locale)
        set({ locale, strings })
      },
    }),
    {
      name: 'goalstable-lang',
      partialize: (s) => ({ choice: s.choice }),
    },
  ),
)

/**
 * Loads the stored language before the first render.
 *
 * Awaited in `main.tsx` alongside store hydration: rendering English and then swapping to
 * Russian a tick later is a visible flash of the wrong language, and on a slow device it
 * is long enough to read.
 */
export async function initLang(): Promise<void> {
  const { choice } = useLang.getState()
  const locale = resolveLang(choice)
  const strings = await loadLocale(locale)
  useLang.getState().applyLoaded(locale, strings)
}

/**
 * The hook every screen uses. Subscribing to both fields means a language change
 * re-renders the whole tree, which is the point.
 */
export function useT() {
  const strings = useLang((s) => s.strings)
  const locale = useLang((s) => s.locale)
  return (key: StringKey, vars?: Record<string, string | number>) =>
    translate(strings, locale, key, vars)
}

/** The active locale, for `Intl` — dates, month names and numbers. */
export function useLocale(): LangCode {
  return useLang((s) => s.locale)
}

/** For the few places outside React that need a string (toasts raised by the storage layer). */
export function t(key: StringKey, vars?: Record<string, string | number>): string {
  const { strings, locale } = useLang.getState()
  return translate(strings, locale, key, vars)
}

export { isLangCode }
