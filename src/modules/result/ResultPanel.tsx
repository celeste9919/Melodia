import { useState, useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import type { MusicGenerateResult } from '@/types'
import { audioEngine } from '@/services/audio/audio-engine'
import { exportService } from '@/services/export/export-service'
import Button from '@/components/ui/Button'

interface Props {
  result: MusicGenerateResult
  audioBlob: Blob | null
}

export default function ResultPanel({ result, audioBlob }: Props) {
  const { t } = useTranslation()
  const [isPlaying, setIsPlaying] = useState(false)
  const playbackRef = useRef<Awaited<ReturnType<typeof audioEngine.synthesize>> | null>(null)

  const handlePlay = useCallback(async () => {
    if (playbackRef.current) {
      playbackRef.current.play()
      setIsPlaying(true)
      return
    }

    const playback = await audioEngine.synthesize(result.params)
    playbackRef.current = playback
    playback.onEnd(() => setIsPlaying(false))
    playback.play()
    setIsPlaying(true)
  }, [result.params])

  const handlePause = useCallback(() => {
    playbackRef.current?.pause()
    setIsPlaying(false)
  }, [])

  const handleStop = useCallback(() => {
    playbackRef.current?.stop()
    setIsPlaying(false)
  }, [])

  const handleDownloadWav = useCallback(() => {
    if (audioBlob) {
      const filename = `ai-music-${result.id.slice(0, 8)}`
      exportService.downloadWav(audioBlob, filename)
    }
  }, [audioBlob, result.id])

  const handleDownloadMidi = useCallback(() => {
    const filename = `ai-music-${result.id.slice(0, 8)}`
    exportService.downloadMidi(result.params, filename)
  }, [result.params, result.id])

  const { params } = result

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-app-border bg-app-surface p-6">
      {/* 播放控制区 */}
      <div className="flex items-center gap-3">
        <Button
          variant="primary"
          onClick={isPlaying ? handlePause : handlePlay}
        >
          {isPlaying ? t('result.pause') : t('result.play')}
        </Button>
        <Button variant="secondary" onClick={handleStop}>
          {t('result.stop')}
        </Button>
        <div className="flex-1" />
        <Button variant="secondary" size="sm" onClick={handleDownloadWav}>
          {t('result.download.wav')}
        </Button>
        <Button variant="secondary" size="sm" onClick={handleDownloadMidi}>
          {t('result.download.midi')}
        </Button>
      </div>

      {/* 进度条（简化版） */}
      <div className="h-1.5 rounded-full bg-app-border">
        <div
          className="h-full rounded-full bg-app-primary transition-all duration-300"
          style={{ width: isPlaying ? '60%' : '0%' }}
        />
      </div>

      {/* 音乐参数展示 */}
      <div className="grid grid-cols-3 gap-3 rounded-lg bg-app-bg p-4">
        <ParamBadge label={t('result.params.bpm')} value={`${params.bpm}`} />
        <ParamBadge label={t('result.params.key')} value={`${params.key} ${t(params.scale === 'major' ? 'result.params.major' : 'result.params.minor')}`} />
        <ParamBadge label={t('result.params.style')} value={params.style} />
      </div>

      {/* 和弦展示 */}
      {params.chords.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium text-app-text-secondary">{t('result.chord.label')}</p>
          <div className="flex flex-wrap gap-1.5">
            {params.chords.map((c, i) => (
              <span key={i} className="rounded-md bg-app-primary/10 px-2 py-1 text-xs text-app-primary">
                {c.root}{c.quality}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 简易可视化 — 音符密度条 */}
      <div className="flex items-end gap-0.5 h-16">
        {Array.from({ length: 32 }).map((_, i) => {
          const segmentNotes = params.melody.filter(n => n.time >= i * params.duration / 32 && n.time < (i + 1) * params.duration / 32)
          const height = Math.min(100, segmentNotes.length * 12 + 4)
          return (
            <div
              key={i}
              className="flex-1 rounded-t-sm bg-app-primary/60 transition-all"
              style={{ height: `${height}%` }}
            />
          )
        })}
      </div>
    </div>
  )
}

function ParamBadge({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="text-xs text-app-text-secondary">{label}</p>
      <p className="text-sm font-semibold text-app-text">{value}</p>
    </div>
  )
}
