import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // 配置API代理，解决CORS问题
      '/api': {
        target: 'http://122.51.25.229:3000', // 后端服务器地址
        changeOrigin: true,
        rewrite: (path) => path,
      },
    },
  },
})