import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  root: 'src/renderer',
  base: './',
  build: {
    outDir: '../../dist/renderer',
    emptyOutDir: true
  },
  server: {
    port: 5173,
    strictPort: true
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src/renderer'),
      '@/components': resolve(__dirname, 'src/renderer/components'),
      '@/pages': resolve(__dirname, 'src/renderer/pages'),
      '@/store': resolve(__dirname, 'src/renderer/store'),
      '@/utils': resolve(__dirname, 'src/renderer/utils'),
      '@/hooks': resolve(__dirname, 'src/renderer/hooks'),
      '@/types': resolve(__dirname, 'src/renderer/types')
    }
  }
})