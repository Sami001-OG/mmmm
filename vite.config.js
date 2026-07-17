import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { execSync } from 'node:child_process'

// Build provenance for the footer nameplate — stamped at build time like a
// manufacturing plate. Vercel exposes the commit; local builds ask git.
function buildInfo() {
  let sha = process.env.VERCEL_GIT_COMMIT_SHA || ''
  if (!sha) {
    try { sha = execSync('git rev-parse HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim() } catch { /* not a repo */ }
  }
  return { sha: sha.slice(0, 7) || 'dev', builtAt: new Date().toISOString().slice(0, 10) }
}

// SSR-aware config:
// - Default build (no `--ssr` flag) produces the client bundle to `dist`.
// - `vite build --ssr src/entry-server.jsx` produces the server bundle and
//   is driven by `scripts/prerender.mjs` and `server.js`.
export default defineConfig({
  plugins: [react()],
  define: {
    __BUILD_INFO__: JSON.stringify(buildInfo()),
  },
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
