import { useState, useCallback, useRef, lazy, Suspense, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { MusicGenerateResult } from '@/types'
import { audioEngine } from '@/services/audio/audio-engine'
import { exportService } from '@/services/export/export-service'
import Button from '@/components/ui/Button'

const ScoreView = lazy(() => import('./ScoreView'))

interface Props {
  result: MusicGenerateResult
  audioBlob: Blob | null
}

export default function ResultPanel({ result, audioBlob }: Props) {
  const { t } = useTranslation()
  const [isPlaying, setIsPlaying] = useState(false)
  const [viewMode, setViewMode] = useState<'viz' | 'score'>('viz')
  const [currentTime, setCurrentTime] = useState(0)
  const [vocalEnabled, setVocalEnabled] = useState(true)
  const [volume, setVolume] = useState(audioEngine.getVolume())
  const [loop, setLoop] = useState(audioEngine.getLoop())
  const hasVocals = result.params.vocals && result.params.vocals.length > 0
  const playbackRef = useRef<Awaited<ReturnType<typeof audioEngine.synthesize>> | null>(null)
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const clearProgressInterval = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
      progressIntervalRef.current = null
    }
  }, [])

  const handlePlay = useCallback(async () => {
    if (playbackRef.current) {
      playbackRef.current.play()
      setIsPlaying(true)
      clearProgressInterval()
      progressIntervalRef.current = setInterval(() => {
        setCurrentTime(playbackRef.current?.getCurrentTime() || 0)
        if (!playbackRef.current?.isPlaying?.()) {
          setIsPlaying(false)
          clearProgressInterval()
          setCurrentTime(0)
        }
      }, 50)
      return
    }

    const playback = await audioEngine.synthesize(result.params)
    playbackRef.current = playback
    playback.onEnd(() => {
      setIsPlaying(false)
      clearProgressInterval()
      if (!audioEngine.getLoop()) setCurrentTime(0)
    })
    playback.play()
    setIsPlaying(true)
    clearProgressInterval()
    progressIntervalRef.current = setInterval(() => {
      setCurrentTime(playbackRef.current?.getCurrentTime() || 0)
      if (!playbackRef.current?.isPlaying?.()) {
        setIsPlaying(false)
        clearProgressInterval()
      }
    }, 50)
  }, [result.params, clearProgressInterval])

  const handlePause = useCallback(() => {
    playbackRef.current?.pause()
    setIsPlaying(false)
    clearProgressInterval()
  }, [clearProgressInterval])

  const handleStop = useCallback(() => {
    playbackRef.current?.stop()
    setIsPlaying(false)
    setCurrentTime(0)
    clearProgressInterval()
  }, [clearProgressInterval])

  const handleVolumeChange = useCallback((v: number) => {
    setVolume(v)
    audioEngine.setVolume(v)
  }, [])

  const handleLoopToggle = useCallback(() => {
    const next = !loop
    setLoop(next)
    audioEngine.setLoop(next)
  }, [loop])

  const handleDownloadWav = useCallback(() => {
    if (audioBlob) {
      const filename = `melodia-${result.id.slice(0, 8)}`
      exportService.downloadWav(audioBlob, filename)
    }
  }, [audioBlob, result.id])

  const handleDownloadMidi = useCallback(() => {
    const filename = `melodia-${result.id.slice(0, 8)}`
    exportService.downloadMidi(result.params, filename)
  }, [result.params, result.id])

  const handleToggleVocal = useCallback(() => {
    const enabled = audioEngine.toggleVocal()
    setVocalEnabled(enabled)
  }, [])

  const { params } = result
  const duration = playbackRef.current?.getDuration() || params.duration
  const realProgress = duration > 0 ? (currentTime / duration) * 100 : 0
  const progress = isPlaying || currentTime > 0 ? realProgress : 0

  // Expose play/pause/stop for keyboard shortcuts
  useEffect(() => {
    ;(window as unknown as Record<string, unknown>).__melodiaPlayer = { handlePlay, handlePause, handleStop, isPlaying }
    return () => { delete (window as unknown as Record<string, unknown>).__melodiaPlayer }
  }, [handlePlay, handlePause, handleStop, isPlaying])

  // 组件卸载时停止播放 + 清除定时器
  useEffect(() => {
    return () => {
      clearProgressInterval()
      playbackRef.current?.stop()
    }
  }, [clearProgressInterval])

  // 预计算音符密度（避免每 50ms 重算 32 段）
  const densityData = useMemo(() => {
    return Array.from({ length: 32 }).map((_, i) => {
      const count = params.melody.filter(
        n => n.time >= i * params.duration / 32 && n.time < (i + 1) * params.duration / 32
      ).length
      return Math.min(100, count * 12 + 4)
    })
  }, [params.melody, params.duration])

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-app-border bg-app-surface p-6">
      {/* 播放控制区 */}
      <div className="flex items-center gap-3 flex-wrap">
        <Button
          variant="primary"
          onClick={isPlaying ? handlePause : handlePlay}
        >
          {isPlaying ? t('result.pause') : t('result.play')}
        </Button>
        <Button variant="secondary" onClick={handleStop}>
          {t('result.stop')}
        </Button>

        {/* 音量 */}
        <div className="flex items-center gap-1.5 ml-2">
          <span className="text-xs text-app-text-secondary/70">🔊</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={volume}
            onChange={(e) => handleVolumeChange(Number(e.target.value))}
            className="w-16 sm:w-20 h-1 accent-app-primary cursor-pointer"
          />
        </div>

        {/* 循环 */}
        <button
          onClick={handleLoopToggle}
          className={`rounded-md px-2 py-1 text-xs transition-colors ${
            loop ? 'bg-app-primary/20 text-app-primary' : 'text-app-text-secondary/50 hover:text-app-text-secondary'
          }`}
        >
          🔄 {loop ? t('result.loop.on') : t('result.loop.off')}
        </button>

        <div className="flex-1" />
        <Button variant="secondary" size="sm" onClick={handleDownloadWav}>
          {t('result.download.wav')}
        </Button>
        <Button variant="secondary" size="sm" onClick={handleDownloadMidi}>
          {t('result.download.midi')}
        </Button>
      </div>

      {/* 进度条 */}
      <div className="h-1.5 rounded-full bg-app-border">
        <div
          className="h-full rounded-full bg-app-primary transition-all duration-150"
          style={{ width: `${Math.min(100, progress)}%` }}
        />
      </div>

      {/* 视图切换 + 人声开关 */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setViewMode('viz')}
          className={`rounded-full px-3 py-1 text-xs transition-colors ${viewMode === 'viz' ? 'bg-app-primary text-white' : 'bg-app-bg text-app-text-secondary hover:bg-app-border'}`}
        >
          {t('result.view.viz')}
        </button>
        <button
          onClick={() => setViewMode('score')}
          className={`rounded-full px-3 py-1 text-xs transition-colors ${viewMode === 'score' ? 'bg-app-primary text-white' : 'bg-app-bg text-app-text-secondary hover:bg-app-border'}`}
        >
          {t('result.view.score')}
        </button>
        {hasVocals && (
          <button
            onClick={handleToggleVocal}
            className={`rounded-full px-3 py-1 text-xs transition-colors ${vocalEnabled ? 'bg-green-500 text-white' : 'bg-app-bg text-app-text-secondary hover:bg-app-border'}`}
          >
            {vocalEnabled ? t('result.vocal.on') : t('result.vocal.off')}
          </button>
        )}
      </div>

      {/* 音乐参数展示 */}
      {viewMode === 'viz' && (
        <>
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

          {/* 音符密度条 */}
          <div className="flex items-end gap-0.5 h-16">
            {densityData.map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-t-sm bg-app-primary/60 transition-all"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>

          {/* 人声歌词展示 */}
          {hasVocals && (
            <div>
              <p className="mb-2 text-xs font-medium text-app-text-secondary">{t('result.vocal.lyrics')}</p>
              <div className="flex flex-wrap gap-1.5">
                {params.vocals?.map((v, i) => (
                  <span key={i} className="rounded-md bg-green-500/10 px-2 py-1 text-xs text-green-500">
                    {v.lyric || v.vowel}
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {viewMode === 'score' && (
        <Suspense fallback={<div className="flex h-40 items-center justify-center text-app-text-secondary text-sm">{t('common.loading')}</div>}>
          <ScoreView
            melody={params.melody}
            chords={params.chords}
            bpm={params.bpm}
            tonicKey={params.key}
            scale={params.scale}
          />
        </Suspense>
      )}
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
