import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import { whenHydrated } from 'tables-core'
import './styles.css'
import App from './App'
import { hideSplash, wireBackButton } from './lib/native-ui'
import { useGoals } from './store/goals'
import { initLang } from './store/lang'
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
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
  hideSplash()
})
