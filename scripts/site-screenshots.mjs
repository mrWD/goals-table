/**
 * The products page's screenshots: five screens in light and dark at 414×896, written to
 * docs/store/site/ (copy them to products-page/products/goals-table/assets/).
 *
 *   npm i --no-save playwright && npx playwright install chromium
 *   node scripts/site-screenshots.mjs
 *
 * or, with a Playwright that is already on the machine:
 *
 *   PLAYWRIGHT=/path/to/node_modules/playwright node scripts/site-screenshots.mjs
 *
 * It starts its own Vite dev server and opens the app in a fresh profile, so what is
 * photographed is the fictional demo seed (src/lib/seed.ts) and never anyone's own goals.
 * The clock is pinned so a rerun shows the same month; Global Privacy Control is on, so
 * the metrics notice stays away and nothing is sent; `?from=app` hides the donation links
 * the way the native build does.
 */
import { spawn } from 'node:child_process'
import { mkdirSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(ROOT, 'docs/store/site')
const PORT = Number(process.env.PORT ?? 5199)
const BASE = `http://localhost:${PORT}/?from=app`
const NOW = new Date('2026-10-29T10:00:00')

const require = createRequire(import.meta.url)
const { chromium } = require(process.env.PLAYWRIGHT ?? 'playwright')

const SHOTS = [
  { name: 'year', path: '#/year' },
  { name: 'today', path: '#/today' },
  { name: 'plan', path: '#/plan' },
  { name: 'years', path: '#/archive' },
  {
    name: 'move',
    path: '#/today',
    // The add sheet's "Move here" tab, searching a goal that recurs across the years.
    act: async (page) => {
      await page.locator('button.fab').click()
      await page.getByRole('tab').nth(1).click()
      await page.locator('.search input').last().fill('Spanish')
      await page.waitForTimeout(300)
    },
  },
]

async function waitForServer(url, attempts = 60) {
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

const server = spawn('npx', ['vite', '--port', String(PORT), '--strictPort'], { cwd: ROOT, stdio: 'ignore' })
try {
  await waitForServer(`http://localhost:${PORT}/`)
  mkdirSync(OUT, { recursive: true })
  const browser = await chromium.launch()
  for (const scheme of ['light', 'dark']) {
    const context = await browser.newContext({
      viewport: { width: 414, height: 896 },
      deviceScaleFactor: 1,
      colorScheme: scheme,
    })
    await context.addInitScript(() => {
      Object.defineProperty(Navigator.prototype, 'globalPrivacyControl', { get: () => true })
    })
    const page = await context.newPage()
    await page.clock.setFixedTime(NOW)
    for (const shot of SHOTS) {
      await page.goto(`${BASE}${shot.path}`)
      await page.waitForLoadState('networkidle')
      await page.evaluate(() => window.scrollTo(0, 0))
      if (shot.act) await shot.act(page)
      await page.waitForTimeout(250)
      const file = join(OUT, `${shot.name}-${scheme}.png`)
      await page.screenshot({ path: file })
      console.log(file)
    }
    await context.close()
  }
  await browser.close()
} finally {
  server.kill()
}
