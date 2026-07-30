import { useTranslation } from 'react-i18next'

interface Props {
  message: string
  code?: string
  onRetry?: () => void
}

export default function ErrorMessage({ message, code, onRetry }: Props) {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center">
      <span className="text-2xl">&#x26A0;</span>
      <p className="text-sm text-red-400">{message}</p>
      {code && <p className="text-xs text-app-text-secondary">Code: {code}</p>}
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-1 rounded-lg bg-app-primary px-4 py-1.5 text-xs text-white hover:bg-app-primary-hover"
        >
          {t('common.retry')}
        </button>
      )}
    </div>
  )
}
