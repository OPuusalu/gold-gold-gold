import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    base: '/gold-gold-gold/',
    plugins: [react()],
    server: {
      port: parseInt(env.VITE_MAINPAGE_PORT) || 3000,
      // Add host to allow network access if needed
      host: true,
    },
    build: {
      base: '/gold-gold-gold/',
      outDir: 'dist',
      assetsDir: 'assets',
      emptyOutDir: true, // Ensure the dist folder is cleaned before build
      sourcemap: mode === 'development', // Usually better to have sourcemaps in dev only
      minify: 'terser', // Enable minification
      rollupOptions: {
        output: {
          entryFileNames: 'assets/[name]-[hash].js',
          chunkFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash][extname]',
        },
      },
    },
    // Add preview configuration
    preview: {
      port: 4173,
      host: true
    }
  };
});