import { describe, it, expect } from 'vitest'
import { audioBufferToWavBlob } from '../src/services/audio/wav-encoder'

describe('audioBufferToWavBlob', () => {
  function createTestBuffer(samples: Float32Array[], sampleRate = 44100): AudioBuffer {
    const channels = samples.length
    const length = samples[0].length
    const buffer = {
      numberOfChannels: channels,
      length,
      sampleRate,
      duration: length / sampleRate,
      getChannelData: (ch: number) => samples[ch],
      copyFromChannel: () => {},
      copyToChannel: () => {},
    } as unknown as AudioBuffer
    return buffer
  }

  it('produces a valid WAV header', () => {
    const buffer = createTestBuffer([new Float32Array(100)])
    const blob = audioBufferToWavBlob(buffer)
    expect(blob.type).toBe('audio/wav')
    expect(blob.size).toBeGreaterThan(44)
  })

  it('WAV starts with RIFF header', async () => {
    const buffer = createTestBuffer([new Float32Array(100)])
    const blob = audioBufferToWavBlob(buffer)
    const bytes = new Uint8Array(await blob.arrayBuffer())
    const header = String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3])
    expect(header).toBe('RIFF')
  })

  it('handles stereo', () => {
    const buffer = createTestBuffer([new Float32Array(200), new Float32Array(200)])
    const blob = audioBufferToWavBlob(buffer)
    // 44 header + 200*2*2 data = 844
    expect(blob.size).toBe(44 + 200 * 2 * 2)
  })

  it('clamps samples to [-1, 1]', async () => {
    const raw = new Float32Array(10)
    raw[0] = 1.5
    raw[1] = -2.0
    raw[2] = 0.5
    const buffer = createTestBuffer([raw])
    const blob = audioBufferToWavBlob(buffer)
    const bytes = new Uint8Array(await blob.arrayBuffer())
    // sample 0 should be clamped to 32767 (0x7FFF), not overflow
    const sample0 = new Int16Array(bytes.buffer.slice(44, 46))[0]
    expect(sample0).toBe(32767) // max int16 positive
  })
})
