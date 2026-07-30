import type { ThemeColors } from '@/types'

type ThemeMode = 'dark' | 'light' | 'system'

const STORAGE_KEY = 'ai-music-theme-mode'

// 默认深色主题（保留供 reset 使用）
// @ts-ignore - kept for reference
const _DEFAULT_DARK: ThemeColors = {
  bg: '#0f0f1a',
  surface: '#1a1a2e',
  border: '#2a2a45',
  text: '#e8e8f0',
  textSecondary: '#9090a8',
  primary: '#7c5cfc',
  primaryHover: '#9b7fff',
  accent: '#00d4aa',
}

// 默认浅色主题（保留供 reset 使用）
// @ts-ignore - kept for reference
const _DEFAULT_LIGHT: ThemeColors = {
  bg: '#f5f5fa',
  surface: '#ffffff',
  border: '#d8d8e8',
  text: '#1a1a2e',
  textSecondary: '#6b6b85',
  primary: '#6b48e0',
  primaryHover: '#5535c0',
  accent: '#00a884',
}

function applyColors(colors: ThemeColors) {
  const root = document.documentElement
  root.style.setProperty('--color-bg', colors.bg)
  root.style.setProperty('--color-surface', colors.surface)
  root.style.setProperty('--color-border', colors.border)
  root.style.setProperty('--color-text', colors.text)
  root.style.setProperty('--color-text-secondary', colors.textSecondary)
  root.style.setProperty('--color-primary', colors.primary)
  root.style.setProperty('--color-primary-hover', colors.primaryHover)
  root.style.setProperty('--color-accent', colors.accent)
}

function getSystemMode(): 'dark' | 'light' {
  if (typeof window === 'undefined') return 'dark'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export const themeService = {
  init() {
    const savedMode = localStorage.getItem(STORAGE_KEY) as ThemeMode | null
    const mode = savedMode || 'dark'
    this.setMode(mode)

    // 监听系统主题变化
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      const current = localStorage.getItem(STORAGE_KEY) as ThemeMode | null
      if (current === 'system') {
        this.setMode('system')
      }
    })
  },

  setMode(mode: ThemeMode) {
    localStorage.setItem(STORAGE_KEY, mode)
    const isDark = mode === 'system' ? getSystemMode() === 'dark' : mode === 'dark'

    if (isDark) {
      document.documentElement.classList.remove('light')
    } else {
      document.documentElement.classList.add('light')
    }
  },

  getMode(): ThemeMode {
    return (localStorage.getItem(STORAGE_KEY) as ThemeMode) || 'dark'
  },

  async applyCustomTheme(imageFile: File): Promise<ThemeColors> {
    return new Promise((resolve) => {
      const img = new Image()
      const url = URL.createObjectURL(imageFile)
      img.src = url
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')!
        const size = 100
        canvas.width = size
        canvas.height = size
        ctx.drawImage(img, 0, 0, size, size)

        const imageData = ctx.getImageData(0, 0, size, size)
        const pixels = imageData.data

        // 简单颜色采样取主色调
        const colorBuckets: { r: number; g: number; b: number; count: number }[] = []
        for (let i = 0; i < pixels.length; i += 20) {
          const r = pixels[i], g = pixels[i + 1], b = pixels[i + 2]
          // 找最近的 bucket
          let found = false
          for (const bucket of colorBuckets) {
            const dist = Math.abs(bucket.r - r) + Math.abs(bucket.g - g) + Math.abs(bucket.b - b)
            if (dist < 60) { bucket.r = (bucket.r + r) / 2; bucket.g = (bucket.g + g) / 2; bucket.b = (bucket.b + b) / 2; bucket.count++; found = true; break }
          }
          if (!found) colorBuckets.push({ r, g, b, count: 1 })
        }

        colorBuckets.sort((a, b) => b.count - a.count)
        const top = colorBuckets.slice(0, 3)

        const toHex = (c: { r: number; g: number; b: number }) =>
          '#' + [c.r, c.g, c.b].map(v => Math.round(v).toString(16).padStart(2, '0')).join('')

        const primary = top[0] || { r: 124, g: 92, b: 252 }
        const accent = top[1] || { r: 0, g: 212, b: 170 }
        const bgColor = top[0] || { r: 15, g: 15, b: 26 }

        // 生成深色主题变体
        const colors: ThemeColors = {
          bg: toHex({ r: Math.round(bgColor.r * 0.08), g: Math.round(bgColor.g * 0.08), b: Math.round(bgColor.b * 0.12) }),
          surface: toHex({ r: Math.round(bgColor.r * 0.12), g: Math.round(bgColor.g * 0.12), b: Math.round(bgColor.b * 0.18) }),
          border: toHex({ r: Math.round(bgColor.r * 0.2), g: Math.round(bgColor.g * 0.2), b: Math.round(bgColor.b * 0.3) }),
          text: '#e8e8f0',
          textSecondary: '#9090a8',
          primary: toHex(primary),
          primaryHover: toHex({ r: Math.min(255, primary.r + 30), g: Math.min(255, primary.g + 30), b: Math.min(255, primary.b + 30) }),
          accent: toHex(accent),
        }

        applyColors(colors)
        localStorage.setItem('ai-music-custom-theme', JSON.stringify(colors))
        URL.revokeObjectURL(url)
        resolve(colors)
      }
    })
  },

  resetTheme() {
    localStorage.removeItem('ai-music-custom-theme')
    const mode = this.getMode()
    this.setMode(mode)
  },
}
