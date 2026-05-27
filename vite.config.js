import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// On GitHub Pages the app lives at /lead-me-to-the-waters/
// In local dev it lives at /
// We read the base from an env var so local dev is unaffected.
const base = process.env.GITHUB_ACTIONS ? '/lead-me-to-the-waters/' : '/'

export default defineConfig({
  plugins: [react()],
  base,
})
