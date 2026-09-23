/**
 * The author's other projects, as listed on the products page.
 *
 * Copied rather than fetched: the app has no backend and must open with no network, and a
 * list of ten links is not worth a request that can fail. It is a copy, so it goes stale —
 * `mrwd.github.io` is the source of truth, and the "All products" link at the bottom of the
 * section is what stays current.
 *
 * GoalsTable itself is deliberately absent: the section is what else there is to look at.
 *
 * Accents and icons are the ones from the products page, so a project looks the same
 * wherever it is listed.
 */

import type { StringKey } from '../i18n'

export type ProjectType = 'web' | 'ios' | 'desktop' | 'extension'
export type ProjectStatus = 'live' | 'beta' | 'open_source'

export interface Project {
  name: string
  type: ProjectType
  /**
   * Left in English on purpose. These describe other products, whose own interfaces and
   * pages are in English; translating ten taglines into twenty languages would be two
   * hundred strings for links that are rarely opened, and a half-accurate translation of
   * someone's product description is worse than the original.
   */
  tagline: string
  icon: string
  accent: string
  status: ProjectStatus
  url: string
}

export const TYPE_KEY: Record<ProjectType, StringKey> = {
  web: 'type_web',
  ios: 'type_ios',
  desktop: 'type_desktop',
  extension: 'type_extension',
}

export const STATUS_KEY: Record<ProjectStatus, StringKey> = {
  live: 'status_live',
  beta: 'status_beta',
  open_source: 'status_open_source',
}

export const PROJECTS: Project[] = [
  {
    name: 'Science Timeline',
    type: 'web',
    tagline: 'The history of science on one zoomable line',
    icon: '🔭',
    accent: '#4c8dff',
    status: 'live',
    url: 'https://mrwd.github.io/science-timeline/',
  },
  {
    name: 'Languages of the World',
    type: 'web',
    tagline: '7,992 languages and 13,706 dialects, on one map',
    icon: '🌍',
    accent: '#5ec8d8',
    status: 'live',
    url: 'https://mrwd.github.io/langs-db/',
  },
  {
    name: 'FilmTable',
    type: 'web',
    tagline: 'TV shows and movies, tracked on your own device',
    icon: '🎬',
    accent: '#f2789f',
    status: 'live',
    url: 'https://film-table.vercel.app',
  },
  {
    name: 'GamesTable',
    type: 'web',
    tagline: 'The same, for games',
    icon: '🎮',
    accent: '#7c9cff',
    status: 'live',
    url: 'https://games-table-bay.vercel.app',
  },
  {
    name: 'BooksTable',
    type: 'web',
    tagline: 'The same, for books',
    icon: '📚',
    accent: '#e2a13c',
    status: 'live',
    url: 'https://books-table-six.vercel.app',
  },
  {
    name: 'Lingary',
    type: 'ios',
    tagline: 'An AI language tutor you talk to, out loud',
    icon: '🗣️',
    accent: '#ff8f6b',
    status: 'beta',
    url: 'https://mrwd.github.io/products/lingary/',
  },
  {
    name: 'AI Job Search',
    type: 'desktop',
    tagline: 'Job hunting, run locally',
    icon: '🎯',
    accent: '#6aa9ff',
    status: 'open_source',
    url: 'https://mrwd.github.io/products/ai-job-search/',
  },
  {
    name: 'AI Screen Translator',
    type: 'desktop',
    tagline: 'Translate whatever is on the screen',
    icon: '🔤',
    accent: '#67e8c3',
    status: 'open_source',
    url: 'https://mrwd.github.io/products/ai-screen-translator/',
  },
  {
    name: 'AI Prompt Suggester',
    type: 'extension',
    tagline: 'Better prompts, suggested as you type',
    icon: '💡',
    accent: '#ffc46b',
    status: 'live',
    url: 'https://chromewebstore.google.com/detail/ai-prompt-suggester/ffacabgddhepblahneohlpgmepogoohl',
  },
  {
    name: 'Double Subtitles',
    type: 'extension',
    tagline: 'Two subtitle tracks at once, for learning',
    icon: '📺',
    accent: '#a78bfa',
    status: 'live',
    url: 'https://chromewebstore.google.com/detail/cpnlpffdpcpoabpahdgfnecgngapjibn',
  },
]

/** Fixed order, so the section does not reshuffle when a project is added. */
export const PROJECT_TYPES: ProjectType[] = ['web', 'ios', 'desktop', 'extension']

export const ALL_PRODUCTS_URL = 'https://mrwd.github.io/'
