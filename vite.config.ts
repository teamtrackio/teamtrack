import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'node:path'

// IMPORTANT (GitHub Pages):
// If you deploy to https://<username>.github.io/<repo-name>/ set base below to '/<repo-name>/'.
// If you deploy to a custom domain or a user/organization root page (username.github.io), use '/'.
// This is also controlled by the VITE_BASE_PATH env var set in the GitHub Actions workflow.
export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/',
  resolve: {
    // Mirrors the "@/*" path alias declared in tsconfig.json so Vite's
    // bundler (Rollup) can actually resolve it at build time — tsconfig
    // paths only affect the TypeScript checker, not the bundler.
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'robots.txt'],
      manifest: {
        name: 'TeamTrack',
        short_name: 'TeamTrack',
        description: 'Delegate work without chasing your employees.',
        theme_color: '#111827',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '.',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' }
        ]
      },
      workbox: {
        // Cache only the built static app shell. We deliberately do NOT cache
        // Supabase API responses here to avoid showing stale task data.
        globPatterns: ['**/*.{js,css,html,svg,png,ico}']
      }
    })
  ]
})
