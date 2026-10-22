import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: './', // percorsi relativi: funziona anche in una sottocartella (GitHub Pages)
  plugins: [react()],
})
