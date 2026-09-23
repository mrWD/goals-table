import { useEffect } from 'react'
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import TodayPage from './pages/TodayPage'
import YearPage from './pages/YearPage'
import PlanPage from './pages/PlanPage'
import ArchivePage from './pages/ArchivePage'
import BucketPage from './pages/BucketPage'
import ProfilePage from './pages/ProfilePage'
import { BottomNav, ConfirmHost, ScrollToTop, ToastHost } from './components/ui'
import { watchSystemTheme } from './store/theme'

function Shell() {
  useEffect(() => watchSystemTheme(), [])

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
