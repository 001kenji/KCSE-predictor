import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'


export default defineConfig({
  build: {
    manifest: true,
    commonjsOptions: { transformMixedEsModules: true }, // Change
    assetsDir: '.', // Keeps assets in root of static
  },
  base: process.env.mode === "production" ? "/static/" : "/",
  // base: '/static/', // Ensures paths start with /static/
  root: "./",
  plugins: [
    tailwindcss(),
    react(),    
    ],
    server: {
      headers: {
        "Content-Security-Policy": "worker-src 'self' blob:"
      },
      host: '0.0.0.0', 
        
      }
    
})
