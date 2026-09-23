import { categorize } from './categorize'
import { BACKLOG, type Bucket, type Goal, type MonthPlan, type RoutineBlock, type TimeSlot } from './types'

/**
 * The spreadsheet, as it stood on 2026-08-15, transcribed.
 *
 * This is the app's first run and nothing else: once a goal is in device storage the seed
 * is never consulted again, so editing a line here does not change an installed app. It is
 * kept in the repository rather than fetched because the sheet is private, the app has no
 * backend, and a tracker that cannot open without Google is not local-first.
 *
 * Titles are verbatim, including the typos ("Angluar", "Cloude", "Squads" for squats,
 * "Nederlanfish"). They are the owner's own record of seven years and are his to correct
 * in the app, not mine to correct on the way in.
 */

/** 2026 is the only year in progress, so it is the only one with mixed state. */
const YEAR_2026: Array<[string, boolean]> = [
  ['Sonar Cloud', true],
  ['Cursor Commands', true],
  ['CodeX', true],
  ['Cursor Cloude Version', true],
  ['Claude Code', true],
  ['Second Brain', true],
  ['Obsidian', true],
  ['Chromatic', true],
  ['Trivy', true],
  ['Gitleaks', true],
  ['AI APIs in development', true],
  ['AI orchestration patterns', true],
  ['Agents Skills', true],
  ['Symlinks for Agents', true],
  ['Husky', true],
  ['Integrations in AI Issue Resolver', true],
  ['Configure AI for Designers', true],
  ['Animations', true],
  ['Lotie Animations', true],
  ['Test Flight', true],
  ['Swift Tests', true],
  ['Eval Tests', true],
  ['Swift Tests in Github Actions', true],
  ['Vibe Game Coding', true],
  ['Data Scientist Course', false],
  ['ML Engineering', false],
  ['Product Management', false],
  ['Python', false],
  ['Software Architecture', false],
  ['FastAPI', false],
  ['DB Pro', false],
  ['DevOps Pro', false],
  ['System Design', false],
  ['RAG & CAG (pro)', false],
  ['GOF patterns', false],
  ['GRASP patterns', false],
  ['AI Agents', false],
  ['DDD and others', false],
  ['Docker Cloud', false],
  ['Stripe Managing', false],
  ['Sentry Managing', false],
  ['Website Documentation', false],
  ['K8s', false],
  ['Crypto currency & Blockchain', true],
  ['ArgoCD', false],
  ['Italian B2', false],
  ['German B2', false],
  ['French A1+', true],
  ['AI Issues Resolver', true],
  ['AI Lang Tutor', true],
  ['News Scraper', true],
  ['Courses Scraper', true],
  ['Move to Italy', true],
  ['Gym > 80 kg', false],
  ['Dead Lifting > 90 kg', false],
  ['Squads > 90 kg', false],
  ['Pull Ups 1 with 0kg', false],
  ['Endurance: 30 min speed 12', false],
  ['Loose 10 kg', false],
  ['Wedding', true],
  ['Volleyball Better Technic', true],
  ['+ $20,000', false],
  ['Cursor Extension', true],
  ['Improve "Double Subtitles" Ext', true],
  ['AI Screen Translator', true],
  ['AI RTS', true],
  ['AI Language Tutor (iOS)', true],
  ['AI Language Tutor (Android)', true],
  ['AI Job Search', true],
  ['Movie Table', true],
  ['Game Table', true],
  ['Books Table', true],
  ['Langs DB', true],
  ['Science Timeline', true],
]

