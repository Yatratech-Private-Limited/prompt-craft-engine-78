/**
 * Transforms TanStack Start's dist/ output into Vercel Build Output API v3 format.
 *
 * The key step is bundling dist/server/ + all node_modules into a single file
 * via esbuild so the Vercel function is fully self-contained.
 *
 * Output layout:
 *   .vercel/output/static/          ← client assets served from CDN
 *   .vercel/output/functions/        ← SSR catch-all Node.js function
 *   .vercel/output/config.json       ← routing rules
 */
import { mkdir, writeFile, rm } from 'node:fs/promises'
import { execSync } from 'node:child_process'
import { build } from 'esbuild'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const root = resolve(__dirname, '..')

const VERCEL_OUT = `${root}/.vercel/output`
const FUNC_DIR   = `${VERCEL_OUT}/functions/index.func`

// 1. Clean previous output and run the TanStack Start build
await rm(VERCEL_OUT, { recursive: true, force: true })
execSync('vite build', { stdio: 'inherit', cwd: root })

// 2. Static assets → Vercel CDN
await mkdir(`${VERCEL_OUT}/static`, { recursive: true })
execSync(`cp -r ${root}/dist/client/. ${VERCEL_OUT}/static/`)

// 3. Bundle the entire SSR server (including all node_modules) into one file
await mkdir(FUNC_DIR, { recursive: true })

// Write a thin entry that adapts the fetch handler to Node.js req/res
const entry = `${FUNC_DIR}/_entry.mjs`
await writeFile(entry, `
import { Readable } from 'node:stream'
import server from '${root}/dist/server/server.js'

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

// Bundle everything (server + all node_modules) into a single file
await build({
  entryPoints: [entry],
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'esm',
  outfile: `${FUNC_DIR}/index.mjs`,
  // Only exclude true Node.js built-ins
  external: ['node:*'],
  minify: false,
  // Preserve side-effect imports that packages may incorrectly mark as pure
  ignoreAnnotations: true,
  // Allow dynamic requires from CJS packages
  banner: {
    js: `import { createRequire } from 'node:module'; const require = createRequire(import.meta.url);`,
  },
})

// Clean up temp entry
await rm(entry)

// 4. Function runtime config
await writeFile(`${FUNC_DIR}/.vc-config.json`, JSON.stringify({
  runtime: 'nodejs20.x',
  handler: 'index.mjs',
  launcherType: 'Nodejs',
  supportsResponseStreaming: true,
}, null, 2))

// 5. Routing: static assets from CDN, everything else → SSR
await writeFile(`${VERCEL_OUT}/config.json`, JSON.stringify({
  version: 3,
  routes: [
    {
      src: '/assets/.*',
      headers: { 'Cache-Control': 'public, max-age=31536000, immutable' },
      continue: true,
    },
    { handle: 'filesystem' },
    { src: '/(.*)', dest: '/index' },
  ],
}, null, 2))

console.log('\n✓  Vercel output ready in .vercel/output/\n')
