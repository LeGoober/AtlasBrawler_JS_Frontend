import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');

  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },

    preview: {
      port: 3000,
      host: '0.0.0.0',
      allowedHosts: ['atlasbrawler-js-frontend.onrender.com'],
    },

    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['assets/**/*'],

        manifest: {
          name: 'Atlas Brawler',
          short_name: 'AtlasBrawler',
          description: 'Skate, trick, and earn crypto rewards on Celo!',
          theme_color: '#FFF600',
          background_color: '#87CEEB',
          display: 'standalone',
          orientation: 'portrait',
          scope: '/',
          start_url: '/',
          icons: [
            {
              src: '/assets/atlas_brawler_logo_component.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any maskable',
            },
            {
              src: '/assets/atlas_brawler_logo_component.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable',
            },
          ],
        },

        // Critical fix starts here
        workbox: {
          // Allow up to 15 MB files to be precached (covers your 9.36 MB MP3 and large sprites)
          maximumFileSizeToCacheInBytes: 15 * 1024 * 1024, // 15 MB

          globPatterns: ['**/*.{js,css,html,ico,png,svg,mp3,wav,gif}'],

          // Optional but recommended: better caching for large assets
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/.*\.(png|jpg|jpeg|svg|gif|mp3|wav)$/i,
              handler: 'CacheFirst' as const,
              options: {
                cacheName: 'game-assets',
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 24 * 60 * 60, // 60 days
                },
              },
            },
          ],
        },
        // Critical fix ends here
      }),
    ],

    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },

    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },

    build: {
      outDir: 'dist',
      sourcemap: false,
      minify: 'terser',
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
          },
        },
      },
      copyPublicDir: true,
    },

    publicDir: 'public',
  };
});