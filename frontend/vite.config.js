import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite configuration for React with HMR (Hot Module Replacement)
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,  // Frontend runs on port 3000
    proxy: {
      // Proxy API requests to backend (port 8000)
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      }
    }
  }
})
