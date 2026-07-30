import type { ModelConfig } from '@/types'

interface AICallOptions {
  modelConfig: ModelConfig
  prompt: string
  signal?: AbortSignal
}

interface AICallResult {
  content: string
  usage?: {
    promptTokens: number
    completionTokens: number
  }
}

// 不同提供商的 API 端点
const ENDPOINTS: Record<string, string> = {
  deepseek: 'https://api.deepseek.com/v1/chat/completions',
  openai: 'https://api.openai.com/v1/chat/completions',
}

/**
 * AI 客户端 — 调用 LLM API，处理错误映射
 * 默认支持 DeepSeek 和 OpenAI 兼容格式
 */
export const aiClient = {
  async call(options: AICallOptions): Promise<AICallResult> {
    const { modelConfig, prompt, signal } = options

    const endpoint = modelConfig.apiEndpoint || ENDPOINTS[modelConfig.provider] || ENDPOINTS.deepseek

    const body = {
      model: modelConfig.modelName,
      messages: [
        { role: 'system', content: 'You are a music composition AI. Output valid JSON only.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.8,
      max_tokens: 4096,
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${modelConfig.apiKey}`,
      },
      body: JSON.stringify(body),
      signal,
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => '')
      if (response.status === 401) {
        throw new AIError('API Key 无效或未配置，请检查设置', 'UNAUTHORIZED')
      }
      if (response.status === 429) {
        throw new AIError('请求过于频繁，请稍后再试', 'RATE_LIMITED')
      }
      throw new AIError(`API 错误 (${response.status}): ${errorText}`, 'API_ERROR')
    }

    const json = await response.json()
    const content = json.choices?.[0]?.message?.content || ''

    return {
      content,
      usage: json.usage ? {
        promptTokens: json.usage.prompt_tokens,
        completionTokens: json.usage.completion_tokens,
      } : undefined,
    }
  },
}

/**
 * AI 相关错误
 */
export class AIError extends Error {
  code: string

  constructor(message: string, code: string) {
    super(message)
    this.name = 'AIError'
    this.code = code
  }
}

/**
 * 检查是否为网络错误
 */
export function isNetworkError(error: unknown): boolean {
  return error instanceof TypeError && error.message === 'Failed to fetch'
}
