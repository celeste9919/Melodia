import type { StylePreset } from '@/types'

export const STYLE_PRESETS: StylePreset[] = [
  {
    id: 'pop',
    nameKey: 'input.style.pop',
    descriptionKey: 'input.style.pop',
    defaultBpm: 120,
    defaultKey: 'C',
  },
  {
    id: 'classical',
    nameKey: 'input.style.classical',
    descriptionKey: 'input.style.classical',
    defaultBpm: 100,
    defaultKey: 'C',
  },
  {
    id: 'electronic',
    nameKey: 'input.style.electronic',
    descriptionKey: 'input.style.electronic',
    defaultBpm: 128,
    defaultKey: 'Am',
  },
  {
    id: 'jazz',
    nameKey: 'input.style.jazz',
    descriptionKey: 'input.style.jazz',
    defaultBpm: 90,
    defaultKey: 'F',
  },
  {
    id: 'rock',
    nameKey: 'input.style.rock',
    descriptionKey: 'input.style.rock',
    defaultBpm: 140,
    defaultKey: 'E',
  },
  {
    id: 'lofi',
    nameKey: 'input.style.lofi',
    descriptionKey: 'input.style.lofi',
    defaultBpm: 80,
    defaultKey: 'Am',
  },
  {
    id: 'ambient',
    nameKey: 'input.style.ambient',
    descriptionKey: 'input.style.ambient',
    defaultBpm: 60,
    defaultKey: 'C',
  },
]
