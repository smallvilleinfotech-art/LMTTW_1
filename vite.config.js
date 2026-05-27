import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// On GitHub Pages the app lives at /LMTTW_1/
// In local dev it lives at /
const base = process.env.GITHUB_ACTIONS ? '/LMTTW_1/' : '/'

export default defineConfig({
  plugins: [react()],
  base,
})
