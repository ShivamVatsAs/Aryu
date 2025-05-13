// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: { // <-- Add this 'server' section
    proxy: {
      // Proxy requests starting with '/api' to your backend server
      '/api': {
        target: 'http://localhost:3001', // Your backend URL
        changeOrigin: true, // Recommended for virtual hosted sites
      },
    },
  },
});