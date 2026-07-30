import { indexedDBService } from '@/services/storage/storage-service'
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
      audioData: audioBuffer ? await audioBufferToArrayBuffer(audioBuffer) : undefined,
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

async function audioBufferToArrayBuffer(buffer: AudioBuffer): Promise<ArrayBuffer> {
  const numChannels = buffer.numberOfChannels
  const length = buffer.length
  const sampleRate = buffer.sampleRate
  const bytesPerSample = 2
  const blockAlign = numChannels * bytesPerSample
  const dataSize = length * blockAlign
  const headerSize = 44
  const arrayBuffer = new ArrayBuffer(headerSize + dataSize)
  const view = new DataView(arrayBuffer)

  writeString(view, 0, 'RIFF')
  view.setUint32(4, 36 + dataSize, true)
  writeString(view, 8, 'WAVE')
  writeString(view, 12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, numChannels, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * blockAlign, true)
  view.setUint16(32, blockAlign, true)
  view.setUint16(34, bytesPerSample * 8, true)
  writeString(view, 36, 'data')
  view.setUint32(40, dataSize, true)

  const offset = 44
  for (let i = 0; i < length; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      const sample = Math.max(-1, Math.min(1, buffer.getChannelData(ch)[i]))
      const int16 = sample < 0 ? sample * 0x8000 : sample * 0x7FFF
      view.setInt16(offset + i * blockAlign + ch * bytesPerSample, int16, true)
    }
  }

  return arrayBuffer
}

function writeString(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i))
  }
}
