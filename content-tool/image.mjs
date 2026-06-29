#!/usr/bin/env node
/**
 * image.mjs — generate a branded OG/hero image for an article and upload it to
 * the CMS Media library. Free + on-brand: builds an SVG from the site's brand
 * colors + logo + the article title, rasterises with sharp (a wide 1200x400
 * banner with rounded corners and a flat single brand color), and POSTs it to
 * Payload /api/media. Prints the public URL of the ORIGINAL upload (not the
 * cropped `og` size) so the rounded horizontal banner is preserved — use it as
 * the page's seo.ogImageUrl and/or a hero/inline <img>.
 *
 * Layout: ACCENT-colored background with the topical motif (card / shield /
 * percent / coin / globe) tiled faintly as a muted, slightly-vertical pattern;
 * the site logo on a white chip top-left; a heavy, high-contrast title. The title
 * color auto-adapts (dark on light accents, white on dark) for legibility.
 *
 * Env (affiliate-cms/.env, auto-loaded via lib.mjs): PAYLOAD_CMS_URL, PAYLOAD_API_KEY
 *
 * Usage:
 *   node content-tool/image.mjs --site <cmsSiteId> --title "Artikeltitel" [--slug kreditkortsavgifter] [--motif card|shield|percent|coin|globe]
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

// Fetch the site's brand colors + logo.
const site = await fetch(`${CMS}/api/sites/${a.site}?depth=0`, { headers }).then((r) => r.json()).catch(() => ({}))
const primary = site?.branding?.primaryColor || '#2563eb'
const accent = site?.branding?.accentColor || '#f59e0b'

// ── Logo (embedded as a data URI, rendered on a white chip) ─────────────────
// Prefer a light variant if the brand provides one; otherwise the standard logo
// on a white chip reads fine on any background. Returns { dataUri, w, h } or null.
async function loadLogo() {
  const b = site?.branding || {}
  let url = b.logoLightUrl || null
  let w = 0, h = 0, mime = ''
  const mediaId = b.logoLight || b.logo
  if (!url && mediaId) {
    const m = await fetch(`${CMS}/api/media/${mediaId}?depth=0`, { headers }).then((r) => r.json()).catch(() => null)
    if (m?.url) { url = m.url.startsWith('http') ? m.url : `${CMS}${m.url}`; w = m.width || 0; h = m.height || 0; mime = m.mimeType || '' }
  }
  if (!url) return null
  try {
    const res = await fetch(url)
    const buf = Buffer.from(await res.arrayBuffer())
    const ct = (res.headers.get('content-type') || mime || 'image/png').split(';')[0]
    return { dataUri: `data:${ct};base64,${buf.toString('base64')}`, w, h }
  } catch { return null }
}
const logo = await loadLogo()

// ── Contextual motif → muted background pattern ─────────────────────────────
// The topical motif (card / shield / percent / coin / globe) is no longer a solid
// right-side graphic; it's tiled faintly across the whole banner as texture.
function pickMotif(title) {
  const t = title.toLowerCase()
  const has = (...ks) => ks.some((k) => t.includes(k))
  let motif = 'card'
  if (has('utan uc', 'kreditupplysning', 'betalningsanmärk', 'säker', 'trygg', 'godkänn', 'nekad', 'skuld')) motif = 'shield'
  else if (has('cashback', 'bonus', 'återbäring', 'poäng', 'rabatt')) motif = 'coin'
  else if (has('ränta', 'avgift', 'billig', 'låg', 'gratis', 'kostnad')) motif = 'percent'
  else if (has('resa', 'rese', 'utomland', 'valuta', 'flyg')) motif = 'globe'
  if (a.motif) motif = a.motif // explicit override for variety
  return motif
}
// Single-colour glyphs (inherit the pattern group's fill) drawn in a ~90x90 cell.
const GLYPH = {
  card: `<rect x="12" y="28" width="66" height="44" rx="8"/>`,
  shield: `<path d="M45 10 L74 22 V44 C74 62 60 74 45 80 C30 74 16 62 16 44 V22 Z"/>`,
  percent: `<text x="45" y="66" font-family="Arial, Helvetica, sans-serif" font-size="64" font-weight="800" text-anchor="middle">%</text>`,
  coin: `<circle cx="45" cy="45" r="30"/>`,
  globe: `<circle cx="45" cy="45" r="30"/>`,
}

// Relative luminance → pick a legible title color for the (accent) background.
function luminance(hex) {
  const m = String(hex).replace('#', '')
  const v = m.length === 3 ? m.split('').map((c) => c + c).join('') : m
  const ch = [0, 2, 4].map((i) => parseInt(v.slice(i, i + 2), 16) / 255)
  const lin = ch.map((c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)))
  return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2]
}

// Wide, horizontal banner: ACCENT background, muted motif pattern, slight rounding.
const W = 1200, H = 400, PAD = 80, RX = 16
const bg = accent
const textColor = luminance(bg) > 0.179 ? '#1b2336' : '#ffffff' // WCAG black/white pick
const glyph = GLYPH[pickMotif(a.title)] || GLYPH.card

// Muted repeating motif: tiles a little taller than wide and rotated so it reads
// as a slightly vertical / diagonal texture rather than a flat grid.
const pattern = `<pattern id="bgp" width="150" height="178" patternUnits="userSpaceOnUse" patternTransform="rotate(-14)">
    <g fill="#ffffff" opacity="0.14" transform="translate(30,44)">${glyph}</g>
  </pattern>`

// Logo chip (top-left) — white pill keeps the logo legible on the accent color.
let chip = ''
if (logo) {
  const LH = 42
  const ratio = logo.w && logo.h ? logo.w / logo.h : 3
  let lw = Math.round(LH * ratio), lh = LH
  if (lw > 300) { lh = Math.round(lh * (300 / lw)); lw = 300 }
  const cp = 18, cx = 64, cy = 42
  chip = `<rect x="${cx}" y="${cy}" width="${lw + cp * 2}" height="${lh + cp * 2}" rx="14" fill="#ffffff"/>
    <image x="${cx + cp}" y="${cy + cp}" width="${lw}" height="${lh}" href="${logo.dataUri}" preserveAspectRatio="xMidYMid meet"/>`
}

// Title — heavier weight; a same-colour stroke adds thickness on top of bold.
const lines = wrap(a.title, 24, 3)
const fontSize = lines.length >= 3 ? 46 : 56
const lineH = fontSize + 16
const blockH = lines.length * lineH
const y0 = Math.round(258 - blockH / 2 + fontSize * 0.36) // baseline, centred below the logo
const titleSvg = lines
  .map((ln, i) => `<text x="${PAD}" y="${y0 + i * lineH}" font-family="Arial, Helvetica, sans-serif" font-size="${fontSize}" font-weight="800" fill="${textColor}" stroke="${textColor}" stroke-width="1.4" paint-order="stroke" stroke-linejoin="round">${xml(ln)}</text>`)
  .join('')

const svg = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>${pattern}</defs>
  <rect x="0" y="0" width="${W}" height="${H}" rx="${RX}" ry="${RX}" fill="${xml(bg)}"/>
  <rect x="0" y="0" width="${W}" height="${H}" rx="${RX}" ry="${RX}" fill="url(#bgp)"/>
  ${chip}
  ${titleSvg}
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
// Use the ORIGINAL upload, not the `og` size — the og size is a 1200x630 centre
// crop that would distort this wide rounded banner and clip its corners.
const rel = doc?.url || doc?.sizes?.og?.url || ''
const url = rel.startsWith('http') ? rel : `${CMS}${rel}`
console.log(JSON.stringify({ mediaId: doc?.id, url, filename }, null, 2))
