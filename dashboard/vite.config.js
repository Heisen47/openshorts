import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  const backendTarget = process.env.BACKEND_URL || env.BACKEND_URL || env.VITE_BACKEND_URL || 'http://localhost:8000'
  const rendererTarget = process.env.RENDERER_URL || env.RENDERER_URL || env.VITE_RENDERER_URL || 'http://localhost:3100'

  const createProxyOptions = (target) => ({
    target,
    changeOrigin: true,
    configure: (proxy) => {
      proxy.on('error', (err, _req, res) => {
        if (res && !res.headersSent) {
          res.writeHead(503, {
            'Content-Type': 'application/json',
          })
          res.end(JSON.stringify({ error: 'Backend proxy error', message: err.message }))
        }
      })
    }
  })

  return {
    plugins: [react()],
    server: {
      allowedHosts: [
        'openshorts.app',
        'www.openshorts.app'
      ],
      proxy: {
        '/api': createProxyOptions(backendTarget),
        '/videos': createProxyOptions(backendTarget),
        '/thumbnails': createProxyOptions(backendTarget),
        '/gallery': createProxyOptions(backendTarget),
        '/video': createProxyOptions(backendTarget),
        '/render': createProxyOptions(rendererTarget),
      }
    }
  }
})
