import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  optimizeDeps: {
    exclude: [
      '@midnight-ntwrk/onchain-runtime',
      '@midnight-ntwrk/zswap',
      '@midnight-ntwrk/ledger',
      '@midnight-ntwrk/midnight-js-types',
      '@midnight-ntwrk/midnight-js-utils',
      '@midnight-ntwrk/midnight-js-contracts',
      '@midnight-ntwrk/compact-runtime',
      '@midnight-ntwrk/wallet-api',
      '@midnight-ntwrk/midnight-js-level-private-state-provider',
      '@midnight-ntwrk/midnight-js-fetch-zk-config-provider',
      '@midnight-ntwrk/midnight-js-http-client-proof-provider',
      '@midnight-ntwrk/midnight-js-indexer-public-data-provider',
      '@midnight-ntwrk/midnight-js-network-id',
      '@midnight-ntwrk/dapp-connector-api',
      '@meshsdk/midnight-setup',
    ],
  },
  build: {
    rollupOptions: {
      external: [
        /^@midnight-ntwrk\//,
        /^@meshsdk\/midnight-setup/,
      ],
    },
  },
  assetsInclude: ['**/*.wasm'],
})
