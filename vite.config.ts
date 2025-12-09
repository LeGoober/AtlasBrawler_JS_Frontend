import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import commonjs from '@rollup/plugin-commonjs';

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
            commonjs({
                transformMixedEsModules: true,
                include: ['node_modules/**'],
            }),
            react(),
            VitePWA({
                registerType: 'autoUpdate',
                includeAssets: [
                    'favicon.ico',
                    '/assets/atlas_brawler_logo_component.png'
                ],

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

                workbox: {
                    maximumFileSizeToCacheInBytes: 15 * 1024 * 1024,
                    globPatterns: ['**/*.{js,css,html}'],
                    globIgnores: [
                        'node_modules/**/*',
                        'sw.js',
                        'workbox-*.js',
                    ],
                    runtimeCaching: [
                        {
                            urlPattern: /^https:\/\/.*\.(png|jpg|jpeg|svg|gif)$/i,
                            handler: 'CacheFirst',
                            options: {
                                cacheName: 'images',
                                expiration: {
                                    maxEntries: 100,
                                    maxAgeSeconds: 60 * 24 * 60 * 60,
                                },
                            },
                        },
                        {
                            urlPattern: /^https:\/\/.*\.(mp3|wav)$/i,
                            handler: 'CacheFirst',
                            options: {
                                cacheName: 'audio',
                                expiration: {
                                    maxEntries: 50,
                                    maxAgeSeconds: 60 * 24 * 60 * 60,
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
            global: 'globalThis',
            Buffer: ['buffer', 'Buffer'],
        },

        optimizeDeps: {
            esbuildOptions: {
                define: {
                    global: 'globalThis',
                },
            },
        },

        resolve: {
            alias: {
                '@': path.resolve(__dirname, '.'),
            },
            conditionNames: ['import', 'module', 'browser', 'default'],
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
            commonjsOptions: {
                transformMixedEsModules: true,
                esmExternals: true,
            },
        },

        publicDir: 'public',
    };
});
