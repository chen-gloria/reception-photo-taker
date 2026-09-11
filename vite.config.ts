import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// `base` must be '/reception-photo-taker/' on GitHub Pages
// (https://<user>.github.io/<repo>/) but '/' everywhere else — Netlify
// serves this app from the root of its own domain. Netlify's build
// environment always sets NETLIFY=true, so we key off that.
export default defineConfig({
  base: process.env.NETLIFY ? '/' : '/reception-photo-taker/',
  plugins: [react()],
})
