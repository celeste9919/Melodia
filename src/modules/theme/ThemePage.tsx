import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { themeService } from '@/services/theme/theme-service'
import type { ThemeColors } from '@/types'
import Button from '@/components/ui/Button'

export default function ThemePage() {
  const { t } = useTranslation()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [extractedColors, setExtractedColors] = useState<ThemeColors | null>(null)
  const [previewColors, setPreviewColors] = useState<ThemeColors | null>(null)
  const [isExtracting, setIsExtracting] = useState(false)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsExtracting(true)
    try {
      const colors = await themeService.applyCustomTheme(file)
      setExtractedColors(colors)
      setPreviewColors(colors)
    } catch {
      // 图片加载失败
    } finally {
      setIsExtracting(false)
    }
  }

  const handleReset = () => {
    themeService.resetTheme()
    setExtractedColors(null)
    setPreviewColors(null)
  }

  return (
    <div className="overflow-auto rounded-xl border border-app-border bg-app-surface p-6">
      <h2 className="mb-6 text-lg font-semibold text-app-text">{t('theme.custom.title')}</h2>

      {/* 图片上传 */}
      <div className="mb-6">
        <p className="mb-3 text-sm text-app-text-secondary">{t('theme.custom.upload')}</p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => fileInputRef.current?.click()} disabled={isExtracting}>
            {isExtracting ? t('common.loading') : t('theme.custom.upload')}
          </Button>
          {extractedColors && (
            <Button variant="ghost" onClick={handleReset}>
              {t('theme.custom.reset')}
            </Button>
          )}
        </div>
      </div>

      {/* 颜色预览 */}
      {previewColors && (
        <div>
          <p className="mb-3 text-sm text-app-text-secondary">{t('theme.custom.preview')}</p>
          <div className="grid grid-cols-4 gap-3">
            <ColorSwatch label={t('theme.color.bg')} color={previewColors.bg} />
            <ColorSwatch label={t('theme.color.surface')} color={previewColors.surface} />
            <ColorSwatch label={t('theme.color.primary')} color={previewColors.primary} />
            <ColorSwatch label={t('theme.color.accent')} color={previewColors.accent} />
            <ColorSwatch label={t('theme.color.border')} color={previewColors.border} />
            <ColorSwatch label={t('theme.color.text')} color={previewColors.text} />
            <ColorSwatch label={t('theme.color.textSecondary')} color={previewColors.textSecondary} />
            <ColorSwatch label={t('theme.color.primaryHover')} color={previewColors.primaryHover} />
          </div>
        </div>
      )}

      {/* 预览卡片 */}
      {previewColors && (
        <div className="mt-6 rounded-xl border border-app-border p-4">
          <p className="mb-3 text-sm text-app-text-secondary">{t('theme.preview.label')}</p>
          <div className="flex gap-3">
            <button className="rounded-lg bg-app-primary px-4 py-2 text-sm text-white">{t('theme.preview.btn.primary')}</button>
            <button className="rounded-lg border border-app-border bg-app-surface px-4 py-2 text-sm text-app-text">{t('theme.preview.btn.secondary')}</button>
          </div>
        </div>
      )}
    </div>
  )
}

function ColorSwatch({ label, color }: { label: string; color: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="h-10 w-10 rounded-lg border border-app-border" style={{ backgroundColor: color }} />
      <span className="text-xs text-app-text">{color}</span>
      <span className="text-xs text-app-text-secondary">{label}</span>
    </div>
  )
}
