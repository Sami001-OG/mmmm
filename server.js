// SSR server (dev + prod).
// - dev:  uses Vite in middleware mode so source changes hot-reload.
// - prod: loads the prebuilt server bundle (dist/server/entry-server.js) and
//         serves the static client bundle from dist/, with the SSR'd HTML
//         injected at <!--app-html--> in dist/index.html.
//
// Run:
//   npm run dev:ssr   # dev SSR (Vite middleware)
//   npm run start     # prod SSR (NODE_ENV=production)

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import http from 'node:http'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const isProd = process.env.NODE_ENV === 'production'
const PORT = process.env.PORT || 5173

async function createServer() {
  if (!isProd) {
    // --- DEV: Vite middleware ------------------------------------------------
    const { createServer: createViteServer } = await import('vite')
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    })
    return { vite }
  }

  // --- PROD: return a fake "vite" with a static transformIndexHtml -----------
  const sirv = (await import('sirv')).default
  const serve = sirv(path.resolve(__dirname, 'dist/client'), { extensions: [] })
  const serveAssets = (req, res, next) => serve(req, res, next)

  const template = fs.readFileSync(
    path.resolve(__dirname, 'dist/client/index.html'),
    'utf-8'
  )
  const { render } = await import(
    pathToFileURL(path.resolve(__dirname, 'dist/server/entry-server.js'))
  )

  return {
    vite: {
      middlewares: serveAssets,
      transformIndexHtml: () => template,
      ssrLoadModule: () => ({ render }),
    },
  }
}

async function bootstrap() {
  const { vite } = await createServer()

  const server = http.createServer(async (req, res) => {
    // Serve static assets first (JS, CSS, images, fonts).
    if (req.url.startsWith('/assets/') || req.url === '/favicon.svg') {
      vite.middlewares(req, res, () => {})
      return
    }

    try {
      const url = req.url

      // 1. Read / transform index.html
      let template = await vite.transformIndexHtml(url, undefined)
      if (typeof template !== 'string') {
        template = template.html || ''
      }

      // 2. SSR render the requested route
      const { render } = await vite.ssrLoadModule('/src/entry-server.jsx')
      const appHtml = render(url)

      // 3. Inject rendered markup at the placeholder
      const html = template.replace('<!--app-html-->', appHtml)

      res.statusCode = 200
      res.setHeader('Content-Type', 'text/html; charset=utf-8')
      res.end(html)
    } catch (err) {
      if (!isProd) {
        vite.ssrFixStacktrace(err)
      }
      console.error(err)
      res.statusCode = 500
      res.end('SSR error: ' + (err?.message || String(err)))
    }
  })

  server.listen(PORT, () => {
    console.log(`\n  SAMI SSR server running at http://localhost:${PORT}\n  mode: ${isProd ? 'production' : 'development'}\n`)
  })
}

bootstrap()
