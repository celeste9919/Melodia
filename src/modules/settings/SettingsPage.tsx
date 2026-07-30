import { useTranslation } from 'react-i18next'

export default function SettingsPage() {
  const { t } = useTranslation()

  return (
    <div className="rounded-xl border border-app-border bg-app-surface p-6">
      <h2 className="mb-6 text-lg font-semibold text-app-text">{t('settings.title')}</h2>

      {/* API 配置 */}
      <section className="mb-8">
        <h3 className="mb-3 text-sm font-medium text-app-text-secondary">{t('settings.api.title')}</h3>
        <div className="flex flex-col gap-3">
          <div>
            <label className="mb-1 block text-sm text-app-text">{t('settings.api.key')}</label>
            <input
              type="password"
              name="apiKey"
              placeholder={t('settings.api.key.placeholder')}
              className="w-full max-w-md rounded-lg border border-app-border bg-app-bg px-3 py-2 text-sm text-app-text placeholder:text-app-text-secondary focus:border-app-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-app-text">{t('settings.api.provider')}</label>
            <select className="w-full max-w-md rounded-lg border border-app-border bg-app-bg px-3 py-2 text-sm text-app-text focus:border-app-primary focus:outline-none">
              <option value="deepseek">DeepSeek</option>
              <option value="openai">OpenAI</option>
              <option value="custom">Custom</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm text-app-text">{t('settings.api.model')}</label>
            <input
              type="text"
              name="modelName"
              defaultValue="deepseek-chat"
              className="w-full max-w-md rounded-lg border border-app-border bg-app-bg px-3 py-2 text-sm text-app-text focus:border-app-primary focus:outline-none"
            />
          </div>
        </div>
      </section>

      {/* 语言选择 */}
      <section className="mb-8">
        <h3 className="mb-3 text-sm font-medium text-app-text-secondary">{t('settings.language.title')}</h3>
        <select className="w-full max-w-md rounded-lg border border-app-border bg-app-bg px-3 py-2 text-sm text-app-text focus:border-app-primary focus:outline-none">
          <option value="zh">中文</option>
          <option value="en">English</option>
        </select>
      </section>
    </div>
  )
}
