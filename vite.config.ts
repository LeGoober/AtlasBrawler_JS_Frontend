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

      // Required for Render.com preview URLs
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
            },

            {
              src: '/assets/atlas_brawler_logo_component.png',
              sizes: '512x512',
              type: 'image/png',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,mp3,wav,gif}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/.*\.(png|jpg|jpeg|svg|gif)$/,
              handler: 'CacheFirst' as const,
              options: {
                cacheName: 'images-cache',
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
                },
              },
            },
          ],
        },
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