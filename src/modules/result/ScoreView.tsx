import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import type { Note, Chord } from '@/types'
import { scoreRenderer } from '@/services/score/ScoreRenderer'

interface Props {
  melody: Note[]
  chords: Chord[]
  bpm: number
  tonicKey: string
  scale: 'major' | 'minor'
}

export default function ScoreView({ melody, chords, bpm, tonicKey, scale }: Props) {
  const { t } = useTranslation()
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container || melody.length === 0) return

    scoreRenderer.init(container)
    try {
      scoreRenderer.render(melody, chords, bpm, { key: tonicKey, scale })
    } catch {
      // Fallback gracefully
    }

    return () => {
      scoreRenderer.dispose()
    }
  }, [melody, chords, bpm, tonicKey, scale])

  if (melody.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-app-text-secondary text-sm">
        {t('score.empty')}
      </div>
    )
  }

  return (
    <div className="w-full overflow-x-auto">
      <div ref={containerRef} className="min-w-[700px]" />
    </div>
  )
}
