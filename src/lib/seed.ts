import { categorize } from './categorize'
import { BACKLOG, type Bucket, type Goal, type MonthPlan, type RoutineBlock, type TimeSlot } from './types'

/**
 * Demo content for the first run: a fictional person's goals, from a first spreadsheet in
 * 2020 to a plan for 2026, with a month-by-month focus and a daily routine. It exists so
 * every screen has something on it before anyone has typed a word.
 *
 * None of it is a real person's. Until 2026-10-18 this file carried the owner's own sheet,
 * transcribed; it went to every installer and sat in a public repository, so it was
 * replaced with this. Keep it fictional — no real names, cities, employers, income, visas or
 * body measurements — and keep it the same size, so the archive and the year look lived-in.
 *
 * This is the app's first run and nothing else: once a goal is in device storage the seed
 * is never consulted again, so editing a line here does not change an installed app. It is
 * kept in the repository rather than fetched because the app has no backend, and a
 * tracker that cannot open offline is not local-first.
 *
 * Titles are categorised by `categorize`, so each one is worded to land where it belongs —
 * "Endurance: run 10 km" rather than "Run 10 km", which would file itself under Tech.
 */

/** 2026 is the only year in progress, so it is the only one with mixed state. */
const YEAR_2026: Array<[string, boolean]> = [
  ['TypeScript strict mode', true],
  ['Vitest', true],
  ['Playwright end-to-end tests', true],
  ['CSS container queries', true],
  ['Web accessibility basics', true],
  ['Core Web Vitals', true],
  ['Git bisect', true],
  ['GitHub Actions caching', true],
  ['Dependabot', true],
  ['Code review checklist', true],
  ['Feature flags', true],
  ['OpenTelemetry tracing', true],
  ['PostgreSQL indexes', true],
  ['SQL window functions', true],
  ['Redis caching', true],
  ['REST API versioning', true],
  ['OAuth 2.0 flows', true],
  ['LLM APIs in a side app', true],
  ['Prompt patterns', true],
  ['Embeddings & vector search', true],
  ['Terminal: tmux', true],
  ['Dotfiles cleanup', true],
  ['Docker multi-stage builds', true],
  ['Lighthouse score 95+', true],
  ['Go basics', false],
  ['Rust: the book', false],
  ['Kubernetes basics', false],
  ['Terraform', false],
  ['AWS Cloud Practitioner', false],
  ['Event-driven architecture', false],
  ['Message queues', false],
  ['Distributed systems reading', false],
  ['Data structures refresh', false],
  ['50 LeetCode problems', false],
  ['Machine learning basics', false],
  ['Statistics refresh', false],
  ['Security: OWASP Top 10', false],
  ['Technical writing', false],
  ['Public speaking: one meetup talk', false],
  ['GraphQL federation', false],
  ['Pet project: recipe planner', true],
  ['Publish the recipe planner', true],
  ['Create iOS app for the recipe planner', false],
  ['Browser extension: tab cleaner', true],
  ['Publish the tab cleaner extension', true],
  ['Pet project: budget dashboard', true],
  ['Pet project: board game scorer', true],
  ['Publish a portfolio site', true],
  ['Publish a personal blog', true],
  ['Publish 6 blog posts', false],
  ['Record 4 videos about coding', false],
  ['VS Code extension for snippets', true],
  ['Pet project: plant watering reminder', true],
  ['Publish an open-source CLI', true],
  ['Pet project: photo sorter', false],
  ['Video: year in review', false],
  ['Gym twice a week', true],
  ['10 pull ups in a row', false],
  ['Morning stretching', true],
  ['Endurance: run 10 km', false],
  ['Healthy sleep: 7 hours', true],
  ['Less sugar in my diet', false],
  ['Join a volleyball club', true],
  ['Spanish B1', false],
  ['Spanish: read a novel', true],
  ['Japanese: hiragana & katakana', true],
  ['Japanese N5', false],
  ['Weekend trip to the mountains', true],
  ['Travel somewhere new', true],
  ['Go to a concert every quarter', false],
  ['Go to a pottery class', true],
  ['Save money: 3-month cushion', false],
  ['Index fund investment', true],
  ['+ $3,000 savings', false],
]

