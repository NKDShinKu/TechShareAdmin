import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  // 指定开发服务器端口，避免与其他项目冲突。可通过环境变量 VITE_PORT 覆盖。
  server: {
    port: Number(process.env.VITE_PORT) || 5174,
  },
})
