import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('recharts')) return 'recharts'
          if (id.includes('node_modules')) return 'vendor'
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
})
