import type { HistoryItem } from '@/types'

// === LocalStorage 部分（小数据：配置、设置） ===

export const localStorageService = {
  get<T>(key: string): T | null {
    try {
      const raw = localStorage.getItem(key)
      return raw ? (JSON.parse(raw) as T) : null
    } catch {
      return null
    }
  },

  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (e) {
      console.warn('LocalStorage write failed:', e)
    }
  },

  remove(key: string): void {
    localStorage.removeItem(key)
  },
}

// === IndexedDB 部分（大容量数据：历史音频） ===

const DB_NAME = 'melodia'
const DB_VERSION = 1

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains('history')) {
        db.createObjectStore('history', { keyPath: 'id' })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export const indexedDBService = {
  async saveHistoryItem(item: HistoryItem): Promise<void> {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction('history', 'readwrite')
      tx.objectStore('history').put(item)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  },

  async getHistoryItems(): Promise<HistoryItem[]> {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction('history', 'readonly')
      const request = tx.objectStore('history').getAll()
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  },

  async deleteHistoryItem(id: string): Promise<void> {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction('history', 'readwrite')
      tx.objectStore('history').delete(id)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  },

  async clearHistory(): Promise<void> {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction('history', 'readwrite')
      tx.objectStore('history').clear()
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  },
}
