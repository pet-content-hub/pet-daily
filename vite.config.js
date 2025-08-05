import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import { resolve } from 'path'
import copy from 'rollup-plugin-copy';

export default defineConfig({
  plugins: [
    copy({
      targets: [
        { src: 'config.json', dest: 'dist' },
        { src: 'articles.json', dest: 'dist' },
        { src: 'sitemap.xml', dest: 'dist' },
        { src: 'feed.xml', dest: 'dist' },
        { src: 'robots.txt', dest: 'dist' },
        { src: 'articles/**/*', dest: 'dist/articles' },
        // { src: 'assets/**/*', dest: 'dist/assets' }, // 注释掉，因为这是旧版本的资源
        { src: '404.html', dest: 'dist' },
        { src: 'CNAME', dest: 'dist' },
      ],
      hook: 'writeBundle',
    }),
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json}']
      },
      manifest: {
        name: '猫咪世界',
        short_name: '猫咪世界',
        description: '专业的养猫知识分享平台',
        theme_color: '#ff6b6b',
        background_color: '#f8f9fa',
        display: 'standalone',
        icons: [
          {
            src: '/assets/images/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/assets/images/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      }
    }
  },
  server: {
    port: 3000,
    open: true,
    historyApiFallback: true
  }
})