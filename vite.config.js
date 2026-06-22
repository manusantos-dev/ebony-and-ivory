import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/',
  build: {
    target: 'esnext',
    minify: 'terser',
    rollupOptions: {
      output: {
        // Dependency chunking
        manualChunks(id) {
          if (id.includes('node_modules/vexflow')) return 'vexflow_engine';
          if (id.includes('node_modules/firebase')) return 'firebase_core';
          if (id.includes('node_modules/tone')) return 'tone_audio';
        }
      }
    }
  },
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        cleanupOutdatedCaches: true
      },
      manifest: {
        name: 'Ebony & Ivory',
        short_name: 'E&I',
        description: 'Digital sheet music ecosystem',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          { src: '/assets/logo.png', sizes: '192x192', type: 'image/png' }
        ]
      }
    })
  ]
});