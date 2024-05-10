import { defineConfig, loadEnv } from 'vite'
import { resolve } from 'path'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  return {
    server: {
      open: true,
      proxy: {
        '^/api/.*': {
          target: env.VITE_APP_API,
          changeOrigin: true,
          ws: true,
          // rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
    plugins: [vue(), vuetify({ autoImport: true })],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },
  }
})
