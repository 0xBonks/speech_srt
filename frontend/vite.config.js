import { fileURLToPath, URL } from 'node:url';
import vueJsx from '@vitejs/plugin-vue-jsx';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  base: './',
  optimizeDeps: {
    exclude: ['@ionic/core/loader']
  },
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: tag => tag.startsWith('ifx-')
        },
      },
    }),
    vueJsx(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: [
      'speech-srt-node-jb-t2s.eu-at-3.icp.infineon.com',
      'speech-srt-frontend.icp.infineon.com'
    ]
  }
});