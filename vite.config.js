import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    base: '/gold-gold-gold/',
    plugins: [react()],
    server: {
      port: parseInt(env.VITE_MAINPAGE_PORT) || 3000,
      host: true,
    },
    build: {
      outDir: 'dist',
      assetsInclude: ['**/*.jpg', '**/*.png', '**/*.webp'], // Include all image types
      rollupOptions: {
        output: {
          assetFileNames: 'assets/images/[name]-[hash][extname]'
        }
      }
    },
    resolve: {
      alias: {
        '@assets': resolve(__dirname, './src/assets')
      }
    }
  };
});