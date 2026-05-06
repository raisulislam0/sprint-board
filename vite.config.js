import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const target = env.VITE_FRAPPE_PROXY_TARGET || 'http://support:8000'
  const siteHost = env.VITE_FRAPPE_SITE_HOST || ''

  return {
    plugins: [react(), tailwindcss()],
    server: {
      port: 8010,
      strictPort: true,
      watch: {
        // Avoid ENOSPC (inotify watcher limit) on dev machines
        usePolling: true,
        interval: 300,
      },
      proxy: {
        // Frappe APIs
        '/api': {
          target,
          changeOrigin: true,
          secure: false,
          configure: (proxy) => {
            if (!siteHost) return
            proxy.on('proxyReq', (proxyReq) => {
              proxyReq.setHeader('host', siteHost)
            })
          },
        },
        // Common Frappe paths you may hit in the UI
        '/files': {
          target,
          changeOrigin: true,
          secure: false,
          configure: (proxy) => {
            if (!siteHost) return
            proxy.on('proxyReq', (proxyReq) => {
              proxyReq.setHeader('host', siteHost)
            })
          },
        },
        '/private': {
          target,
          changeOrigin: true,
          secure: false,
          configure: (proxy) => {
            if (!siteHost) return
            proxy.on('proxyReq', (proxyReq) => {
              proxyReq.setHeader('host', siteHost)
            })
          },
        },
      },
    },
  }
})
