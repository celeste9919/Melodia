import type { MusicParams, AudioPlayback, Note, Chord, VocalNote } from '@/types'
import * as Tone from 'tone'
import { VocalSynth } from './vocal-synth'

/**
 * 音频引擎 — 根据音乐参数使用 Tone.js 合成音频
 * 提供播放控制和 WAV 导出
 */
export const audioEngine = {
  _synths: null as { melody: Tone.PolySynth; chords: Tone.PolySynth; bass: Tone.MonoSynth } | null,
  _parts: [] as Tone.Part[],
  _playing: false,
  _vocalSynth: null as VocalSynth | null,
  _vocalEnabled: true,
  _volume: 0.8,
  _loop: false,

  async synthesize(params: MusicParams): Promise<AudioPlayback> {
    // 清理之前的合成器
    this.dispose()

    await Tone.start()
    Tone.Transport.stop()
    Tone.Transport.position = 0

    const bpm = params.bpm
    Tone.Transport.bpm.value = bpm

    // 创建合成器
    const volOffset = linearToDb(this._volume)

    const melodySynth = new Tone.PolySynth(Tone.Synth).toDestination()
    melodySynth.set({ volume: volOffset - 8 })

    const chordSynth = new Tone.PolySynth(Tone.Synth).toDestination()
    chordSynth.set({ volume: volOffset - 14 })

    const bassSynth = new Tone.MonoSynth({
      volume: volOffset - 10,
      oscillator: { type: 'triangle' },
      filter: { frequency: 800 },
    }).toDestination()

    this._synths = { melody: melodySynth, chords: chordSynth, bass: bassSynth }

    // 转换音符为 Tone.js 事件
    const melodyNotes = toToneNotes(params.melody, bpm)
    const chordNotes = toChordToneNotes(params.chords, bpm)
    const bassNotes = params.bass ? toToneNotes(params.bass, bpm) : []

    const melodyPart = new Tone.Part((time, note) => {
      melodySynth.triggerAttackRelease(note.pitch, note.dur, time, note.velocity / 127)
    }, melodyNotes).start(0)

    const chordPart = new Tone.Part((time, chord) => {
      chordSynth.triggerAttackRelease(chord.notes, chord.dur, time, 0.5)
    }, chordNotes).start(0)

    this._parts = [melodyPart, chordPart]

    if (bassNotes.length > 0) {
      const bassPart = new Tone.Part((time, note) => {
        bassSynth.triggerAttackRelease(note.pitch, note.dur, time, note.velocity / 127)
      }, bassNotes).start(0)
      this._parts.push(bassPart)
    }

    // Vocal track via formant synthesis
    if (this._vocalEnabled && params.vocals && params.vocals.length > 0) {
      const rawCtx = Tone.getContext().rawContext as AudioContext
      this._vocalSynth = new VocalSynth(rawCtx)
      this._vocalSynth.synthesize(params.vocals, bpm)
    }

    const realDuration = params.duration // duration 本身就是秒数

    const playback: AudioPlayback = {
      play: () => {
        Tone.Transport.start()
        this._playing = true
      },
      pause: () => {
        Tone.Transport.pause()
        this._playing = false
      },
      stop: () => {
        Tone.Transport.stop()
        Tone.Transport.position = 0
        this._playing = false
      },
      getCurrentTime: () => Tone.Transport.seconds,
      getDuration: () => realDuration,
      onEnd: (callback: () => void) => {
        const onEndCb = () => {
          if (this._loop) {
            Tone.Transport.position = 0
            Tone.Transport.start()
          } else {
            callback()
          }
        }
        Tone.Transport.schedule(onEndCb, realDuration)
      },
      isPlaying: () => this._playing,
    }

    return playback
  },

  /**
   * 导出为 WAV — 使用 OfflineContext 渲染完整音频
   */
  async exportWav(params: MusicParams): Promise<Blob> {
    await this.dispose()

    const duration = params.duration
    const sampleRate = 44100

    // 使用 Tone.Offline 离线渲染
    const buffer = await Tone.Offline(({ transport }) => {
      transport.bpm.value = params.bpm

      const melodySynth = new Tone.PolySynth(Tone.Synth).toDestination()
      melodySynth.set({ volume: -8 })

      const chordSynth = new Tone.PolySynth(Tone.Synth).toDestination()
      chordSynth.set({ volume: -14 })

      const bassSynth = new Tone.MonoSynth({
        volume: -10,
        oscillator: { type: 'triangle' },
        filter: { frequency: 800 },
      }).toDestination()

      const melodyNotes = toToneNotes(params.melody, params.bpm)
      const chordNotes = toChordToneNotes(params.chords, params.bpm)
      const bassNotes = params.bass ? toToneNotes(params.bass, params.bpm) : []

      new Tone.Part((time, note) => {
        melodySynth.triggerAttackRelease(note.pitch, note.dur, time, note.velocity / 127)
      }, melodyNotes).start(0)

      new Tone.Part((time, chord) => {
        chordSynth.triggerAttackRelease(chord.notes, chord.dur, time, 0.5)
      }, chordNotes).start(0)

      if (bassNotes.length > 0) {
        new Tone.Part((time, note) => {
          bassSynth.triggerAttackRelease(note.pitch, note.dur, time, note.velocity / 127)
        }, bassNotes).start(0)
      }

      transport.start()
    }, duration, 2, sampleRate)

    // 将 AudioBuffer 转换为 WAV Blob
    const mainBuffer = buffer.get() as AudioBuffer

    // Render vocals separately using OfflineAudioContext
    if (params.vocals && params.vocals.length > 0) {
      const vocalBuffer = await renderVocalsOffline(params.vocals, params.bpm, duration, sampleRate)
      const mixed = await mixBuffers(mainBuffer, vocalBuffer)
      return audioBufferToWavBlob(mixed)
    }

    return audioBufferToWavBlob(mainBuffer)
  },

  setVolume(v: number) {
    this._volume = Math.max(0, Math.min(1, v))
    if (this._synths) {
      this._synths.melody.set({ volume: linearToDb(this._volume) - 8 })
      this._synths.chords.set({ volume: linearToDb(this._volume) - 14 })
      this._synths.bass.set({ volume: linearToDb(this._volume) - 10 })
    }
  },

  getVolume() { return this._volume },

  setLoop(enabled: boolean) { this._loop = enabled },

  getLoop() { return this._loop },

  setVocalEnabled(enabled: boolean) {
    this._vocalEnabled = enabled
  },

  toggleVocal() {
    this._vocalEnabled = !this._vocalEnabled
    if (!this._vocalEnabled && this._vocalSynth) {
      this._vocalSynth.stop()
    }
    return this._vocalEnabled
  },

  dispose() {
    this._synths = null
    this._parts.forEach(p => p.dispose())
    this._parts = []
    this._playing = false
    if (this._vocalSynth) {
      this._vocalSynth.dispose()
      this._vocalSynth = null
    }
  },
}

