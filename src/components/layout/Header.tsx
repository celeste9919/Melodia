import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function Header() {
  const { t } = useTranslation()
  const location = useLocation()

  const navItems = [
    { path: '/', label: t('nav.create'), icon: '&#x1F3B5;' },
    { path: '/history', label: t('nav.history'), icon: '&#x1F4CB;' },
    { path: '/settings', label: t('nav.settings'), icon: '&#x2699;' },
    { path: '/theme', label: t('nav.theme'), icon: '&#x1F3A8;' },
  ]

  return (
    <header className="sticky top-0 z-40 border-b border-app-border bg-app-surface/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-2 px-3 sm:gap-6 sm:px-4">
        {/* Logo */}
        <Link to="/" className="flex shrink-0 items-center gap-2 text-lg font-bold text-app-primary no-underline">
          <span className="text-xl">&#x1F3B5;</span>
          <span className="hidden sm:inline">{t('app.title')}</span>
          <span className="inline sm:hidden text-sm">AI &#x1F3B5;</span>
        </Link>

        {/* Nav */}
        <nav className="flex gap-0.5 sm:gap-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`rounded-md px-2 py-1.5 text-xs sm:px-3 sm:text-sm transition-colors no-underline ${
                  isActive
                    ? 'bg-app-primary/20 text-app-primary'
                    : 'text-app-text-secondary hover:text-app-text hover:bg-app-surface'
                }`}
              >
                <span className="inline sm:hidden">{item.icon}</span>
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="flex-1" />
      </div>
    </header>
  )
}
