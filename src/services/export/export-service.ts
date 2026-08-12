import type { MusicParams } from '@/types'
// @ts-ignore - midi-writer-js has type resolution issues with package.json exports
import MidiWriter from 'midi-writer-js'

/**
 * 导出服务 — WAV 和 MIDI 文件导出
 */
export const exportService = {
  /**
   * 导出 WAV 文件并触发浏览器下载
   */
  downloadWav(blob: Blob, filename: string): void {
    downloadBlob(blob, `${filename}.wav`)
  },

  /**
   * 导出 MIDI 文件并触发浏览器下载
   */
  downloadMidi(params: MusicParams, filename: string): void {
    const tracks: MidiWriter.Track[] = []

    // Track 1: 旋律 (按时间排序，计算相对等待)
    const melodyTrack = new MidiWriter.Track()
    melodyTrack.setTempo(params.bpm)

    const sorted = [...params.melody].sort((a, b) => a.time - b.time)
    sorted.forEach((note, i) => {
      let waitBeats: number
      if (i === 0) {
        waitBeats = note.time
      } else {
        const prev = sorted[i - 1]
        waitBeats = Math.max(0, note.time - prev.time - prev.duration)
      }
      melodyTrack.addEvent(new MidiWriter.NoteEvent({
        pitch: [note.pitch],
        duration: ticksFromBeats(note.duration),
        velocity: note.velocity,
        wait: ticksFromBeats(waitBeats),
      }))
    })
    tracks.push(melodyTrack)

    // Track 2: 贝斯
    if (params.bass && params.bass.length > 0) {
      const bassTrack = new MidiWriter.Track()
      const sortedBass = [...params.bass].sort((a, b) => a.time - b.time)
      sortedBass.forEach((note, i) => {
        let waitBeats: number
        if (i === 0) {
          waitBeats = note.time
        } else {
          const prev = sortedBass[i - 1]
          waitBeats = Math.max(0, note.time - prev.time - prev.duration)
        }
        bassTrack.addEvent(new MidiWriter.NoteEvent({
          pitch: [note.pitch],
          duration: ticksFromBeats(note.duration),
          velocity: note.velocity,
          wait: ticksFromBeats(waitBeats),
        }))
      })
      tracks.push(bassTrack)
    }

    const writer = new MidiWriter.Writer(tracks)
    const dataUri = writer.dataUri()
    const byteString = atob(dataUri.split(',')[1])
    const arrayBuffer = new ArrayBuffer(byteString.length)
    const uint8 = new Uint8Array(arrayBuffer)
    for (let i = 0; i < byteString.length; i++) {
      uint8[i] = byteString.charCodeAt(i)
    }

    const blob = new Blob([arrayBuffer], { type: 'audio/midi' })
    downloadBlob(blob, `${filename}.mid`)
  },
}

/**
 * 将拍数转换为 MIDI ticks (1 拍 = 256 ticks)
 */
function ticksFromBeats(beats: number): string {
  const ticks = Math.round(beats * 256)
  return `T${ticks}`
}

/**
 * 触发浏览器下载
 */
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
