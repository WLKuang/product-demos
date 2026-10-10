import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// base './' keeps the build portable: GitHub Pages subpaths, Vercel or a single static folder all work.
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
})
