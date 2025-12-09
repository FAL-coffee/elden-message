import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { copyFileSync, existsSync } from 'fs'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-content-css',
      closeBundle() {
        const contentCssPath = resolve(__dirname, 'src/styles/content.css')
        const distPath = resolve(__dirname, 'dist/content.css')

        if (existsSync(contentCssPath)) {
          copyFileSync(contentCssPath, distPath)
          console.log('Copied content.css to dist/')
        }
      },
    },
  ],
  base: './',
  build: {
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'popup.html'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]',
      },
    },
    outDir: 'dist',
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  publicDir: 'public',
})
