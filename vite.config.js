import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    server: {
      // Dynamically set the port from the environment variable
      port: parseInt(env.VITE_MAINPAGE_PORT) || 3000, // Default to 3000 if not set
    },
    build: {
      base: '/gold-gold-gold/',
      outDir: 'dist', // Output directory for the build files
      assetsDir: 'assets', // Directory to place assets
      sourcemap: mode === 'production', // Generate source maps in production only
      // You can add more options here like minification, etc.
      rollupOptions: {
        output: {
          // Customize the file naming if needed
          entryFileNames: 'assets/[name]-[hash].js',
          chunkFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]',
        },
      },
    },
  };
});