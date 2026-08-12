import { indexedDBService } from '@/services/storage/storage-service'
import { audioBufferToWavBlob } from '@/services/audio/wav-encoder'
import type { HistoryItem, MusicGenerateRequest, MusicParams } from '@/types'

/**
 * 历史记录服务 — 生成记录的增删改查
 */
export const historyService = {
  async getAll(): Promise<HistoryItem[]> {
    const items = await indexedDBService.getHistoryItems()
    // 按时间倒序排列
    return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  },

  async add(request: MusicGenerateRequest, params: MusicParams, audioBuffer?: AudioBuffer): Promise<HistoryItem> {
    const item: HistoryItem = {
      id: generateId(),
      request,
      params,
      audioData: audioBuffer ? await audioBufferToWavBlob(audioBuffer).arrayBuffer() : undefined,
      createdAt: new Date().toISOString(),
    }

    await indexedDBService.saveHistoryItem(item)
    return item
  },

  async delete(id: string): Promise<void> {
    await indexedDBService.deleteHistoryItem(id)
  },

  async clear(): Promise<void> {
    await indexedDBService.clearHistory()
  },

  async search(query: string): Promise<HistoryItem[]> {
    const all = await this.getAll()
    const q = query.toLowerCase()
    return all.filter(item => {
      const prompt = item.request.prompt?.toLowerCase() || ''
      const lyrics = item.request.lyrics?.toLowerCase() || ''
      return prompt.includes(q) || lyrics.includes(q) || item.request.style.includes(q)
    })
  },
}

function generateId(): string {
  return `hist_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}
