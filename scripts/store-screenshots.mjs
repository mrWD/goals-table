/**
 * The store screenshots: docs/store/screenshots/ios-6.9 (1320×2868, light) and android
 * (1080×2400, dark), six screens each, and ipad-13 (2064×2752, light), five; and Google
 * Play's docs/store/feature-graphic-1024x500.png.
 *
 *   npm i --no-save playwright && npx playwright install chromium
 *   node scripts/store-screenshots.mjs
 *
 * or, with a Playwright that is already on the machine:
 *
 *   PLAYWRIGHT=/path/to/node_modules/playwright node scripts/store-screenshots.mjs
 *
 * Same ground rules as site-screenshots.mjs: its own Vite dev server, a fresh profile per
 * set so what is photographed is the fictional demo seed (src/lib/seed.ts), the clock
 * pinned, Global Privacy Control on so the metrics notice stays away, and `?from=app` so no
 * donation link shows. The usage ping is blocked at the network as well, because the
 * Profile shot turns the switch on: that is where a fresh install of the app starts.
 *
 * The seed has no routine log, so Today would show a streak of 0. A fortnight of it is
 * ticked through the plan store's own `toggleBlock`, the call a tap on a block makes, in
 * the throwaway profile: nine full days, a two-day gap before them, two of three today.
 *
 * The phone sets get the status bar (and on Android the gesture bar) lifted from the
 * simulators in docs/store/frame/. On the iPhone the web view runs under the status bar,
 * so the insets are emulated and the bar is laid over them; Android insets the web view,
 * so there the bars are strips of their own above and below the page, as native-ui.ts
 * describes. The iPad set has no bars.
 */
