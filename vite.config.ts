import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  root: 'frontend',   // sets the root directory to the 'frontend' folder
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',        // sends any requests starting with "/api" to the backend server
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''), // removes the "/api" prefix when forwarding requests
      },
    },
  },
})