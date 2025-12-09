import { defineConfig } from 'vite'
import { resolve } from 'path'

// Background script専用のビルド設定 (IIFE形式)
export default defineConfig({
  plugins: [
    {
      name: 'remove-ws-import',
      generateBundle(_, bundle) {
        // ビルド後のコードから ws import を削除
        for (const fileName in bundle) {
          const chunk = bundle[fileName]
          if (chunk.type === 'chunk' && chunk.code) {
            chunk.code = chunk.code.replace(/import\s+\w+\s+from\s+["']ws["'];?\s*/g, '/* ws import removed */\n')
          }
        }
      },
    },
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/background/background.ts'),
      name: 'BackgroundScript',
      formats: ['iife'],
      fileName: () => 'background.js',
    },
    rollupOptions: {
      output: {
        extend: true,
        inlineDynamicImports: true, // すべてを1つのファイルにバンドル
      },
    },
    outDir: 'dist',
    emptyOutDir: false, // 他のファイルを削除しない
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      // Node.js専用モジュールをブラウザ互換に
      'ws': resolve(__dirname, 'src/shared/ws-shim.ts'),
    },
  },
  define: {
    global: 'globalThis',
  },
})
