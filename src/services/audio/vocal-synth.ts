import type { VocalNote } from '@/types'

// Formant frequencies (F1, F2, F3) for each vowel
const VOWEL_FORMANTS: Record<string, [number, number, number]> = {
  a: [800, 1150, 2900],
  e: [400, 2000, 2800],
  i: [270, 2300, 3000],
  o: [500, 1000, 2700],
  u: [300, 870, 2200],
}

const DEFAULT_VOWEL = 'a'

function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12)
}

interface ScheduledVoice {
  oscillator: OscillatorNode
  gainNode: GainNode
  filters: BiquadFilterNode[]
  stopTime: number
}

export class VocalSynth {
  private ctx: AudioContext
  private masterGain: GainNode
  private scheduled: ScheduledVoice[] = []

  constructor(ctx: AudioContext) {
    this.ctx = ctx
    this.masterGain = ctx.createGain()
    this.masterGain.gain.value = 0.6
    this.masterGain.connect(ctx.destination)
  }

  /**
   * Schedule and start playback of vocal notes.
   * Returns when all notes are scheduled (they play via the Web Audio clock).
   */
  synthesize(notes: VocalNote[], bpm: number): void {
    this.stop()

    const beatDuration = 60 / bpm // seconds per beat

    for (const note of notes) {
      const startTime = this.ctx.currentTime + note.time * beatDuration
      const dur = note.duration * beatDuration
      const freq = midiToFreq(note.pitch)
      const vowel = (note.vowel || DEFAULT_VOWEL).toLowerCase()
      const [f1, f2, f3] = VOWEL_FORMANTS[vowel] || VOWEL_FORMANTS[DEFAULT_VOWEL]
      const velocity = note.velocity / 127

      const osc = this.ctx.createOscillator()
      osc.type = 'sawtooth'
      osc.frequency.value = freq

      const gainNode = this.ctx.createGain()
      gainNode.gain.value = 0
      const attackTime = Math.min(0.08, dur * 0.2)
      const releaseTime = Math.min(0.15, dur * 0.3)
      gainNode.gain.setValueAtTime(0, startTime)
      gainNode.gain.linearRampToValueAtTime(velocity * 0.3, startTime + attackTime)
      gainNode.gain.setValueAtTime(velocity * 0.3, startTime + dur - releaseTime)
      gainNode.gain.linearRampToValueAtTime(0, startTime + dur)

      // Formant filter chain
      const filter1 = this.ctx.createBiquadFilter()
      filter1.type = 'bandpass'
      filter1.frequency.value = f1
      filter1.Q.value = 10

      const filter2 = this.ctx.createBiquadFilter()
      filter2.type = 'bandpass'
      filter2.frequency.value = f2
      filter2.Q.value = 10

      const filter3 = this.ctx.createBiquadFilter()
      filter3.type = 'bandpass'
      filter3.frequency.value = f3
      filter3.Q.value = 10

      // Slight vibrato
      const vibrato = this.ctx.createOscillator()
      vibrato.type = 'sine'
      vibrato.frequency.value = 5.5
      const vibratoGain = this.ctx.createGain()
      vibratoGain.gain.value = 2
      vibrato.connect(vibratoGain)
      vibratoGain.connect(osc.frequency)

      osc.connect(gainNode)
      gainNode.connect(filter1)
      filter1.connect(filter2)
      filter2.connect(filter3)
      filter3.connect(this.masterGain)

      osc.start(startTime)
      osc.stop(startTime + dur + 0.1)
      vibrato.start(startTime)
      vibrato.stop(startTime + dur + 0.1)

      this.scheduled.push({
        oscillator: osc,
        gainNode,
        filters: [filter1, filter2, filter3],
        stopTime: startTime + dur + 0.1,
      })
    }
  }

  /** Stop all scheduled voices immediately */
  stop(): void {
    for (const v of this.scheduled) {
      try {
        v.oscillator.stop()
      } catch { /* already stopped */ }
      v.gainNode.disconnect()
      v.filters.forEach(f => f.disconnect())
    }
    this.scheduled = []
  }

  /** Clean up expired voices (call periodically) */
  cleanExpired(): void {
    const now = this.ctx.currentTime
    this.scheduled = this.scheduled.filter(v => {
      if (v.stopTime <= now) {
        v.gainNode.disconnect()
        v.filters.forEach(f => f.disconnect())
        return false
      }
      return true
    })
  }

  /** Set master volume 0-1 */
  setVolume(vol: number): void {
    this.masterGain.gain.value = vol
  }

  /** Connect output to a different destination */
  connect(dest: AudioNode): void {
    this.masterGain.disconnect()
    this.masterGain.connect(dest)
  }

  disconnect(): void {
    this.masterGain.disconnect()
  }

  dispose(): void {
    this.stop()
    this.masterGain.disconnect()
  }
}