/** Every closed year was ticked end to end. Nothing to encode but the list. */
const CLOSED_YEARS: Record<number, string[]> = {
  2025: [
    'React Server Components',
    'Next.js App Router',
    'Tailwind CSS',
    'Design tokens',
    'Zod validation',
    'tRPC',
    'Prisma',
    'Supabase auth',
    'Node.js streams',
    'Web Workers',
    'Service workers & offline',
    'IndexedDB',
    'WebSockets',
    'Jest to Vitest migration',
    'ESLint flat config',
    'Monorepo with pnpm',
    'Turborepo',
    'GitHub Actions matrix builds',
    'Docker Compose',
    'Nginx basics',
    'Linux permissions',
    'Bash scripting',
    'Regex fluency',
    'HTTP caching headers',
    'AI coding assistants',
    'Clean Architecture (book)',
    'System design basics',
    'Code review habits',
    'Pet project: habit tracker',
    'Publish the habit tracker',
    'Pet project: weather widget',
    'Chrome extension: reading mode',
    'Publish the reading mode extension',
    'Record 3 videos for the habit tracker',
    'Pet project: shared shopping list',
    'Gym once a week',
    '5 pull ups in a row',
    'Stretching after workouts',
    'Endurance: run 5 km',
    'Healthy breakfast habit',
    'No soda in my diet',
    'Try volleyball',
    'Sport every weekend',
    'Spanish: grammar review',
    'Japanese: first 100 words',
    'Japanese: kanji for numbers',
    'Save money for a new laptop',
    'Financial basics course',
    'Road trip with friends',
  ],
  2024: [
    'React Query',
    'Redux Toolkit',
    'Next.js basics',
    'CSS-in-JS',
    'Storybook',
    'Component library',
    'Node.js basics',
    'PostgreSQL basics',
    'SQL joins',
    'Docker basics',
    'CI with GitHub Actions',
    'ESLint & Prettier',
    'TypeScript generics',
    'Testing Library',
    'Web performance budget',
    'HTTP/2 & HTTP/3',
    'Browser caching',
    'npm publishing',
    'Semantic versioning',
    'Mentoring a junior',
    'Tech talk at work',
    'Spanish: film without subtitles',
    'French: 500 words',
    'Save money: first emergency fund',
    '+ $1,000 savings',
    'Investment basics',
    'Trip to the seaside',
    'Travel with family',
    'Go to a cooking class',
    'Go to a board game night',
    'Gym: first month',
    'Healthy lunch at work',
    'Pet project: todo app',
  ],
  2023: [
    'Vue basics',
    'React basics',
    'React Router',
    'React hooks in depth',
    'Form validation',
    'TypeScript basics',
    'Vite',
    'REST API design',
    'Express.js',
    'MongoDB basics',
    'JWT auth',
    'Unit tests with Jest',
    'Cypress',
    'Git rebase',
    'Pull request etiquette',
    'Code splitting',
    'Webpack config',
    'Chrome DevTools performance',
    'Figma for developers',
    'Lighthouse audits',
    'Agile & Scrum basics',
    'Good commit messages',
    'Pair programming',
    "Reading other people's code",
    'First production bug fix',
    'On-call basics',
    'Spanish: read a short story',
    'Spanish: 30-day streak',
    'French A2',
    'Chinese: 100 characters',
    'Weekend trip by train',
    'Travel solo once',
    'Go to a hackathon',
    'Go to a meetup',
    'Pet project: landing page',
    'Save money: 10% of income',
    'Healthy routine: walk daily',
  ],
  2022: [
    'JavaScript closures',
    'Promises & async/await',
    'Event loop',
    'ES modules',
    'DOM APIs',
    'Fetch & CORS',
    'HTML forms',
    'Semantic HTML',
    'CSS specificity',
    'Sass',
    'BEM naming',
    'Git branching',
    'Debugging in the browser',
    'LocalStorage',
    'JSON & APIs',
    'Algorithms: sorting',
    'Big-O notation',
    'Accessibility: ARIA basics',
    'Responsive images',
    'npm basics',
    'Portfolio on GitHub Pages',
    'Job interview prep',
    'Spanish A2',
    'Spanish: present tense',
    'Spanish: past tenses',
    'Spanish podcast every week',
    'French A1',
    'French: café phrases',
    'Italian: 50 phrases',
    'English: C1 exam',
    'Language exchange: 20 sessions',
    'Chinese: tones',
    'Go to a national park',
    'Save money for a course',
    'Pet project: tip calculator',
    'Video: how I learn to code',
  ],
  2021: [
    'HTML basics',
    'CSS basics',
    'JavaScript basics',
    'Git basics',
    'GitHub profile',
    'Markdown',
    'Python basics',
    'Python: automate a chore',
    'SQL basics',
    'Excel pivot tables',
    'Computer science intro course',
    'Harvard CS50',
    'Typing speed 60 wpm',
    'Command line basics',
    'VS Code shortcuts',
    'Flexbox',
    'CSS Grid',
    'Responsive layouts',
    'freeCodeCamp certificate',
    'Spanish A1',
    'Spanish: 100 phrases',
    'English: C1 reading',
    'Trip to the lake',
    'Go to a coding bootcamp open day',
  ],
  2020: [
    'Excel basics',
    'Google Sheets formulas',
    'Touch typing',
    'Notion setup',
    'How the internet works',
    'Scratch for fun',
    'Raspberry Pi',
    'Home network setup',
    'Password manager',
    'Backups: 3-2-1',
    'Build a PC',
    'Save money every month',
    'Financial literacy book',
    '+ $500 savings',
    'Learn about investment',
    'English B2',
    'English: business emails',
    'Spanish: first 50 words',
    'Language exchange meetups',
  ],
}

