import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  // GitHub Pages serves this repo at github.io/BookItch/, not at the
  // domain root, so every built asset path needs that prefix. Left as '/'
  // for `vite dev`/`vite preview` so local development is unaffected.
  base: command === 'build' ? '/BookItch/' : '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
}))
