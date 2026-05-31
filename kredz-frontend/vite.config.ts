import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import wasm from 'vite-plugin-wasm'
import topLevelAwait from 'vite-plugin-top-level-await'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
  plugins: [react(), tailwindcss(), wasm(), topLevelAwait(), nodePolyfills({ include: ['buffer', 'events'] })],
  build: {
    target: 'esnext',
  },
  server: {
    allowedHosts: true,
  },
  assetsInclude: ['**/*.wasm'],
})
