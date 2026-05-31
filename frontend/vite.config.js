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
        target: process.env.VITE_API_URL || 'http://localhost:8000',
        changeOrigin: true,
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser'
  }
})
