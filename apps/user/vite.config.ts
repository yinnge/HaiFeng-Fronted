import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@haifeng/shared': resolve(__dirname, '../../packages/shared/src'),
    },
  },
  server: {
    port: 3001,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:18080',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    // 不内联小资源为 data URI（预设头像等小 SVG 内联后 >500 字符，超出数据库 varchar 列）
    assetsInlineLimit: 0,
  },
})
