import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Dirección del backend para llamadas API si haces fetch desde React
const BACKEND_URL = 'http://backend:8000'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: BACKEND_URL,
        changeOrigin: true
      }
    }
  }
})
