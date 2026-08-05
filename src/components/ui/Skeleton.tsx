function Bar({ className }: { className?: string }) {
  return (
    <div
      className={`rounded bg-gradient-to-r from-app-border via-app-bg to-app-border bg-[length:200%_100%] ${className || ''}`}
      style={{ animation: 'shimmer 1.5s ease-in-out infinite' }}
    />
  )
}

export function SkeletonResultPanel() {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-app-border bg-app-surface p-6">
      {/* 播放按钮区域 */}
      <div className="flex items-center gap-3">
        <Bar className="h-9 w-20 rounded-lg" />
        <Bar className="h-9 w-16 rounded-lg" />
        <div className="flex-1" />
        <Bar className="h-8 w-20 rounded-lg" />
        <Bar className="h-8 w-20 rounded-lg" />
      </div>

      {/* 进度条 */}
      <Bar className="h-1.5 w-full rounded-full" />

      {/* 视图切换 */}
      <div className="flex gap-2">
        <Bar className="h-6 w-16 rounded-full" />
        <Bar className="h-6 w-12 rounded-full" />
      </div>

      {/* 参数卡片 */}
      <div className="grid grid-cols-3 gap-3">
        <Bar className="h-16 rounded-lg" />
        <Bar className="h-16 rounded-lg" />
        <Bar className="h-16 rounded-lg" />
      </div>

      {/* 和弦标签 */}
      <Bar className="h-4 w-24" />
      <div className="flex flex-wrap gap-1.5">
        {Array.from({ length: 8 }).map((_, i) => (
          <Bar key={i} className="h-6 w-14 rounded-md" />
        ))}
      </div>

      {/* 音符密度图 */}
      <Bar className="h-16 w-full rounded-lg" />
    </div>
  )
}
