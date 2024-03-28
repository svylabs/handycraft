import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '~': path.resolve(__dirname, 'src'),
    },
  },
  optimizeDeps: {
    include: ['buffer'],
  },
  server: {
    host: "0.0.0.0",
    hmr: {
      clientPort: 5173,
    },
    port: 5173, 
    watch: {
      usePolling: true,
    },
  },
});
