// === Data types for AI Music Studio ===

/** User input for music generation */
export interface MusicGenerateRequest {
  mode: 'text' | 'lyrics'
  prompt?: string
  lyrics?: string
  style: string
  tempo?: number
  key?: string
  duration: number
}

/** AI-generated music parameters */
export interface MusicParams {
  bpm: number
  key: string
  scale: 'major' | 'minor'
  chords: Chord[]
  melody: Note[]
  bass?: Note[]
  vocals?: VocalNote[]
  style: string
  duration: number
}

/** Chord definition */
export interface Chord {
  time: number
  root: string
  quality: string
  duration: number
}

/** Note definition (MIDI-based) */
export interface Note {
  time: number
  pitch: number
  velocity: number
  duration: number
}

/** Vocal note with vowel for formant synthesis */
export interface VocalNote {
  time: number
  pitch: number
  velocity: number
  duration: number
  vowel: string
  lyric?: string
}

/** Complete generation result */
export interface MusicGenerateResult {
  id: string
  params: MusicParams
  audioBuffer?: AudioBuffer
  midiEvents: MidiEvent[]
  createdAt: string
  request: MusicGenerateRequest
}

/** History record */
export interface HistoryItem {
  id: string
  request: MusicGenerateRequest
  params: MusicParams
  audioData?: ArrayBuffer
  createdAt: string
}

/** MIDI event for export */
export interface MidiEvent {
  type: 'noteOn' | 'noteOff' | 'tempo' | 'timeSignature'
  time: number
  data: Record<string, number>
}

/** App configuration */
export interface AppConfig {
  apiKey: string
  modelProvider: 'deepseek' | 'openai' | 'custom'
  modelName: string
  apiEndpoint?: string
  language: 'zh' | 'en'
  themeMode: 'dark' | 'light' | 'system'
  customTheme?: ThemeColors
}

/** Theme colors from image extraction */
export interface ThemeColors {
  bg: string
  surface: string
  border: string
  text: string
  textSecondary: string
  primary: string
  primaryHover: string
  accent: string
}

/** Style preset */
export interface StylePreset {
  id: string
  nameKey: string
  descriptionKey: string
  defaultBpm: number
  defaultKey: string
}

/** API provider configuration */
export interface ModelConfig {
  provider: 'deepseek' | 'openai' | 'custom'
  apiKey: string
  modelName: string
  apiEndpoint?: string
}

/** Audio playback interface */
export interface AudioPlayback {
  play: () => void
  pause: () => void
  stop: () => void
  getCurrentTime: () => number
  getDuration: () => number
  onEnd: (callback: () => void) => void
}
