import type { MusicGenerateRequest, MusicGenerateResult, MusicParams } from '@/types'
import { promptBuilder } from '@/services/prompt/prompt-builder'
import { aiClient } from '@/services/ai/ai-client'
import { audioEngine } from '@/services/audio/audio-engine'
import { configService } from '@/services/config/config-service'

/**
 * 音乐生成编排器 — 编排完整流程：
 * 验证 → 构建 Prompt → 调用 AI → 解析结果 → 合成音频
 */
export const musicOrchestrator = {
  async generate(request: MusicGenerateRequest): Promise<MusicGenerateResult> {
    // 1. 验证输入
    this.validate(request)

    // 2. 检查 API Key
    if (!configService.hasApiKey()) {
      throw new OrchestratorError('请先在设置中配置 API Key', 'NO_API_KEY')
    }

    // 3. 构建 Prompt
    const prompt = promptBuilder.buildPrompt(request)

    // 4. 调用 AI
    const modelConfig = configService.getModelConfig()
    const result = await aiClient.call({ modelConfig, prompt })

    // 5. 解析 AI 响应 → MusicParams
    const params = this.parseResponse(result.content, request)

    // 6. 合成音频
    await audioEngine.synthesize(params)

    // 7. 构建 MIDI 事件（用于后续导出）
    const midiEvents = convertParamsToMidiEvents(params)

    const id = generateId()

    return {
      id,
      params,
      midiEvents,
      createdAt: new Date().toISOString(),
      request,
    }
  },

  validate(request: MusicGenerateRequest): void {
    if (request.mode === 'text') {
      if (!request.prompt || request.prompt.trim().length === 0) {
        throw new OrchestratorError('请输入音乐描述', 'EMPTY_INPUT')
      }
      if (request.prompt.length > 2000) {
        throw new OrchestratorError('描述文字过长，请控制在 2000 字以内', 'INPUT_TOO_LONG')
      }
    } else if (request.mode === 'lyrics') {
      if (!request.lyrics || request.lyrics.trim().length === 0) {
        throw new OrchestratorError('请输入歌词', 'EMPTY_INPUT')
      }
      if (request.lyrics.length > 5000) {
        throw new OrchestratorError('歌词过长，请控制在 5000 字以内', 'INPUT_TOO_LONG')
      }
    }

    if (request.duration < 10 || request.duration > 180) {
      throw new OrchestratorError('时长需要在 10-180 秒之间', 'INVALID_DURATION')
    }
  },

  parseResponse(rawContent: string, request: MusicGenerateRequest): MusicParams {
    // 尝试从 AI 响应中提取 JSON
    const jsonStr = extractJSON(rawContent)

    try {
      const parsed = JSON.parse(jsonStr)

      // 验证必要字段
      if (!parsed.bpm || !parsed.melody || !Array.isArray(parsed.melody)) {
        throw new OrchestratorError('AI 返回的数据格式不正确，请重试', 'PARSE_ERROR')
      }

      return {
        bpm: parsed.bpm || 120,
        key: parsed.key || 'C',
        scale: parsed.scale === 'minor' ? 'minor' : 'major',
        chords: parsed.chords || [],
        melody: parsed.melody.map(normalizeNote),
        bass: parsed.bass?.map(normalizeNote),
        style: request.style,
        duration: parsed.duration || request.duration,
      }
    } catch (e) {
      if (e instanceof OrchestratorError) throw e
      throw new OrchestratorError('无法解析 AI 返回的数据，请重试', 'PARSE_ERROR')
    }
  },
}

/**
 * 编排器错误
 */
export class OrchestratorError extends Error {
  code: string

  constructor(message: string, code: string) {
    super(message)
    this.name = 'OrchestratorError'
    this.code = code
  }
}

/**
 * 从 AI 原始响应中提取 JSON
 */
function extractJSON(raw: string): string {
  // 尝试匹配 ```json ... ``` 代码块
  const blockMatch = raw.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/)
  if (blockMatch) return blockMatch[1].trim()

  // 尝试匹配 { ... } 包围的 JSON
  const braceMatch = raw.match(/\{[\s\S]*\}/)
  if (braceMatch) return braceMatch[0]

  return raw.trim()
}

/**
 * 规范化音符数据
 */
function normalizeNote(n: Record<string, unknown>): { time: number; pitch: number; velocity: number; duration: number } {
  return {
    time: Number(n.time) || 0,
    pitch: clampPitch(Number(n.pitch) || 60),
    velocity: clampVelocity(Number(n.velocity) || 100),
    duration: Math.max(0.125, Number(n.duration) || 0.5),
  }
}

function clampPitch(p: number): number {
  return Math.max(21, Math.min(108, Math.round(p)))
}

function clampVelocity(v: number): number {
  return Math.max(1, Math.min(127, Math.round(v)))
}

/**
 * 将 MusicParams 转换为 MIDI 事件列表
 */
function convertParamsToMidiEvents(params: MusicParams): Array<{ type: 'noteOn' | 'noteOff' | 'tempo' | 'timeSignature'; time: number; data: Record<string, number> }> {
  const events: Array<{ type: 'noteOn' | 'noteOff' | 'tempo' | 'timeSignature'; time: number; data: Record<string, number> }> = []

  // Tempo event
  events.push({ type: 'tempo', time: 0, data: { bpm: params.bpm } })

  // Note events from melody
  for (const note of params.melody) {
    events.push({ type: 'noteOn', time: note.time, data: { pitch: note.pitch, velocity: note.velocity } })
    events.push({ type: 'noteOff', time: note.time + note.duration, data: { pitch: note.pitch } })
  }

  // Note events from bass
  if (params.bass) {
    for (const note of params.bass) {
      events.push({ type: 'noteOn', time: note.time, data: { pitch: note.pitch, velocity: note.velocity } })
      events.push({ type: 'noteOff', time: note.time + note.duration, data: { pitch: note.pitch } })
    }
  }

  return events
}

function generateId(): string {
  return `gen_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}