function linearToDb(linear: number): number {
  if (linear <= 0) return -Infinity
  return 20 * Math.log10(linear)
}

// === 辅助函数 ===

interface ToneNote {
  time: number
  pitch: string
  dur: string
  velocity: number
}

interface ToneChordEvent {
  time: number
  notes: string[]
  dur: string
}

function midiToFreq(midi: number): string {
  const names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
  const octave = Math.floor(midi / 12) - 1
  const name = names[midi % 12]
  return `${name}${octave}`
}

function beatsToToneTime(beats: number, bpm: number): number {
  return (beats / bpm) * 60
}

function toToneNotes(notes: Note[], bpm: number): ToneNote[] {
  return notes.map(n => ({
    time: beatsToToneTime(n.time, bpm),
    pitch: midiToFreq(n.pitch),
    dur: `${beatsToToneTime(n.duration, bpm)}n`.replace(/[^0-9n]/g, ''),
    velocity: n.velocity,
  }))
}

function toChordToneNotes(chords: Chord[], bpm: number): ToneChordEvent[] {
  const chordIntervals: Record<string, number[]> = {
    maj: [0, 4, 7],
    min: [0, 3, 7],
    dim: [0, 3, 6],
    aug: [0, 4, 8],
    '7': [0, 4, 7, 10],
    maj7: [0, 4, 7, 11],
    min7: [0, 3, 7, 10],
  }

  const rootSemitones: Record<string, number> = {
    C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, F: 5,
    'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11,
  }

  return chords.map(c => {
    const root = rootSemitones[c.root] || 0
    const intervals = chordIntervals[c.quality] || chordIntervals.maj
    const notes = intervals.map(i => midiToFreq(48 + root + i))
    const durationBeats = c.duration

    return {
      time: beatsToToneTime(c.time, bpm),
      notes,
      dur: `${durationBeats}n`,
    }
  })
}

/**
 * 将 AudioBuffer 转换为 WAV 格式 Blob
 */
