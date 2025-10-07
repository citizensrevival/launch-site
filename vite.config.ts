import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
  server: {
    port: 3000,
    host: true, // Allow external connections
    hmr: {
      port: 3001, // Use a different port for HMR to avoid conflicts
    },
    // Configure SPA fallback for development
    historyApiFallback: true,
  },
  // Configure preview server for production builds
  preview: {
    port: 3000,
    host: true,
    // Configure SPA fallback for preview
    historyApiFallback: true,
  },
})
