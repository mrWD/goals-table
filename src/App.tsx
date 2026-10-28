import { useEffect } from 'react'
import { HashRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import TodayPage from './pages/TodayPage'
import YearPage from './pages/YearPage'
import PlanPage from './pages/PlanPage'
import ArchivePage from './pages/ArchivePage'
import BucketPage from './pages/BucketPage'
import ProfilePage from './pages/ProfilePage'
import { BottomNav, ConfirmHost, ScrollToTop, ToastHost } from './components/ui'
import { count } from './lib/metrics'
import { watchSystemTheme } from './store/theme'

/** The screens metrics knows by name; a year's own page counts as the archive. */
const SCREENS = new Set(['today', 'year', 'plan', 'archive', 'profile'])
let lastCounted: string | undefined

/**
 * One `screen_<name>` per navigation. Keyed on the history entry rather than on the
 * effect running, so StrictMode's second run in development does not count it twice —
 * with the path in the key too, because every hash typed or edited by hand gets the same
 * `default` key from the router.
 */
function useScreenCount() {
  const { pathname, key } = useLocation()
  useEffect(() => {
    const screen = pathname.split('/')[1]
    const entry = `${key}${pathname}`
    if (entry === lastCounted || !SCREENS.has(screen)) return
    lastCounted = entry
    count(`screen_${screen}`)
  }, [pathname, key])
}

function Shell() {
  useEffect(() => watchSystemTheme(), [])
  useScreenCount()

  return (
    <div className="app">
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Navigate to="/today" replace />} />
        <Route path="/today" element={<TodayPage />} />
        <Route path="/year" element={<YearPage />} />
        <Route path="/plan" element={<PlanPage />} />
        <Route path="/archive" element={<ArchivePage />} />
        <Route path="/archive/:bucket" element={<BucketPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="*" element={<Navigate to="/today" replace />} />
      </Routes>
      <BottomNav />
      <ToastHost />
      <ConfirmHost />
    </div>
  )
}

/**
 * HashRouter, not BrowserRouter: the same build is served from a GitHub Pages subpath and
 * from `capacitor://localhost` inside the native shell, and only the hash survives both
 * without server rewrite rules.
 */
export default function App() {
  return (
    <HashRouter>
      <Shell />
    </HashRouter>
  )
}
