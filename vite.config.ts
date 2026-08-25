import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    base: '/Repair Pages/',
    server: {
      port: 3000,
      host: '0.0.0.0',
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        // Cấu hình alias chuẩn xác trỏ vào thư mục src
        '@': path.resolve(__dirname, './src'),
      },
    },
  };
});
