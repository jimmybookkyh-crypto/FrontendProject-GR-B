import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  root: "frontend",
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
      "/ws": {
        target: "ws://localhost:3000", // sends any requests starting with "/ws" to the backend server
        ws: true, // enables WebSocket proxying
      },
    },
  },
});