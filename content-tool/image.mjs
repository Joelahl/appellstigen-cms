#!/usr/bin/env node
/**
 * image.mjs — generate a branded OG/hero image for an article and upload it to
 * the CMS Media library. Free + on-brand: builds an SVG from the site's brand
 * colors + the article title, rasterises with sharp (1200×630), and POSTs it to
 * Payload /api/media. Prints the public URL (use as the page's seo.ogImageUrl
 * and/or a hero <img>).
 *
 * Env (affiliate-cms/.env, auto-loaded via lib.mjs): PAYLOAD_CMS_URL, PAYLOAD_API_KEY
 *
 * Usage:
 *   node content-tool/image.mjs --site <cmsSiteId> --title "Artikeltitel" [--slug kreditkortsavgifter]
 */
import sharp from 'sharp'
import { env } from './lib.mjs'

function args(argv) {
  const o = {}
  for (let i = 0; i < argv.length; i++) if (argv[i].startsWith('--')) o[argv[i].slice(2)] = argv[i + 1]
  return o
}
const a = args(process.argv.slice(2))
if (!a.site || !a.title) { console.error('Usage: image.mjs --site <id> --title "..." [--slug ...]'); process.exit(1) }

const { CMS, KEY, headers } = env()

const xml = (s) => String(s).replace(/[<>&"']/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' }[c]))

/** Greedy word-wrap into <= maxChars lines (cap 4). */
function wrap(text, maxChars = 24, maxLines = 4) {
  const words = text.split(/\s+/)
  const lines = []
  let cur = ''
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > maxChars) { if (cur) lines.push(cur); cur = w } else { cur = (cur + ' ' + w).trim() }
  }
  if (cur) lines.push(cur)
  if (lines.length > maxLines) { lines.length = maxLines; lines[maxLines - 1] = lines[maxLines - 1].replace(/.{1}$/, '…') }
  return lines
}

// Fetch the site's brand colors + name.
const site = await fetch(`${CMS}/api/sites/${a.site}?depth=0`, { headers }).then((r) => r.json()).catch(() => ({}))
const primary = site?.branding?.primaryColor || '#2563eb'
const accent = site?.branding?.accentColor || '#f59e0b'
const siteName = site?.branding?.siteName || site?.name || ''

const lines = wrap(a.title)
const titleSvg = lines
  .map((ln, i) => `<text x="80" y="${250 + i * 76}" font-family="Arial, Helvetica, sans-serif" font-size="62" font-weight="700" fill="#ffffff">${xml(ln)}</text>`)
  .join('')

const svg = `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="${xml(primary)}"/><stop offset="1" stop-color="#0f172a"/>
  </linearGradient></defs>
  <rect width="1200" height="630" fill="url(#g)"/>
  <rect x="80" y="150" width="90" height="10" fill="${xml(accent)}"/>
  ${titleSvg}
  <text x="80" y="560" font-family="Arial, Helvetica, sans-serif" font-size="30" font-weight="600" fill="${xml(accent)}">${xml(siteName)}</text>
</svg>`

const png = await sharp(Buffer.from(svg)).png().toBuffer()

// Upload to Payload Media (multipart). Do NOT set Content-Type — let fetch set the boundary.
const filename = `og-${(a.slug || 'artikel').replace(/[^a-z0-9-]/gi, '-').slice(0, 40)}-${Date.now().toString(36)}.png`
const fd = new FormData()
fd.append('file', new Blob([png], { type: 'image/png' }), filename)
fd.append('alt', a.title)

const res = await fetch(`${CMS}/api/media`, { method: 'POST', headers: { Authorization: `users API-Key ${KEY}` }, body: fd })
const body = await res.json().catch(() => ({}))
if (!res.ok) { console.error(`media upload: ${res.status} ${JSON.stringify(body).slice(0, 400)}`); process.exit(1) }

const doc = body?.doc ?? body
const rel = doc?.sizes?.og?.url || doc?.url || ''
const url = rel.startsWith('http') ? rel : `${CMS}${rel}`
console.log(JSON.stringify({ mediaId: doc?.id, url, filename }, null, 2))
