import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import type { MusicGenerateRequest, MusicGenerateResult } from '@/types'
import { musicOrchestrator, OrchestratorError } from '@/services/orchestrator/music-orchestrator'
import { historyService } from '@/services/history/history-service'
import { audioEngine } from '@/services/audio/audio-engine'
import InputPanel from './InputPanel'
import WelcomeHero from './WelcomeHero'
import ResultPanel from '@/modules/result/ResultPanel'
import ErrorMessage from '@/components/ui/ErrorMessage'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { SkeletonResultPanel } from '@/components/ui/Skeleton'

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

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') return

      const player = (window as unknown as Record<string, unknown>).__melodiaPlayer as {
        handlePlay: () => void; handlePause: () => void; handleStop: () => void; isPlaying: boolean
      } | undefined

      if (e.code === 'Space') {
        e.preventDefault()
        if (player) {
          player.isPlaying ? player.handlePause() : player.handlePlay()
        }
      } else if (e.code === 'Escape') {
        player?.handleStop()
      } else if ((e.ctrlKey || e.metaKey) && e.code === 'Enter') {
        e.preventDefault()
        document.querySelector<HTMLFormElement>('form')?.requestSubmit()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className="grid h-full grid-cols-1 gap-6 lg:grid-cols-2 overflow-auto">
      <InputPanel onSubmit={handleSubmit} isGenerating={isGenerating} />

      <div className="flex flex-col gap-4 overflow-auto">
        {isGenerating && (
          <div className="flex flex-col gap-4">
            <LoadingSpinner text={t('result.loading')} />
            <SkeletonResultPanel />
          </div>
        )}

        {error && (
          <ErrorMessage
            message={error.message}
            code={error.code}
          />
        )}

        {!isGenerating && !error && !result && <WelcomeHero />}

        {!isGenerating && result && (
          <ResultPanel result={result} audioBlob={audioBlob} />
        )}
      </div>
    </div>
  )
}
