import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Forwards API calls to the SnapLink backend during local dev
      // so the browser never has to deal with cross-origin requests.
      // Override with VITE_DEV_API_PROXY_TARGET if your backend runs
      // somewhere other than localhost:4000 (e.g. a different port).
      '/api': {
        target: process.env.VITE_DEV_API_PROXY_TARGET || 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
})
