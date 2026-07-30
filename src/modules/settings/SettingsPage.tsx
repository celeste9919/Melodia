import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { configService } from '@/services/config/config-service'
import type { AppConfig } from '@/types'

export default function SettingsPage() {
  const { t, i18n } = useTranslation()
  const [config, setConfig] = useState<AppConfig>(configService.getConfig())
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setConfig(configService.getConfig())
  }, [])

  const handleSave = () => {
    configService.setConfig(config)
    i18n.changeLanguage(config.language)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const updateField = <K extends keyof AppConfig>(key: K, value: AppConfig[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="overflow-auto rounded-xl border border-app-border bg-app-surface p-6">
      <h2 className="mb-6 text-lg font-semibold text-app-text">{t('settings.title')}</h2>

      {/* API 配置 */}
      <section className="mb-8">
        <h3 className="mb-3 text-sm font-medium text-app-text-secondary">{t('settings.api.title')}</h3>
        <div className="flex flex-col gap-3">
          <div>
            <label className="mb-1 block text-sm text-app-text">{t('settings.api.key')}</label>
            <input
              type="password"
              value={config.apiKey}
              onChange={(e) => updateField('apiKey', e.target.value)}
              placeholder={t('settings.api.key.placeholder')}
              className="w-full max-w-md rounded-lg border border-app-border bg-app-bg px-3 py-2 text-sm text-app-text placeholder:text-app-text-secondary focus:border-app-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-app-text">{t('settings.api.provider')}</label>
            <select
              value={config.modelProvider}
              onChange={(e) => updateField('modelProvider', e.target.value as AppConfig['modelProvider'])}
              className="w-full max-w-md rounded-lg border border-app-border bg-app-bg px-3 py-2 text-sm text-app-text focus:border-app-primary focus:outline-none"
            >
              <option value="deepseek">{t('settings.provider.deepseek')}</option>
              <option value="openai">{t('settings.provider.openai')}</option>
              <option value="custom">{t('settings.provider.custom')}</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm text-app-text">{t('settings.api.model')}</label>
            <input
              type="text"
              value={config.modelName}
              onChange={(e) => updateField('modelName', e.target.value)}
              className="w-full max-w-md rounded-lg border border-app-border bg-app-bg px-3 py-2 text-sm text-app-text focus:border-app-primary focus:outline-none"
            />
          </div>
          {config.modelProvider === 'custom' && (
            <div>
              <label className="mb-1 block text-sm text-app-text">{t('settings.api.endpoint')}</label>
              <input
                type="text"
                value={config.apiEndpoint || ''}
                onChange={(e) => updateField('apiEndpoint', e.target.value)}
                placeholder="https://api.example.com/v1/chat/completions"
                className="w-full max-w-md rounded-lg border border-app-border bg-app-bg px-3 py-2 text-sm text-app-text placeholder:text-app-text-secondary focus:border-app-primary focus:outline-none"
              />
            </div>
          )}
        </div>
      </section>

      {/* 语言和主题 */}
      <section className="mb-8">
        <h3 className="mb-3 text-sm font-medium text-app-text-secondary">{t('settings.language.title')}</h3>
        <div className="grid grid-cols-2 gap-4 max-w-md">
          <div>
            <label className="mb-1 block text-sm text-app-text">{t('settings.language.title')}</label>
            <select
              value={config.language}
              onChange={(e) => updateField('language', e.target.value as 'zh' | 'en')}
              className="w-full rounded-lg border border-app-border bg-app-bg px-3 py-2 text-sm text-app-text focus:border-app-primary focus:outline-none"
            >
              <option value="zh">中文</option>
              <option value="en">English</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm text-app-text">{t('settings.theme.title')}</label>
            <select
              value={config.themeMode}
              onChange={(e) => updateField('themeMode', e.target.value as AppConfig['themeMode'])}
              className="w-full rounded-lg border border-app-border bg-app-bg px-3 py-2 text-sm text-app-text focus:border-app-primary focus:outline-none"
            >
              <option value="dark">{t('settings.theme.dark')}</option>
              <option value="light">{t('settings.theme.light')}</option>
              <option value="system">{t('settings.theme.system')}</option>
            </select>
          </div>
        </div>
      </section>

      {/* 保存按钮 */}
      <button
        onClick={handleSave}
        className="rounded-lg bg-app-primary px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-app-primary-hover"
      >
        {saved ? t('settings.saved') : t('common.save')}
      </button>
    </div>
  )
}
