import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const target = env.VITE_API_TARGET || 'http://localhost:8080'
  // 认证/系统 API 统一前缀，避免把 SPA 路由 /login 代理到后端
  const apiPrefix = env.VITE_APP_BASE_API || '/dev-api'

  return {
    plugins: [vue()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    },
    server: {
      port: 3000,
      proxy: {
        // 若依原生接口（captcha/login/getInfo/getRouters/logout/system/monitor/common）
        [apiPrefix]: {
          target,
          changeOrigin: true,
          rewrite: (p) => p.replace(new RegExp(`^${apiPrefix}`), '')
        },
        // 产品业务 API（后续接真实后端）
        '/api': {
          target,
          changeOrigin: true
        }
      }
    }
  }
})
