import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import { whenHydrated } from 'tables-core'
import './styles.css'
import App from './App'
import { initMetrics } from './lib/metrics'
import { hideSplash, wireBackButton } from './lib/native-ui'
import { buildSeedGoals } from './lib/seed'
import { useGoals } from './store/goals'
import { initLang, useLang } from './store/lang'
import { usePlan } from './store/plan'

registerSW({ immediate: true })
wireBackButton()

// Both stores hydrate from IndexedDB in a browser and from a file in the native app —
// asynchronous either way. Rendering before they settle would flash an empty year and,
// worse, let the first-run seed run against a store that had not loaded yet. In the
// browser the page background covers the wait; natively the splash screen does
// (launchAutoHide is off), and is dismissed here once there is something behind it.
// The locale chunk is awaited alongside them: rendering English and swapping to Russian a
// tick later is a visible flash of the wrong language.
void Promise.all([whenHydrated([useGoals, usePlan]), initLang()]).then(() => {
  initMetrics({ hasUserData, lang: () => useLang.getState().locale })
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
  hideSplash()
})

/**
 * Whether this device was in use before metrics arrived, which makes it `legacy` rather
 * than a new install. The seed has just been laid down on a first launch, so the demo
 * alone is not data: a goal it does not have, one it has with another tick, one deleted
 * from it, or a day in the routine log is. Installs from before 2026-10-18 hold the old
 * seed, whose ids are not the new one's — they count as data, rightly: they were here.
 */
function hasUserData(): boolean {
  const seed = new Map(buildSeedGoals().map((g) => [g.id, g]))
  const goals = Object.values(useGoals.getState().goals)
  return (
    goals.length !== seed.size ||
    goals.some((g) => seed.get(g.id)?.done !== g.done) ||
    Object.keys(usePlan.getState().log).length > 0
  )
}
