import { HashRouter, Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import ErrorBoundary from '@/components/layout/ErrorBoundary'
import AppShell from '@/components/layout/AppShell'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import CreatePage from '@/modules/input/CreatePage'

// 延迟加载非首页路由以减少初始打包体积
const HistoryPage = lazy(() => import('@/modules/history/HistoryPage'))
const SettingsPage = lazy(() => import('@/modules/settings/SettingsPage'))
const ThemePage = lazy(() => import('@/modules/theme/ThemePage'))

function PageLoader() {
  return (
    <div className="flex h-64 items-center justify-center">
      <LoadingSpinner />
    </div>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <HashRouter>
        <AppShell>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<CreatePage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/theme" element={<ThemePage />} />
            </Routes>
          </Suspense>
        </AppShell>
      </HashRouter>
    </ErrorBoundary>
  )
}

export default App
