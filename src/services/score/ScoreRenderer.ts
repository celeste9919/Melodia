import type { Note, Chord } from '@/types'
import { Accidental, Annotation, Formatter, Renderer, Stave, StaveNote, Voice } from 'vexflow'

interface ScoreOptions {
  width?: number
  key?: string
  scale?: 'major' | 'minor'
}

// MIDI pitch to VexFlow note mapping
const NOTE_NAMES_SHARP = ['c', 'c#', 'd', 'd#', 'e', 'f', 'f#', 'g', 'g#', 'a', 'a#', 'b']
const NOTE_NAMES_FLAT = ['c', 'db', 'd', 'eb', 'e', 'f', 'gb', 'g', 'ab', 'a', 'bb', 'b']

function midiToVexflow(pitch: number, useFlats: boolean = false): { key: string; accidental: string | null } {
  const octave = Math.floor(pitch / 12) - 1
  const noteIdx = pitch % 12
  const names = useFlats ? NOTE_NAMES_FLAT : NOTE_NAMES_SHARP
  const note = names[noteIdx]
  // 'c#', 'db', etc. already include accidental in the name
  const hasAccidental = note.length > 1
  return {
    key: `${note}/${octave}`,
    accidental: hasAccidental ? note.charAt(1) : null,
  }
}

function toVexDuration(durationBeats: number): string {
  if (durationBeats >= 4) return '1'
  if (durationBeats >= 2) return '2'
  if (durationBeats >= 1) return '4'
  if (durationBeats >= 0.5) return '8'
  if (durationBeats >= 0.25) return '16'
  return '16'
}

function toVexKeySpec(key: string, scale: 'major' | 'minor'): string {
  if (scale === 'minor') return key + 'm'
  return key
}

/**
 * ScoreRenderer — renders melody and chord data as sheet music using VexFlow
 */
export class ScoreRenderer {
  private container: HTMLDivElement | null = null
  private renderer: InstanceType<typeof Renderer> | null = null

  init(container: HTMLDivElement, _options: ScoreOptions = {}): void {
    this.container = container
  }

  render(melody: Note[], chords: Chord[], _bpm: number, options: ScoreOptions = {}): void {
    if (!this.container) {
      throw new Error('ScoreRenderer not initialized. Call init() first.')
    }

    // Clear previous content
    this.container.innerHTML = ''

    if (melody.length === 0) return

    const width = options.width || this.container.clientWidth || 700
    const key = options.key || 'C'
    const scale = options.scale || 'major'

    // Group notes into measures (4 beats per measure)
    const measures: { notes: Note[]; chord: string | null }[] = []
    let currentTime = 0
    let currentNotes: Note[] = []

    for (const note of melody) {
      while (note.time >= currentTime + 4) {
        const chord = chords.find(c => c.time >= currentTime && c.time < currentTime + 4)
        measures.push({ notes: [...currentNotes], chord: chord ? `${chord.root}${chord.quality}` : null })
        currentNotes = []
        currentTime += 4
      }
      currentNotes.push(note)
    }
    const lastChord = chords.find(c => c.time >= currentTime && c.time < currentTime + 4)
    measures.push({ notes: [...currentNotes], chord: lastChord ? `${lastChord.root}${lastChord.quality}` : null })

    // Calculate layout
    const measuresPerLine = Math.max(1, Math.floor(width / 180))
    const totalStaves = Math.ceil(measures.length / measuresPerLine)
    const staveHeight = 140
    const totalHeight = totalStaves * staveHeight + 40

    this.renderer = new Renderer(this.container, Renderer.Backends.SVG)
    this.renderer.resize(width, totalHeight)
    const context = this.renderer.getContext()
    context.setFont('Arial', 10)

    for (let lineIdx = 0; lineIdx < totalStaves; lineIdx++) {
      const lineMeasures = measures.slice(lineIdx * measuresPerLine, (lineIdx + 1) * measuresPerLine)
      if (lineMeasures.length === 0) break

      const staveWidth = (width - 40) / lineMeasures.length
      const staveX = 20 + (width - staveWidth * lineMeasures.length) / 2
      const staveY = 10 + lineIdx * staveHeight

      for (let m = 0; m < lineMeasures.length; m++) {
        const measure = lineMeasures[m]
        const x = staveX + m * staveWidth

        const stave = new Stave(x, staveY, staveWidth)
        if (m === 0 && lineIdx === 0) {
          stave.addClef('treble')
          stave.addKeySignature(toVexKeySpec(key, scale))
          stave.addTimeSignature('4/4')
        }
        stave.setContext(context).draw()

      // Add chord annotation above the measure
      if (measure.chord) {
        const chordAnnotation = new Annotation(measure.chord)
        chordAnnotation.setVerticalJustification(Annotation.VerticalJustify.TOP)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        stave.addModifier(chordAnnotation as any, 0)
      }

        // Build notes for this measure
        const staveNotes: StaveNote[] = []
        for (const note of measure.notes) {
          const vNote = midiToVexflow(note.pitch)
          const duration = toVexDuration(note.duration)

          const staveNote = new StaveNote({
            clef: 'treble',
            keys: [vNote.key],
            duration,
            autoStem: true,
          })

          if (vNote.accidental) {
            staveNote.addModifier(new Accidental(vNote.accidental), 0)
          }

          staveNotes.push(staveNote)
        }

        if (staveNotes.length > 0) {
          const voice = new Voice({ numBeats: 4, beatValue: 4 })
          voice.addTickables(staveNotes)
          voice.setMode(Voice.Mode.SOFT)

          try {
            new Formatter().joinVoices([voice]).format([voice], staveWidth - 20)
            voice.draw(context, stave)
          } catch {
            // Fallback: draw notes without strict formatting
            for (const vn of staveNotes) {
              vn.setStave(stave)
              vn.setContext(context).draw()
            }
          }
        }
      }
    }
  }

  dispose(): void {
    if (this.container) {
      this.container.innerHTML = ''
    }
    this.renderer = null
    this.container = null
  }
}

export const scoreRenderer = new ScoreRenderer()
