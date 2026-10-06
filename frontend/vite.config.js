import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const API_TARGET = process.env.VITE_API_TARGET || 'https://meridian-health-vmb7.onrender.com';

const proxy = {
  '/api': {
    target: API_TARGET,
    changeOrigin: true,
    secure: true,
  },
};

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy,
  },
  preview: {
    proxy,
  },
});