import { spawn } from 'node:child_process'
import { mkdirSync, readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const { chromium } = require(process.env.PLAYWRIGHT ?? 'playwright')
const sharp = require('sharp')

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(ROOT, 'docs/store/screenshots')
const FRAME = join(ROOT, 'docs/store/frame')
const PORT = Number(process.env.PORT ?? 5198)
const BASE = `http://localhost:${PORT}/?from=app`
const NOW = new Date('2026-10-29T10:00:00')

const YEAR = { name: 'year', path: '#/year' }
const TODAY = { name: 'today', path: '#/today' }
const PLAN = { name: 'plan', path: '#/plan' }
const YEARS = { name: 'years', path: '#/archive' }
const MOVE = {
  name: 'move',
  path: '#/today',
  // The add sheet's "Move here" tab, searching a goal that recurs across the years.
  act: async (page) => {
    await page.locator('button.fab').click()
    await page.getByRole('tab').nth(1).click()
    await page.locator('.search input').last().fill('Spanish')
  },
}
const PROFILE = {
  name: 'profile',
  path: '#/profile',
  // Your data, and the statistics switch in the position a new install has it.
  act: async (page) => {
    await page.getByRole('button', { name: 'On', exact: true }).click()
    // The click scrolls the switch into view, wherever that lands. Back to the top, unless
    // the screen is too short to show the switch from there: then "Your data" leads.
    await page.evaluate(() => {
      window.scrollTo(0, 0)
      const card = (title) =>
        [...document.querySelectorAll('section.card')].find((c) => c.querySelector('h2')?.textContent === title)
      if (card('Share anonymous usage statistics').getBoundingClientRect().bottom <= window.innerHeight - 90) return
      const pad = parseFloat(getComputedStyle(document.querySelector('.page')).paddingTop)
      window.scrollTo(0, card('Your data').getBoundingClientRect().top - pad)
    })
  },
}

// The first says what the app is: a year of goals, a ring, six categories.
const PHONE_SHOTS = [YEAR, TODAY, PLAN, YEARS, MOVE, PROFILE]
// On the iPad, Today is a narrow column in a wide screen, so its time slots are opened.
// Plan is left out: in its four-column grid "Japanese: hiragana & katakana" runs past the
// edge of its month card, and a store shot should not show that until it is fixed.
const IPAD_SHOTS = [
  YEAR,
  { ...TODAY, act: (page) => page.getByRole('button', { name: /Time slots/ }).click() },
  YEARS,
  MOVE,
  PROFILE,
]

const SETS = [
  // 62/34pt are the iPhone 16 Pro Max insets; 440×956 at 3x is the 6.9" size.
  { dir: 'ios-6.9', width: 440, height: 956, scale: 3, scheme: 'light', insets: { top: 62, bottom: 34 }, status: 'ios-status.png', shots: PHONE_SHOTS },
  // 13" iPad at 2x. Past the 900px breakpoint, so this is the layout with the side rail.
  { dir: 'ipad-13', width: 1032, height: 1376, scale: 2, scheme: 'light', shots: IPAD_SHOTS },
  // Android insets the web view instead of drawing it under the bars, so the page gets
  // what is left of the 800pt and the bars are strips of their own in the page's colour.
  { dir: 'android', width: 360, height: 800, scale: 3, scheme: 'dark', strips: { top: 24, bottom: 24 }, status: 'android-status.png', nav: 'android-nav.png', shots: PHONE_SHOTS },
]

/** A fortnight of the routine: every day but two closed, today two blocks of three. */
async function tickRoutine(page) {
  await page.evaluate(async () => {
    const { usePlan, dayKey } = await import('/src/store/plan.ts')
    while (!usePlan.persist.hasHydrated() || !usePlan.getState().seeded) {
      await new Promise((r) => setTimeout(r, 50))
    }
    const { blocks, toggleBlock } = usePlan.getState()
    for (let ago = 13; ago >= 0; ago--) {
      if (ago === 10 || ago === 11) continue
      const day = new Date()
      day.setDate(day.getDate() - ago)
      for (const block of ago === 0 ? blocks.slice(0, 2) : blocks) toggleBlock(dayKey(day), block.id)
    }
  })
}

async function waitForServer(url, attempts = 120) {
  for (let i = 0; i < attempts; i++) {
    try {
      if ((await fetch(url)).ok) return
    } catch {
      // not up yet
    }
    await new Promise((r) => setTimeout(r, 500))
  }
  throw new Error(`dev server did not come up at ${url}`)
}

/** What the page paints behind everything, for the Android bars' strips. */
function pageColour(page) {
  return page.evaluate(() => {
    for (const el of [document.body, document.documentElement]) {
      const colour = getComputedStyle(el).backgroundColor
      if (colour !== 'rgba(0, 0, 0, 0)' && colour !== 'transparent') return colour
    }
    return '#000'
  })
}

async function save(set, file, shot, background) {
  const layers = []
  let base = sharp(shot)
  if (set.strips) {
    base = sharp({ create: { width: set.width * set.scale, height: set.height * set.scale, channels: 3, background } })
    layers.push({ input: shot, top: set.strips.top * set.scale, left: 0 })
  }
  if (set.status) {
    // The bars were lifted as dark glyphs; the dark theme wants them light.
    const bar = sharp(join(FRAME, set.status))
    layers.push({ input: await (set.scheme === 'dark' ? bar.negate({ alpha: false }) : bar).toBuffer(), top: 0, left: 0 })
  }
  if (set.nav) {
    const nav = sharp(join(FRAME, set.nav))
    const { height } = await nav.metadata()
    layers.push({
      input: await (set.scheme === 'dark' ? nav.negate({ alpha: false }) : nav).toBuffer(),
      top: set.height * set.scale - height,
      left: 0,
    })
  }
  // The stores refuse an alpha channel, so it is dropped whatever the layers carried.
  const composed = await base.composite(layers).png().toBuffer()
  await sharp(composed).removeAlpha().png().toFile(file)
  console.log(file)
}

/** The icon's gradient behind the icon's ring, which is the ring on the Year screen. */
const GRAPHIC = {
  name: 'GoalsTable',
  tagline: 'Yearly goals, monthly focus',
  background: 'linear-gradient(#3d70f7, #1e45bd)',
  line: 'rgba(255, 255, 255, 0.82)',
  art: 300,
}
const ICON_BACKGROUND = /<rect width="1024" height="1024"[^>]*\/>/

/**
 * Google Play's feature graphic, 1024×500 with no alpha: the icon's own artwork from
 * public/favicon.svg on the icon's colours, the name and one line. Nothing else: Play
 * crops and overlays it in places, so it says only what the app is.
 */
async function featureGraphic(browser) {
  const page = await browser.newPage({ viewport: { width: 1024, height: 500 }, deviceScaleFactor: 1 })
  const art = readFileSync(join(ROOT, 'public/favicon.svg'), 'utf8')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(ICON_BACKGROUND, '')
  await page.setContent(`<!doctype html>
    <style>
      body { margin: 0; width: 1024px; height: 500px; display: flex; align-items: center;
        gap: 56px; padding: 0 80px; box-sizing: border-box; background: ${GRAPHIC.background};
        font-family: -apple-system, system-ui, sans-serif; color: #fff; }
      svg { width: ${GRAPHIC.art}px; height: ${GRAPHIC.art}px; flex: none; }
      h1 { margin: 0; font-size: 84px; font-weight: 700; letter-spacing: -0.02em; }
      p { margin: 18px 0 0; font-size: 32px; white-space: nowrap; color: ${GRAPHIC.line}; }
    </style>
    ${art}<div><h1>${GRAPHIC.name}</h1><p>${GRAPHIC.tagline}</p></div>`)
  const file = join(ROOT, 'docs/store/feature-graphic-1024x500.png')
  await sharp(await page.screenshot()).removeAlpha().png().toFile(file)
  console.log(file)
  await page.close()
}

const server = spawn('npx', ['vite', '--port', String(PORT), '--strictPort'], { cwd: ROOT, stdio: 'ignore' })
try {
  await waitForServer(`http://localhost:${PORT}/`)
  const browser = await chromium.launch()
  for (const set of SETS) {
    mkdirSync(join(OUT, set.dir), { recursive: true })
    const context = await browser.newContext({
      viewport: { width: set.width, height: set.height - (set.strips ? set.strips.top + set.strips.bottom : 0) },
      deviceScaleFactor: set.scale,
      isMobile: set.width < 900,
      hasTouch: true,
      colorScheme: set.scheme,
      // The interface language and the date on Today follow the browser's locale: without
      // this they come out in whatever the Mac is set to.
      locale: 'en-US',
    })
    await context.addInitScript(() => {
      Object.defineProperty(Navigator.prototype, 'globalPrivacyControl', { get: () => true })
    })
    await context.route(/\/api\/ping/, (route) => route.abort())
    const page = await context.newPage()
    await page.clock.setFixedTime(NOW)
    if (set.insets) {
      const cdp = await context.newCDPSession(page)
      await cdp.send('Emulation.setSafeAreaInsetsOverride', { insets: { left: 0, right: 0, ...set.insets } })
    }
    await page.goto(`${BASE}#/today`)
    await page.waitForLoadState('networkidle')
    await tickRoutine(page)

    for (const [i, shot] of set.shots.entries()) {
      await page.goto(`${BASE}${shot.path}`)
      await page.waitForLoadState('networkidle')
      await page.evaluate(() => window.scrollTo(0, 0))
      if (shot.act) await shot.act(page)
      await page.waitForTimeout(400)
      await save(set, join(OUT, set.dir, `${String(i + 1).padStart(2, '0')}-${shot.name}.png`), await page.screenshot(), await pageColour(page))
    }
    await context.close()
  }
  await featureGraphic(browser)
  await browser.close()
} finally {
  server.kill()
}
