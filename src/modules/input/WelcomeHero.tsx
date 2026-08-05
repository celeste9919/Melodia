import { useTranslation } from 'react-i18next'
import { STYLE_PRESETS } from '@/services/prompt/style-presets'

export default function WelcomeHero() {
  const { t } = useTranslation()

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-8 text-center">
      {/* 主视觉 */}
      <div className="relative mb-6">
        <div className="absolute inset-0 animate-pulse rounded-full bg-app-primary/20 blur-2xl" />
        <span className="relative text-6xl sm:text-7xl animate-bounce">🎵</span>
      </div>

      {/* 标题 */}
      <h1 className="mb-2 text-2xl font-bold text-app-text sm:text-3xl">{t('app.title')}</h1>
      <p className="mb-8 text-sm text-app-text-secondary sm:text-base">{t('app.tagline')}</p>

      {/* 快速指引 */}
      <div className="mb-8 grid grid-cols-3 gap-3 w-full max-w-lg">
        {[
          { num: '1', icon: '✏️', text: '输入描述' },
          { num: '2', icon: '✨', text: 'AI 生成' },
          { num: '3', icon: '🎧', text: '播放导出' },
        ].map((step) => (
          <div key={step.num} className="flex flex-col items-center gap-1.5 rounded-xl bg-app-bg p-3">
            <span className="text-xl">{step.icon}</span>
            <span className="text-xs text-app-text-secondary">{step.text}</span>
          </div>
        ))}
      </div>

      {/* 风格标签 */}
      <p className="mb-3 text-xs text-app-text-secondary/70">支持多种音乐风格</p>
      <div className="flex flex-wrap justify-center gap-1.5 max-w-md">
        {STYLE_PRESETS.map((s) => (
          <span
            key={s.id}
            className="rounded-full border border-app-border px-3 py-1 text-xs text-app-text-secondary"
          >
            {t(s.nameKey)}
          </span>
        ))}
      </div>

      {/* 底部提示 */}
      <p className="mt-6 text-xs text-app-text-secondary/50">
        左侧输入灵感，开启你的第一首 AI 音乐
      </p>
    </div>
  )
}
