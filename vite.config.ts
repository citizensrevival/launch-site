import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
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
    // Define global constants for environment variables
    define: {
      __APP_ENV__: JSON.stringify(env.APP_ENV),
    },
  }
})