/** The someday list. Nothing in it is ticked, which is what makes it the backlog. */
const BACKLOG_ITEMS = [
  'Rust in production',
  'Elixir',
  'Kotlin & Android',
  'SwiftUI',
  'Compilers: write a toy one',
  'Operating systems course',
  'Computer networks course',
  'Linear algebra refresh',
  'Deep learning course',
  'Build a database from scratch',
  'WebAssembly',
  'Game development basics',
  'Open-source maintainer',
  'Staff engineer path',
  'Conference talk',
  'Write a technical book',
  'Functional programming',
  'Haskell for fun',
  'Spanish B2',
  'Spanish C1',
  'Spanish: DELE exam',
  'French B1',
  'French B2',
  'Japanese N4',
  'Japanese N3',
  'Japanese: 500 kanji',
  'Chinese HSK 1',
  'Chinese HSK 2',
  'Italian A1',
  'English C2',
  'Sign language basics',
  'Gym three times a week',
  '20 pull ups in a row',
  'Endurance: half marathon',
]

export const PLAN_YEAR = 2026

/** What each month of 2026 is for. Focus items are 2026 goals, so Today can list them. */
export const SEED_MONTHS: MonthPlan[] = [
  {
    month: 0,
    focus: ['TypeScript strict mode', 'Vitest', 'Healthy sleep: 7 hours'],
    money: '+ $300',
    langs: ['Spanish B1', 'Japanese: hiragana & katakana'],
  },
  {
    month: 1,
    focus: ['Playwright end-to-end tests', 'Pet project: recipe planner'],
    money: '+ $300',
    langs: ['Spanish B1'],
  },
  {
    month: 2,
    focus: ['PostgreSQL indexes', 'SQL window functions', 'Publish the recipe planner'],
    money: '+ $500',
    langs: ['Spanish B1', 'Japanese: hiragana & katakana'],
  },
  {
    month: 3,
    focus: ['OAuth 2.0 flows', 'Browser extension: tab cleaner', 'Gym twice a week'],
    money: '+ $300',
    langs: ['Spanish B1'],
  },
  {
    month: 4,
    focus: ['Redis caching', 'OpenTelemetry tracing', 'Publish the tab cleaner extension'],
    money: '+ $300',
    langs: ['Spanish B1'],
  },
  {
    month: 5,
    focus: ['Embeddings & vector search', 'LLM APIs in a side app', 'Weekend trip to the mountains'],
    money: '+ $200',
    langs: ['Spanish B1', 'Japanese N5'],
  },
  {
    month: 6,
    focus: ['Docker multi-stage builds', 'Pet project: budget dashboard', 'Travel somewhere new'],
    money: '+ $200',
    langs: ['Spanish: read a novel'],
  },
  {
    month: 7,
    focus: ['Go basics', 'Event-driven architecture', 'Publish a personal blog'],
    money: '+ $300',
    langs: ['Spanish B1', 'Japanese N5'],
  },
  {
    month: 8,
    focus: ['Go basics', 'Kubernetes basics', 'Message queues'],
    money: '+ $300',
    langs: ['Spanish B1', 'Japanese N5'],
  },
  {
    month: 9,
    focus: ['Kubernetes basics', 'Terraform', '10 pull ups in a row'],
    money: '+ $500',
    langs: ['Spanish B1', 'Japanese N5'],
  },
  {
    month: 10,
    focus: ['AWS Cloud Practitioner', 'Security: OWASP Top 10', 'Create iOS app for the recipe planner'],
    money: '+ $300',
    langs: ['Spanish B1', 'Japanese N5'],
  },
  {
    month: 11,
    focus: ['Distributed systems reading', 'Video: year in review'],
    money: '+ $500',
    langs: ['Spanish B1', 'Japanese N5'],
  },
]

