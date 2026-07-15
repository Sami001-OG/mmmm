import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// SSR-aware config:
// - Default build (no `--ssr` flag) produces the client bundle to `dist`.
// - `vite build --ssr src/entry-server.jsx` produces the server bundle and
//   is driven by `scripts/prerender.mjs` and `server.js`.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        // Split vendors so the admin panel / markdown / motion libs don't
        // ship in the critical path for every visitor.
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (id.includes('react-router') || id.includes('react-dom') || id.includes('/react/')) {
            return 'vendor-react'
          }
          if (id.includes('gsap') || id.includes('lenis')) return 'motion'
          if (id.includes('three')) return 'three'
          if (id.includes('cmdk')) return 'cmdk'
          if (id.includes('react-markdown') || id.includes('remark') || id.includes('micromark') || id.includes('mdast')) {
            return 'markdown'
          }
        },
      },
    },
  },
  ssr: {
    noExternal: ['react-router-dom'],
  },
})
