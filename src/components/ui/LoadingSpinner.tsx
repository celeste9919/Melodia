export default function LoadingSpinner({ size = 'md', text }: { size?: 'sm' | 'md' | 'lg'; text?: string }) {
  const sizeClasses = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' }

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8">
      <div className={`animate-spin rounded-full border-2 border-app-border border-t-app-primary ${sizeClasses[size]}`} />
      {text && <p className="text-sm text-app-text-secondary">{text}</p>}
    </div>
  )
}
