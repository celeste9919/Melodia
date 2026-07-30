import { useEffect, useState, type ReactNode } from 'react'
import Header from './Header'
import { themeService } from '@/services/theme/theme-service'

interface Props {
  children: ReactNode
}

export default function AppShell({ children }: Props) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // 初始化主题
  useEffect(() => {
    themeService.init()
  }, [])

  return (
    <div className="flex h-screen flex-col bg-app-bg">
      <Header onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <main className="flex-1 overflow-hidden">
        <div className="mx-auto h-full max-w-7xl px-4 py-6">
          {children}
        </div>
      </main>
    </div>
  )
}
