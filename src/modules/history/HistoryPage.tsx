import { useTranslation } from 'react-i18next'

export default function HistoryPage() {
  const { t } = useTranslation()

  return (
    <div className="flex h-full flex-col items-center justify-center rounded-xl border border-app-border bg-app-surface p-8">
      <p className="text-lg text-app-text-secondary">{t('history.empty')}</p>
    </div>
  )
}
