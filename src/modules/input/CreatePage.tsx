import InputPanel from './InputPanel'
import { useState } from 'react'
import type { MusicGenerateRequest } from '@/types'

export default function CreatePage() {
  const [isGenerating, setIsGenerating] = useState(false)

  const handleSubmit = (_request: MusicGenerateRequest) => {
    // 阶段 2 实现：调用 MusicOrchestrator
    setIsGenerating(true)
    setTimeout(() => setIsGenerating(false), 1000)
  }

  return (
    <div className="grid h-full grid-cols-1 gap-6 lg:grid-cols-2">
      <InputPanel onSubmit={handleSubmit} isGenerating={isGenerating} />
      {/* ResultPanel — 阶段 3 实现 */}
      <div className="flex items-center justify-center rounded-xl border border-app-border bg-app-surface">
        <p className="text-app-text-secondary">等待创作...</p>
      </div>
    </div>
  )
}
