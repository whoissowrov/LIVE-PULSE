import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

function htmlEntryPlugin() {
  return {
    name: 'html-entry-plugin',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        // In Vite build & dev mode, route compilation through /src/main.jsx
        return html
          .replace(/<script type="module" crossorigin src="[^"]*assets\/[^"]*"><\/script>/gi, '<script type="module" src="/src/main.jsx"></script>')
          .replace(/<link rel="stylesheet" crossorigin href="[^"]*assets\/[^"]*">/gi, '');
      }
    }
  };
}

export default defineConfig({
  plugins: [react(), htmlEntryPlugin()],
  base: './',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        districts: resolve(__dirname, 'districts.html'),
        hospitals: resolve(__dirname, 'hospitals.html'),
        urgent: resolve(__dirname, 'urgent.html'),
        map: resolve(__dirname, 'map.html'),
        donors: resolve(__dirname, 'donors.html'),
        compatibility: resolve(__dirname, 'compatibility.html'),
      }
    }
  },
  server: {
    port: 5173,
    host: true
  }
});
