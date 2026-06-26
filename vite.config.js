// INIT: Vite Configuration & Service Worker Generation
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/',
  build: {
    target: 'esnext',
    minify: 'terser',
    rollupOptions: {
      output: {
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
      registerType: 'prompt',
      workbox: {
        // Caching local assets (added woff2 for fonts, json for translations)
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,json}'],
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            // NETWORK: Intercept and cache Tone.js external piano samples
            urlPattern: /^https:\/\/tonejs\.github\.io\/audio\/salamander\/.*\.(mp3|wav)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'tonejs-audio-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] }
            }
          }
        ]
      },
      manifest: {
        name: 'Ebony & Ivory', short_name: 'E&I', description: 'Digital sheet music ecosystem',
        theme_color: '#ffffff', background_color: '#ffffff', display: 'standalone',
        icons: [{ src: '/assets/logo.png', sizes: '192x192', type: 'image/png' }]
      }
    })
  ]
});
