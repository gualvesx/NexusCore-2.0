import { defineConfig } from 'vite';
import { resolve } from 'path';
import { viteStaticCopy } from 'vite-plugin-static-copy'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    // Diretório de saída
    outDir: 'dist',
    // Limpar o diretório antes de construir
    emptyOutDir: true,
    
    // Configuração do Rollup para múltiplos arquivos de entrada (nossos scripts)
    rollupOptions: {
      input: {
        // Nossos dois scripts principais
        background: resolve(__dirname, 'src/background.ts'),
        options: resolve(__dirname, 'src/options.ts'),
      },
      output: {
        // Garante que os arquivos de saída tenham nomes simples (background.js, options.js)
        entryFileNames: '[name].js',
        chunkFileNames: 'chunks/[name].js',
        assetFileNames: 'assets/[name].[ext]',
      },
    },
  },
});