import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// `base` must be '/reception-photo-taker/' on GitHub Pages
// (https://<user>.github.io/<repo>/) but '/' everywhere else — Netlify
// serves this app from the root of its own domain. netlify.toml sets
// VITE_BASE=/ explicitly so this works for both cloud builds and local
// `netlify deploy` runs.
export default defineConfig({
  base: process.env.VITE_BASE || '/reception-photo-taker/',
  plugins: [react()],
})
