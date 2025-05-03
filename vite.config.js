import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// Load environment variables
import dotenv from 'dotenv'
dotenv.config()

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: parseInt(process.env.VITE_PORT), // ✅ use the env variable
  },
})
