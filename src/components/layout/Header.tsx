import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

interface Props {
  onToggleSidebar?: () => void
}

export default function Header(_props: Props) {
  const { t } = useTranslation()
  const location = useLocation()

  const navItems = [
    { path: '/', label: t('nav.create') },
    { path: '/history', label: t('nav.history') },
    { path: '/settings', label: t('nav.settings') },
    { path: '/theme', label: t('nav.theme') },
  ]

  return (
    <header className="border-b border-app-border bg-app-surface/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-6 px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 text-lg font-bold text-app-primary no-underline">
          <span className="text-xl">🎵</span>
          <span className="hidden sm:inline">{t('app.title')}</span>
        </Link>

        {/* Nav */}
        <nav className="flex gap-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`rounded-md px-3 py-1.5 text-sm transition-colors no-underline ${
                location.pathname === item.path
                  ? 'bg-app-primary/20 text-app-primary'
                  : 'text-app-text-secondary hover:text-app-text hover:bg-app-surface'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* 右侧 placeholder */}
        <div className="flex-1" />
      </div>
    </header>
  )
}