/** Every closed year in the sheet was ticked end to end. Nothing to encode but the list. */
const CLOSED_YEARS: Record<number, string[]> = {
  2025: [
    'Neural Network (Basics)',
    'Cursor',
    'Migrate from Stencil to Vue',
    'Use new Architecture',
    'FE Architecture',
    'Create Python API',
    'Publish Python API',
    'Publish Supabase',
    'Create iOS App',
    'Keycloak & SSO',
    'Design Mini Course',
    'N8N',
    'Storybook Mocking',
    'Mermaid',
    'User and Code Flow',
    'NPM Audit',
    'Cursor Rules',
    'Stripe',
    'Frontend Architecture',
    'FSD',
    'Crowdin & Other Localising Serv.',
    'Vue+PWA',
    'SonarQube',
    'Cursor MCP',
    'GCP for PWA',
    'Design System',
    'RAG & CAG',
    'AI Dev in Backend',
    'AI Dev in iOS',
    'Cursor Rules & MCP',
    'Precommit Rules',
    'German B1',
    'Spanish A1+',
    'Dutch A1-',
    'Healthy feeling',
    'Investments course',
    '+ $20,000',
    'Publish DoubleSubtitles (^Design)',
    'Publish AIPromptSuggester',
    'Started Pet Project: Memora',
    'Started Pet Project: PumpUp',
    'Started Voleyball',
    'Organize a Big Trip to Spain',
    'Gym > 70 kg',
    'Dead Lifting > 70 kg',
    'Squads > 70 kg',
    'Pull Ups 1 with -27.2 kg',
    'Healthy Diet',
    'Loose 10 kg',
  ],
  2024: [
    'DevOps',
    'Chart.js',
    'Git Rebase',
    'Postman',
    'SAST',
    'Storybook',
    'Web Components',
    'Docker (Better Understanding)',
    'Animations',
    'Stencil',
    'GitLab CI',
    'Problem Solving',
    'UE Basic Knowledge',
    'GraphQL',
    'Prompt engineering',
    'Docker Compose',
    'RabbitMQ',
    'Kafka',
    'Sentry',
    'NGinx',
    'WebWorkers',
    'German A2+',
    'Spanish A1',
    'Save money for appartments',
    'Traveling',
    'Going to the gym',
    'Made a big trip for my mom and friends',
    'Go to the Gym',
    '+ $20,000',
    'Chrome Ext: Double Captions',
    'Move everything from Poland',
    'Move to another city',
    'Increased salary',
  ],
  2023: [
    'Algorithms',
    'RxJS',
    'RJSX',
    'Angluar',
    'Docker',
    'E2E',
    'Angular Optimizations',
    'Security JS',
    'Github DevOps: Get familiar',
    'AI: Get familiar',
    'GraphQL: Get familiar',
    'GCP: Project',
    'Prepare for Big Company Interview',
    'GCloud',
    'Python: Start working',
    'Backend: Start working',
    'MongoDB',
    'Leetcode: Get familiar',
    'NodeJS: Better understanding',
    'Microservices',
    'Firebase: Project',
    'Architecture: Project',
    'React: Project',
    'Build Team Work Processes',
    'QA',
    'How Browser works',
    'German A2',
    'Italian B1',
    'Polish B1',
    'Some phrases in 4 languages',
    'Move to Germany',
    'Create 12 Videos about Games',
    'German Taxes',
    'Get Blue Card',
    'Start Stretching',
    'Traveling',
    'Made a big trip for my mom',
  ],
  2022: [
    'Bazel',
    'Google Blueprints',
    'AWS: Get familiar',
    'Angluar JS',
    'Swift / SwiftUI',
    'ESLint config',
    'The Game Theory',
    'CI',
    'C++/C#: Get familiar',
    'Python: Get familiar',
    'UnrealEngine5: Get familiar',
    'HTTP + SSE',
    'Optimisation CSS',
    'Optimisation HTML',
    'Optimisation JS',
    'Patterns',
    'PWA',
    'Security CSS',
    'Security HTML',
    'ServiceWorkers',
    'Testing Pyramid',
    'WebWorkers',
    'French A1',
    'German A2-',
    'Polish A1',
    'Polish A2',
    'English B2',
    'Move abroad',
    'Common Language Template',
    'German Template',
    'Spanish Template',
    'French Template',
    'Polish Template',
    'Polish Taxes',
    'Made my App',
    'Made my Video',
  ],
  2021: [
    'React *',
    'React Native',
    'Nest JS',
    'PWA and Workers',
    'Java: Get familiar',
    'DataBase',
    'ESLint настройка',
    'Own Framework',
    'Dev and Prod Build (Webpack)',
    'Swift: Get familiar',
    'GameDev',
    'Worked with VR on JS',
    'Junior Mentoring',
    'Next JS',
    'Patterns',
    'SOLID',
    'OOP',
    'M.E.R.N.',
    'M.E.A.N.',
    'German A1',
    'Italian A1',
    'Italian A2',
    'Go to Italy for 3 months',
    'Find job abroad',
  ],
  2020: [
    'React *',
    'React Hooks',
    'Big project in React',
    'Big project in Vue',
    'Big project in Angualr',
    'Big project in Node JS',
    'Nuxt JS',
    'ServiceWorkers',
    'Sockets',
    'Mongo DB',
    'Investment',
    'Financial literacy',
    'CI',
    'English Interview',
    'English B1 - B2',
    'Italian',
    'German',
    '1st million',
    'Close the mortgage',
  ],
}

