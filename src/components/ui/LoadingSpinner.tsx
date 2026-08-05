export default function LoadingSpinner({ size = 'md', text }: { size?: 'sm' | 'md' | 'lg'; text?: string }) {
  const sizeClasses = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' }

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-8">
      {/* 音符跳动动画 */}
      <div className="flex items-end gap-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`rounded-sm bg-app-primary ${sizeClasses[size]}`}
            style={{
              animation: `noteBounce 0.6s ease-in-out ${i * 0.15}s infinite alternate`,
              width: size === 'sm' ? '4px' : size === 'lg' ? '8px' : '6px',
            }}
          />
        ))}
      </div>
      {text && (
        <div className="flex items-center gap-1">
          <p className="text-sm text-app-text-secondary">{text}</p>
          <span className="inline-flex gap-0.5">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="inline-block h-1 w-1 rounded-full bg-app-primary/60"
                style={{ animation: `dotPulse 1.2s ease-in-out ${i * 0.2}s infinite` }}
              />
            ))}
          </span>
        </div>
      )}
    </div>
  )
}
