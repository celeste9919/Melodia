import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Remove crossorigin attribute from output for Electron file:// compatibility
function removeCrossorigin() {
  return {
    name: 'remove-crossorigin',
    transformIndexHtml(html: string) {
      return html.replace(/ crossorigin/g, '')
    },
  }
}

export default defineConfig({
  base: './',
  plugins: [react(), removeCrossorigin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
  },
  build: {
    // Ensure relative paths work with file:// protocol
    modulePreload: false,
  },
})
