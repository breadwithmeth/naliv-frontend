import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
  preview: {
    port: process.env.PORT ? parseInt(process.env.PORT) : 8080,
    host: '0.0.0.0',
    allowedHosts:
      process.env.NODE_ENV === 'production' ? true : ['localhost', '127.0.0.1'],
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
})