function audioBufferToWavBlob(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels
  const sampleRate = buffer.sampleRate
  const length = buffer.length
  const bytesPerSample = 2
  const blockAlign = numChannels * bytesPerSample
  const dataSize = length * blockAlign
  const headerSize = 44
  const arrayBuffer = new ArrayBuffer(headerSize + dataSize)
  const view = new DataView(arrayBuffer)

  // WAV header
  writeString(view, 0, 'RIFF')
  view.setUint32(4, 36 + dataSize, true)
  writeString(view, 8, 'WAVE')
  writeString(view, 12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true) // PCM
  view.setUint16(22, numChannels, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * blockAlign, true)
  view.setUint16(32, blockAlign, true)
  view.setUint16(34, bytesPerSample * 8, true)
  writeString(view, 36, 'data')
  view.setUint32(40, dataSize, true)

  // Audio data
  const offset = 44
  for (let i = 0; i < length; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      const sample = Math.max(-1, Math.min(1, buffer.getChannelData(ch)[i]))
      const int16 = sample < 0 ? sample * 0x8000 : sample * 0x7FFF
      view.setInt16(offset + i * blockAlign + ch * bytesPerSample, int16, true)
    }
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' })
}

function writeString(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i))
  }
}

/**
 * Render vocal notes using OfflineAudioContext (formant synthesis)
 */
async function renderVocalsOffline(
  vocals: VocalNote[],
  bpm: number,
  duration: number,
  sampleRate: number
): Promise<AudioBuffer> {
  const ctx = new OfflineAudioContext(2, sampleRate * duration, sampleRate)
  const beatDuration = 60 / bpm

  const VOWEL_FORMANTS: Record<string, [number, number, number]> = {
    a: [800, 1150, 2900],
    e: [400, 2000, 2800],
    i: [270, 2300, 3000],
    o: [500, 1000, 2700],
    u: [300, 870, 2200],
  }

  for (const note of vocals) {
    const startTime = note.time * beatDuration
    const dur = note.duration * beatDuration
    const freq = 440 * Math.pow(2, (note.pitch - 69) / 12)
    const vowel = (note.vowel || 'a').toLowerCase()
    const [f1, f2, f3] = VOWEL_FORMANTS[vowel] || VOWEL_FORMANTS.a
    const velocity = note.velocity / 127

    const osc = ctx.createOscillator()
    osc.type = 'sawtooth'
    osc.frequency.value = freq

    const gain = ctx.createGain()
    gain.gain.value = 0
    const attack = Math.min(0.08, dur * 0.2)
    const release = Math.min(0.15, dur * 0.3)
    gain.gain.setValueAtTime(0, startTime)
    gain.gain.linearRampToValueAtTime(velocity * 0.3, startTime + attack)
    gain.gain.setValueAtTime(velocity * 0.3, startTime + dur - release)
    gain.gain.linearRampToValueAtTime(0, startTime + dur)

    const bp1 = ctx.createBiquadFilter()
    bp1.type = 'bandpass'; bp1.frequency.value = f1; bp1.Q.value = 10
    const bp2 = ctx.createBiquadFilter()
    bp2.type = 'bandpass'; bp2.frequency.value = f2; bp2.Q.value = 10
    const bp3 = ctx.createBiquadFilter()
    bp3.type = 'bandpass'; bp3.frequency.value = f3; bp3.Q.value = 10

    osc.connect(gain)
    gain.connect(bp1)
    bp1.connect(bp2)
    bp2.connect(bp3)
    bp3.connect(ctx.destination)

    osc.start(startTime)
    osc.stop(startTime + dur + 0.1)
  }

  return ctx.startRendering()
}

/**
 * Mix two AudioBuffers by summing samples. Async because OfflineAudioContext.startRendering() returns a Promise.
 */
async function mixBuffers(a: AudioBuffer, b: AudioBuffer): Promise<AudioBuffer> {
  const sampleRate = a.sampleRate
  const length = Math.max(a.length, b.length)
  const channels = Math.max(a.numberOfChannels, b.numberOfChannels)

  const offlineCtx = new OfflineAudioContext(channels, length, sampleRate)

  const sourceA = offlineCtx.createBufferSource()
  sourceA.buffer = a
  sourceA.connect(offlineCtx.destination)
  sourceA.start(0)

  const sourceB = offlineCtx.createBufferSource()
  sourceB.buffer = b
  const gainB = offlineCtx.createGain()
  gainB.gain.value = 0.7
  sourceB.connect(gainB)
  gainB.connect(offlineCtx.destination)
  sourceB.start(0)

  return offlineCtx.startRendering()
}
