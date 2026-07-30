import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { HistoryItem } from '@/types'
import { historyService } from '@/services/history/history-service'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function HistoryPage() {
  const { t } = useTranslation()
  const [items, setItems] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  const loadHistory = async () => {
    setLoading(true)
    try {
      const data = searchQuery
        ? await historyService.search(searchQuery)
        : await historyService.getAll()
      setItems(data)
    } catch {
      // IndexedDB 读取失败
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadHistory()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery])

  const handleDelete = async (id: string) => {
    await historyService.delete(id)
    loadHistory()
  }

  const handleClear = async () => {
    if (window.confirm(t('history.clear') + '?')) {
      await historyService.clear()
      setItems([])
    }
  }

  return (
    <div className="flex h-full flex-col gap-4 overflow-auto rounded-xl border border-app-border bg-app-surface p-6">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-semibold text-app-text">{t('history.title')}</h2>
        <div className="flex-1" />
        {items.length > 0 && (
          <Button variant="ghost" size="sm" onClick={handleClear}>
            {t('history.clear')}
          </Button>
        )}
      </div>

      {/* 搜索框 */}
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder={t('history.search')}
        className="rounded-lg border border-app-border bg-app-bg px-3 py-2 text-sm text-app-text placeholder:text-app-text-secondary focus:border-app-primary focus:outline-none"
      />

      {loading && <LoadingSpinner />}

      {!loading && items.length === 0 && (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-app-text-secondary">{t('history.empty')}</p>
        </div>
      )}

      {!loading && items.length > 0 && (
        <div className="flex flex-col gap-2 overflow-auto">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 rounded-lg border border-app-border bg-app-bg p-3 transition-colors hover:bg-app-surface"
            >
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm text-app-text">
                  {item.request.prompt || item.request.lyrics || t('history.empty')}
                </p>
                <p className="mt-1 text-xs text-app-text-secondary">
                  {item.params.bpm} BPM &middot; {item.params.key} &middot; {item.params.style} &middot; {formatDate(item.createdAt)}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)}>
                {t('history.delete')}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
}
