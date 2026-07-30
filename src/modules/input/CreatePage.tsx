import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { MusicGenerateRequest, MusicGenerateResult } from '@/types'
import { musicOrchestrator, OrchestratorError } from '@/services/orchestrator/music-orchestrator'
import { historyService } from '@/services/history/history-service'
import { audioEngine } from '@/services/audio/audio-engine'
import InputPanel from './InputPanel'
import ResultPanel from '@/modules/result/ResultPanel'
import ErrorMessage from '@/components/ui/ErrorMessage'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function CreatePage() {
  const { t } = useTranslation()
  const [result, setResult] = useState<MusicGenerateResult | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<{ message: string; code: string } | null>(null)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)

  const handleSubmit = async (request: MusicGenerateRequest) => {
    setIsGenerating(true)
    setError(null)
    setResult(null)
    setAudioBlob(null)

    try {
      const musicResult = await musicOrchestrator.generate(request)
      setResult(musicResult)

      // 追加音频合成并保存历史
      try {
        const wavBlob = await audioEngine.exportWav(musicResult.params)
        setAudioBlob(wavBlob)
        await historyService.add(request, musicResult.params)
      } catch {
        // 音频合成失败不阻塞主流程
      }
    } catch (e) {
      if (e instanceof OrchestratorError) {
        setError({ message: e.message, code: e.code })
      } else if (e instanceof Error) {
        setError({ message: e.message, code: 'UNKNOWN' })
      } else {
        setError({ message: t('common.error'), code: 'UNKNOWN' })
      }
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="grid h-full grid-cols-1 gap-6 lg:grid-cols-2 overflow-auto">
      <InputPanel onSubmit={handleSubmit} isGenerating={isGenerating} />

      <div className="flex flex-col gap-4 overflow-auto">
        {isGenerating && <LoadingSpinner text={t('result.loading')} />}

        {error && (
          <ErrorMessage
            message={error.message}
            code={error.code}
          />
        )}

        {!isGenerating && !error && !result && (
          <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-app-border bg-app-surface/50 p-8">
            <span className="mb-3 text-4xl opacity-40">&#x1F3B6;</span>
            <p className="text-lg font-medium text-app-text-secondary">{t('result.empty.title')}</p>
            <p className="mt-1 text-sm text-app-text-secondary/60">{t('result.empty.desc')}</p>
          </div>
        )}

        {!isGenerating && result && (
          <ResultPanel result={result} audioBlob={audioBlob} />
        )}
      </div>
    </div>
  )
}
