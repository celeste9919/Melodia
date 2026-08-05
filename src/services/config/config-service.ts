import { localStorageService } from '@/services/storage/storage-service'
import type { AppConfig, ModelConfig } from '@/types'

const CONFIG_KEY = 'melodia-config'

const DEFAULT_CONFIG: AppConfig = {
  apiKey: '',
  modelProvider: 'deepseek',
  modelName: 'deepseek-chat',
  apiEndpoint: '',
  language: 'zh',
  themeMode: 'dark',
}

export const configService = {
  getConfig(): AppConfig {
    const saved = localStorageService.get<AppConfig>(CONFIG_KEY)
    return { ...DEFAULT_CONFIG, ...saved }
  },

  setConfig(partial: Partial<AppConfig>): void {
    const current = this.getConfig()
    const updated = { ...current, ...partial }
    localStorageService.set(CONFIG_KEY, updated)
  },

  getApiKey(): string {
    return this.getConfig().apiKey
  },

  getModelConfig(): ModelConfig {
    const c = this.getConfig()
    return {
      provider: c.modelProvider,
      apiKey: c.apiKey,
      modelName: c.modelName,
      apiEndpoint: c.apiEndpoint || undefined,
    }
  },

  hasApiKey(): boolean {
    return this.getConfig().apiKey.length > 0
  },

  setLanguage(lang: 'zh' | 'en'): void {
    this.setConfig({ language: lang })
  },

  getLanguage(): 'zh' | 'en' {
    return this.getConfig().language
  },
}
