import { useTranslation } from 'react-i18next'
import type { MusicGenerateRequest } from '@/types'
import { STYLE_PRESETS } from '@/services/prompt/style-presets'

interface Props {
  onSubmit: (request: MusicGenerateRequest) => void
  isGenerating: boolean
}

export default function InputPanel({ onSubmit, isGenerating }: Props) {
  const { t } = useTranslation()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const formData = new FormData(form)

    const request: MusicGenerateRequest = {
      mode: formData.get('mode') as 'text' | 'lyrics',
      style: formData.get('style') as string,
      duration: Number(formData.get('duration')) || 30,
    }

    if (request.mode === 'text') {
      request.prompt = formData.get('prompt') as string
    } else {
      request.lyrics = formData.get('lyrics') as string
    }

    const tempo = formData.get('tempo')
    if (tempo) request.tempo = Number(tempo)

    const key = formData.get('key')
    if (key) request.key = key as string

    onSubmit(request)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-xl border border-app-border bg-app-surface p-6">
      <h2 className="text-lg font-semibold text-app-text">{t('nav.create')}</h2>

      {/* 输入模式切换 */}
      <div className="flex gap-2">
        <label className="flex items-center gap-2">
          <input type="radio" name="mode" value="text" defaultChecked className="accent-app-primary" />
          <span className="text-sm text-app-text">{t('input.mode.text')}</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="radio" name="mode" value="lyrics" className="accent-app-primary" />
          <span className="text-sm text-app-text">{t('input.mode.lyrics')}</span>
        </label>
      </div>

      {/* 文字输入 */}
      <textarea
        name="prompt"
        rows={5}
        placeholder={t('input.prompt.placeholder')}
        className="rounded-lg border border-app-border bg-app-bg px-4 py-3 text-sm text-app-text placeholder:text-app-text-secondary focus:border-app-primary focus:outline-none"
      />

      {/* 风格选择 */}
      <div>
        <label className="mb-2 block text-sm text-app-text-secondary">{t('input.style.label')}</label>
        <select name="style" className="w-full rounded-lg border border-app-border bg-app-bg px-3 py-2 text-sm text-app-text focus:border-app-primary focus:outline-none">
          {STYLE_PRESETS.map((s) => (
            <option key={s.id} value={s.id}>{t(s.nameKey)}</option>
          ))}
        </select>
      </div>

      {/* 参数调节 */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="mb-1 block text-xs text-app-text-secondary">{t('input.tempo.label')}</label>
          <input
            type="number"
            name="tempo"
            min={40}
            max={200}
            placeholder="120"
            className="w-full rounded-lg border border-app-border bg-app-bg px-3 py-2 text-sm text-app-text focus:border-app-primary focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-app-text-secondary">{t('input.key.label')}</label>
          <select name="key" className="w-full rounded-lg border border-app-border bg-app-bg px-3 py-2 text-sm text-app-text focus:border-app-primary focus:outline-none">
            {['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].map((k) => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-app-text-secondary">{t('input.duration.label')}</label>
          <input
            type="number"
            name="duration"
            min={10}
            max={120}
            defaultValue={30}
            className="w-full rounded-lg border border-app-border bg-app-bg px-3 py-2 text-sm text-app-text focus:border-app-primary focus:outline-none"
          />
        </div>
      </div>

      {/* 提交按钮 */}
      <button
        type="submit"
        disabled={isGenerating}
        className="mt-2 rounded-lg bg-app-primary px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-app-primary-hover disabled:opacity-50"
      >
        {isGenerating ? t('input.submitting') : t('input.submit')}
      </button>
    </form>
  )
}
