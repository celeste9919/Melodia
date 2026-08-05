import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function MobileNav() {
  const { t } = useTranslation()
  const location = useLocation()

  const navItems = [
    { path: '/', label: t('nav.create'), icon: '🎵' },
    { path: '/history', label: t('nav.history'), icon: '📋' },
    { path: '/settings', label: t('nav.settings'), icon: '⚙️' },
    { path: '/theme', label: t('nav.theme'), icon: '🎨' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-app-border bg-app-surface/95 backdrop-blur-sm sm:hidden safe-bottom">
      <div className="flex items-center justify-around h-14">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg no-underline transition-colors min-w-[56px] ${
                isActive
                  ? 'text-app-primary'
                  : 'text-app-text-secondary/60'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-[10px] leading-none">{item.label}</span>
              {isActive && (
                <span className="absolute top-0 h-0.5 w-6 rounded-b-full bg-app-primary" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
