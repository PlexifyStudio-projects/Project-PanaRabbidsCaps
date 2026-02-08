import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/Project-PlexifyCaps/',
  server: {
    port: 5180,
    host: true,
  },
  css: {
    preprocessorOptions: {
      scss: {
        silenceDeprecations: ['legacy-js-api', 'import', 'global-builtin', 'color-functions', 'slash-div'],
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 800,
  },
})
