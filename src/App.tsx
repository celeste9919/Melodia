import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AppShell from '@/components/layout/AppShell'
import CreatePage from '@/modules/input/CreatePage'
import HistoryPage from '@/modules/history/HistoryPage'
import SettingsPage from '@/modules/settings/SettingsPage'
import ThemePage from '@/modules/theme/ThemePage'

function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<CreatePage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/theme" element={<ThemePage />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  )
}

export default App
