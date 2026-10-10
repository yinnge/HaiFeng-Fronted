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
      // 后端自托管 pdf.js viewer（PDF 报告预览）。
      // 必须与 PDF 直链(/api/v1/public/pdf/...)同源，否则 pdf.js 会拦截；
      // 生产环境由 nginx 反代同名路径，dev 由这里转发。
      '/pdfjs': {
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
