import { useEffect, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { themeService } from '@/services/theme/theme-service'
import { configService } from '@/services/config/config-service'
import Header from './Header'
import MobileNav from './MobileNav'

interface Props {
  children: ReactNode
}

export default function AppShell({ children }: Props) {
  const { i18n } = useTranslation()
  const location = useLocation()

  // 初始化主题和语言
  useEffect(() => {
    themeService.init()
    const config = configService.getConfig()
    i18n.changeLanguage(config.language)
  }, [i18n])

  // 主题模式变化监听
  useEffect(() => {
    const config = configService.getConfig()
    themeService.setMode(config.themeMode)
  }, [location.pathname])

  return (
    <div className="flex min-h-screen flex-col bg-app-bg text-app-text transition-colors">
      <Header />
      <main className="flex-1 pb-16 sm:pb-0">
        <div className="mx-auto h-full max-w-7xl px-3 py-4 sm:px-4 sm:py-6">
          {children}
        </div>
      </main>
      <MobileNav />
    </div>
  )
}
