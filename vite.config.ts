import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  // Read VITE_* (manual) and NEXT_PUBLIC_* (Vercel Supabase integration).
  // NOT plain SUPABASE_* — those include secret keys we must never bundle.
  envPrefix: ['VITE_', 'NEXT_PUBLIC_'],
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Saath — Daily Health',
        short_name: 'Saath',
        description: 'A calm daily health companion for the family.',
        lang: 'en',
        theme_color: '#2A2520',
        background_color: '#F5EFE6',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'icons/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // App shell (JS/CSS/HTML) + lesson JSON are precached for offline.
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2,json}'],
        runtimeCaching: [
          {
            // Google Fonts stylesheets.
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'google-fonts-stylesheets' },
          },
          {
            // Google Fonts webfont files.
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
        // Videos (YouTube) are intentionally NOT cached — they require network.
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
});