/** The day, divided: three hours, each for one kind of work. */
export const SEED_BLOCKS: RoutineBlock[] = [
  { id: 'skills', label: 'Skills', hours: 1 },
  { id: 'lang', label: 'Language', hours: 1 },
  { id: 'project', label: 'Projects', hours: 1 },
]

/** The time slots, a few of them reserved, to show what a label looks like. */
export const SEED_SLOTS: TimeSlot[] = [
  { time: '6:30' },
  { time: '7:00' },
  { time: '7:30', label: 'Language' },
  { time: '8:00' },
  { time: '12:30' },
  { time: '13:00' },
  { time: '17:30' },
  { time: '18:00' },
  { time: '18:30', label: 'Gym' },
  { time: '19:00' },
  { time: '19:30' },
  { time: '20:00' },
  { time: '20:30', label: 'Side project' },
  { time: '21:00' },
  { time: '21:30' },
  { time: '22:00' },
  { time: '22:30' },
]

/** Places to learn from — all of them free or legitimately paid for. */
export const SEED_RESOURCES = [
  'MDN Web Docs',
  'freeCodeCamp',
  'YouTube',
  'Coursera',
  'edX',
  'Khan Academy',
  'MIT OpenCourseWare',
  'LinkedIn Learning',
  'Exercism',
  'Library e-books',
  'Duolingo',
  'Podcasts',
  'Official docs',
]

/**
 * A stable id per row, so re-running the seed on an empty store cannot produce two copies
 * of the same goal, and so an export taken today still matches an import tomorrow.
 */
function seedId(bucket: Bucket, title: string): string {
  return `${bucket}:${title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9а-я-]/gi, '')}`
}

/**
 * Titles are deduplicated within a bucket — the same goal twice in one year is a
 * copy-paste, not two goals — but never across them, because the same title in two years
 * is the year it was learned and the year it was used again.
 */
export function buildSeedGoals(): Goal[] {
  const now = new Date().toISOString()
  const goals: Goal[] = []
  const seen = new Set<string>()

  const push = (bucket: Bucket, title: string, done: boolean) => {
    const id = seedId(bucket, title)
    if (seen.has(id)) return
    seen.add(id)
    goals.push({ id, title, bucket, done, category: categorize(title), createdAt: now })
  }

  for (const [title, done] of YEAR_2026) push(PLAN_YEAR, title, done)
  for (const [year, titles] of Object.entries(CLOSED_YEARS)) {
    for (const title of titles) push(Number(year), title, true)
  }
  for (const title of BACKLOG_ITEMS) push(BACKLOG, title, false)

  return goals
}

/** Newest first, and the backlog last of all — the order the app lists buckets in. */
export function seedBuckets(): Bucket[] {
  const years = [PLAN_YEAR, ...Object.keys(CLOSED_YEARS).map(Number)].sort((a, b) => b - a)
  return [...years, BACKLOG]
}
