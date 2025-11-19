import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    // CORREÇÃO CRÍTICA: Desativa o preloader do Vite que usa 'window'
    // Isso impede o erro "window is not defined" no Service Worker
    modulePreload: false,
    
    rollupOptions: {
      input: {
        background: resolve(__dirname, 'src/background.ts'),
        options: resolve(__dirname, 'src/options.ts'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]'
      }
    },
    outDir: 'dist',
    emptyOutDir: true
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
})