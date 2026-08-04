import type { MusicGenerateRequest } from '@/types'
import { STYLE_PRESETS } from './style-presets'

/**
 * Prompt 构建器 — 将用户输入转换为带有输出格式指令的 AI prompt
 */
export const promptBuilder = {
  buildPrompt(request: MusicGenerateRequest): string {
    const style = STYLE_PRESETS.find(s => s.id === request.style) || STYLE_PRESETS[0]
    const bpm = request.tempo || style.defaultBpm
    const key = request.key || style.defaultKey
    const duration = request.duration

    if (request.mode === 'lyrics' && request.lyrics) {
      return this._buildLyricsPrompt(request.lyrics, style, bpm, key, duration)
    }

    const description = request.prompt || '一首优美的音乐'
    return this._buildTextPrompt(description, style, bpm, key, duration)
  },

  _buildTextPrompt(description: string, style: typeof STYLE_PRESETS[0], bpm: number, key: string, duration: number): string {
    return `请根据以下描述，生成音乐参数。

【音乐描述】
${description}

【风格要求】
- 风格: ${style.id}
- 建议速度: ${bpm} BPM
- 调性: ${key}
- 时长: ${duration} 秒

【输出要求】
请严格按以下 JSON 格式输出，不要包含其他文本：

{
  "bpm": ${bpm},
  "key": "${key}",
  "scale": "major" | "minor",
  "duration": ${duration},
  "chords": [
    { "time": 0, "root": "C", "quality": "maj", "duration": 4 },
    ...
  ],
  "melody": [
    { "time": 0, "pitch": 60, "velocity": 100, "duration": 0.5 },
    ...
  ],
  "bass": [
    { "time": 0, "pitch": 36, "velocity": 80, "duration": 1 },
    ...
  ],
  "vocals": [
    { "time": 0, "pitch": 60, "velocity": 100, "duration": 0.5, "vowel": "a", "lyric": "爱" }
  ]
}

【参数说明】
- time: 从 0 开始的拍数（4/4 拍）
- pitch: MIDI 音高，60=C4（中央 C）
- velocity: 力度 1-127
- duration: 持续拍数
- root: 和弦根音（C, D, E, F, G, A, B + #/b）
- quality: 和弦性质（maj, min, dim, aug, 7, maj7, min7）
- vocals 是可选的：如果输入包含歌词，请为每个音节生成对应的 vocals 音符
  - vowel: 元音字母 (a/e/i/o/u)，根据汉语拼音韵母选择最接近的元音
  - lyric: 对应的歌词文字（可选）

请生成协调、有音乐性的和弦走向和旋律，确保旋律与和弦匹配。`
  },

  _buildLyricsPrompt(lyrics: string, style: typeof STYLE_PRESETS[0], bpm: number, key: string, duration: number): string {
    return `请为以下歌词创作音乐编排。

【歌词】
${lyrics}

【音乐参数】
- 风格: ${style.id}
- 速度: ${bpm} BPM
- 调性: ${key}
- 时长: ${duration} 秒

【输出要求】
请分析歌词的段落结构（主歌/副歌/桥段），然后按以下 JSON 格式输出音乐编排：

{
  "bpm": ${bpm},
  "key": "${key}",
  "scale": "major" | "minor",
  "duration": ${duration},
  "sections": [
    {
      "name": "verse1",
      "startTime": 0,
      "chords": [
        { "time": 0, "root": "C", "quality": "maj", "duration": 4 }
      ],
      "melody": [
        { "time": 0, "pitch": 60, "velocity": 100, "duration": 0.5 }
      ]
    }
  ],
  "globalChords": [
    { "time": 0, "root": "C", "quality": "maj", "duration": 4 }
  ],
  "melody": [
    { "time": 0, "pitch": 60, "velocity": 100, "duration": 0.5 }
  ],
  "bass": [
    { "time": 0, "pitch": 36, "velocity": 80, "duration": 1 }
  ],
  "vocals": [
    { "time": 0, "pitch": 60, "velocity": 100, "duration": 0.5, "vowel": "a", "lyric": "爱" }
  ]
}

【参数说明】
- time: 从 0 开始的拍数
- pitch: MIDI 音高，60=C4
- velocity: 力度 1-127
- duration: 持续拍数
- root: 和弦根音
- quality: 和弦性质
- vocals: 必填，为歌词的每个字/音节生成对应的人声音符
  - vowel: 元音字母 (a/e/i/o/u)，根据汉语拼音韵母选择最接近的元音
  - lyric: 对应的歌词文字

请确保旋律与歌词的韵律和情感匹配，副歌部分有记忆点。`
  },
}
