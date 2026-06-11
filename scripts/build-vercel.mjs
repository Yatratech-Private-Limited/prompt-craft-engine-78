/**
 * Transforms TanStack Start's dist/ output into Vercel Build Output API v3 format.
 *
 * Output layout:
 *   .vercel/output/static/          ← client assets served from CDN
 *   .vercel/output/functions/        ← SSR catch-all function
 *   .vercel/output/config.json       ← routing rules
 */
import { cp, mkdir, writeFile, rm } from 'node:fs/promises'
import { execSync } from 'node:child_process'

const VERCEL_OUT = '.vercel/output'
const FUNC_DIR   = `${VERCEL_OUT}/functions/index.func`

// 1. Clean and build
await rm(VERCEL_OUT, { recursive: true, force: true })
execSync('vite build', { stdio: 'inherit' })

// 2. Static assets → CDN
await mkdir(`${VERCEL_OUT}/static`, { recursive: true })
await cp('dist/client', `${VERCEL_OUT}/static`, { recursive: true })

// 3. Server bundle → Node.js function
await mkdir(FUNC_DIR, { recursive: true })
await cp('dist/server', `${FUNC_DIR}/server`, { recursive: true })

// 4. Adapter: bridges Node.js http req/res ↔ Web Fetch API
await writeFile(`${FUNC_DIR}/index.mjs`, `
import server from './server/server.js'
import { Readable } from 'node:stream'

export default async function handler(req, res) {
  const proto = req.headers['x-forwarded-proto'] || 'https'
  const host  = req.headers['x-forwarded-host'] || req.headers.host || 'localhost'
  const url   = new URL(req.url, \`\${proto}://\${host}\`)

  const headers = new Headers()
  for (const [key, val] of Object.entries(req.headers)) {
    if (val != null) headers.set(key, Array.isArray(val) ? val.join(', ') : val)
  }

  const hasBody = !['GET', 'HEAD'].includes(req.method ?? 'GET')
  const fetchReq = new Request(url.toString(), {
    method: req.method,
    headers,
    ...(hasBody ? { body: Readable.toWeb(req), duplex: 'half' } : {}),
  })

  try {
    const fetchRes = await server.fetch(fetchReq)
    res.statusCode = fetchRes.status
    for (const [key, val] of fetchRes.headers.entries()) res.setHeader(key, val)
    if (fetchRes.body) {
      const reader = fetchRes.body.getReader()
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        res.write(value)
      }
    }
    res.end()
  } catch (err) {
    console.error(err)
    res.statusCode = 500
    res.end('Internal Server Error')
  }
}
`.trimStart())

// 5. Function runtime config
await writeFile(`${FUNC_DIR}/.vc-config.json`, JSON.stringify({
  runtime: 'nodejs20.x',
  handler: 'index.mjs',
  launcherType: 'Nodejs',
  supportsResponseStreaming: true,
}, null, 2))

// 6. Routing: static assets first, then SSR
await writeFile(`${VERCEL_OUT}/config.json`, JSON.stringify({
  version: 3,
  routes: [
    // Long-cache immutable hashed assets
    {
      src: '/assets/.*',
      headers: { 'Cache-Control': 'public, max-age=31536000, immutable' },
      continue: true,
    },
    // Serve any file that exists as static
    { handle: 'filesystem' },
    // Everything else → SSR function
    { src: '/(.*)', dest: '/index' },
  ],
}, null, 2))

console.log('\n✓  Vercel output ready in .vercel/output/\n')