/** The someday column. Nothing in it was ticked, which is what makes it the backlog. */
const BACKLOG_ITEMS = [
  'DL Engineering',
  'Java + Spring',
  'C#',
  'Kotlin & Android dev',
  'MacOS & iOS dev',
  'Build ChatGPT',
  'Design',
  'System Programming',
  'Quantum computer progr.',
  'GCF',
  'Django',
  'AWS',
  'Algorithms: Deep Knowledge',
  'Team Leading',
  'Math for programmers',
  'Linux',
  'Cyber security',
  '#Net',
  'Italian C1',
  'German C1',
  'Spanish B2',
  'French B2',
  'Polish B2',
  'Serbian B2',
  'Czech B2',
  'Bulgarian B2',
  'Nederlanfish B2',
  'Chinese B2',
  'Japanese B2',
  'Arabic B2',
  'Turkish B2',
  'Gym > 100 kg',
  'Dead Lifting > 150 kg',
  'Squads > 150 kg',
]

export const PLAN_YEAR = 2026

/** The left block of the sheet: what each month of 2026 is for. */
export const SEED_MONTHS: MonthPlan[] = [
  {
    month: 0,
    focus: ['Data Scientist Course', 'Python', 'DB Pro', 'Good fit, healthy feeling'],
    money: '+ $1000',
    langs: ['German B1', 'Italian B1'],
  },
  { month: 1, focus: ['ML Engineering', 'Python', 'AI Agents'], money: '+ $2000', langs: ['German B1', 'Spanish'] },
  { month: 2, focus: ['ML Engineering', 'Python', 'DDD and others'], money: '+ $2000', langs: ['German B1', 'Spanish'] },
  { month: 3, focus: ['ML Engineering', 'Python', 'FastAPI'], money: '+ $2000', langs: ['German B2', 'Spanish'] },
  {
    month: 4,
    focus: ['ML Engineering', 'FastAPI', 'Product Management'],
    money: '+ $1000',
    langs: ['German B2', 'Italian B1'],
  },
  {
    month: 5,
    focus: ['ML Engineering', 'DevOps Pro', 'Product Management'],
    money: '+ $2000',
    langs: ['German B2', 'Italian B1'],
  },
  {
    month: 6,
    focus: ['Software Architecture', 'DevOps Pro', 'System Design'],
    money: '+ $2000',
    langs: ['German B2', 'Italian B2'],
  },
  {
    month: 7,
    focus: ['Software Architecture', 'DevOps Pro', 'System Design'],
    money: '+ $2000',
    langs: ['German B2', 'Italian B2'],
  },
  {
    month: 8,
    focus: ['Software Architecture', 'System Design', 'GOF patterns'],
    money: '+ $2000',
    langs: ['German B2', 'Italian B2'],
  },
  {
    month: 9,
    focus: ['System Design', 'Docker Cloud', 'GRASP patterns'],
    money: '+ $2000',
    langs: ['German B2', 'Italian B2'],
  },
  { month: 10, focus: ['Sonar Cloud', 'Stripe Managing'], money: '+ $2000', langs: ['German B2', 'Italian B2'] },
  { month: 11, focus: ['Sentry Managing'], money: '+ $1000', langs: ['German B2', 'Italian B2'] },
]

/** The "1h : Prof / 1h : Langs / 1h : Others" cells — the day, divided. */
export const SEED_BLOCKS: RoutineBlock[] = [
  { id: 'prof', label: 'Prof', hours: 1 },
  { id: 'langs', label: 'Langs', hours: 1 },
  { id: 'others', label: 'Others', hours: 1 },
]

/** The time column, with the one slot that had a label on it. */
export const SEED_SLOTS: TimeSlot[] = [
  { time: '8:00' },
  { time: '8:30' },
  { time: '9:00' },
  { time: '17:00' },
  { time: '17:30' },
  { time: '18:00' },
  { time: '18:30' },
  { time: '19:00' },
  { time: '19:30' },
  { time: '20:00' },
  { time: '20:30' },
  { time: '21:00', label: 'Sport' },
  { time: '21:30' },
  { time: '22:00' },
  { time: '22:30' },
  { time: '23:00' },
  { time: '23:30' },
]

export const SEED_RESOURCES = [
  'Learn Anything xyz',
  'ChatGPT',
  'Youtube',
  'LinkedIn Learn',
  'Netology',
  'Online Courses',
  'Torrent Courses',
  'Find in Google',
  'Websites from Мусорка',
  'Habr',
  'Stepik',
  'Sololearn',
  'Coursera',
]

/**
 * A stable id per row, so re-running the seed on an empty store cannot produce two copies
 * of the same goal, and so an export taken today still matches an import tomorrow.
 */
function seedId(bucket: Bucket, title: string): string {
  return `${bucket}:${title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9а-я-]/gi, '')}`
}

/**
 * The sheet had "Second Brain" on two rows of 2026, both ticked. Titles are deduplicated
 * within a bucket — the same goal twice in one year is a copy-paste, not two goals — but
 * never across them, because "React *" in both 2020 and 2021 is the year it was learned
 * and the year it was used again.
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
