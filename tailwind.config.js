/** @type {import('tailwindcss').Config} */
export default {
  // @ts-ignore
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // @ts-ignore
  darkMode: 'class',
  // @ts-ignore
  theme: {
    extend: {
      colors: {
        // 使用 CSS 变量支持动态主题
        'app-bg': 'var(--color-bg)',
        'app-surface': 'var(--color-surface)',
        'app-border': 'var(--color-border)',
        'app-text': 'var(--color-text)',
        'app-text-secondary': 'var(--color-text-secondary)',
        'app-primary': 'var(--color-primary)',
        'app-primary-hover': 'var(--color-primary-hover)',
        'app-accent': 'var(--color-accent)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  // @ts-ignore
  plugins: [],
}
