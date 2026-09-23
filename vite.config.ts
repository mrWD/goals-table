import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// GitHub Pages serves the app from /<repo>/, other hosts from the root.
// BASE_PATH is set by the deploy workflow; local dev and preview stay at '/'.

/*
 * The store build, which Capacitor wraps around this same output.
 *
 * It ships without a service worker, and with one that deletes any already installed.
 * On the web the worker earns its place — it is what makes the app open with no network,
 * and this app is useful offline by design. Inside the native shell it has nothing to add
 * (every file it would cache is already in the app bundle) and it takes something away:
 * a build installed over another kept serving the previous one. That trap is documented
 * in the sibling trackers; this avoids inheriting it.
 */
const NATIVE_SHELL = process.env.NATIVE_SHELL === '1'

export default defineConfig({
  base: process.env.BASE_PATH ?? '/',
  define: {
    __BUILD_TIME__: JSON.stringify(new Date().toISOString().slice(0, 16).replace('T', ' ')),
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      selfDestroying: NATIVE_SHELL,
      includeAssets: ['favicon.svg', 'icons/*.png'],
      manifest: {
        name: 'GoalsTable',
        short_name: 'GoalsTable',
        description: 'A year of goals, a month of focus, and the hour you sit down to do it.',
        start_url: './',
        scope: './',
        display: 'standalone',
        background_color: '#f4f5f7',
        theme_color: '#f4f5f7',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        navigateFallback: 'index.html',
      },
    }),
  ],
  server: { host: true },
  preview: { host: true },
})
