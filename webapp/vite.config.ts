import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Group all iconify imports into a separate chunk
          if (id.includes('@iconify-vue/mdi') || id.includes('@iconify-vue/ic')) {
            return 'iconify-icons'
          }
          // Group Vue and router into vendor chunk
          if (id.includes('vue') || id.includes('vue-router') || id.includes('pinia')) {
            return 'vue-vendor'
          }
          // Group Vuetify into its own chunk since it's large
          if (id.includes('vuetify')) {
            return 'vuetify'
          }
          // Group Leaflet mapping into its own chunk
          if (id.includes('leaflet')) {
            return 'leaflet'
          }
        }
      }
    },
    // Increase the chunk size warning limit since we're dealing with icons
    chunkSizeWarningLimit: 1000
  }
})
