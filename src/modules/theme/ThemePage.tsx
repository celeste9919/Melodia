import { useTranslation } from 'react-i18next'

export default function ThemePage() {
  const { t } = useTranslation()

  return (
    <div className="rounded-xl border border-app-border bg-app-surface p-6">
      <h2 className="mb-6 text-lg font-semibold text-app-text">{t('theme.custom.title')}</h2>
      <p className="text-sm text-app-text-secondary">{t('theme.custom.upload')}</p>
      {/* 图片导入自定义主题将在阶段 3 实现 */}
    </div>
  )
}
