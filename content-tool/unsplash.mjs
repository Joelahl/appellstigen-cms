#!/usr/bin/env node
/**
 * unsplash.mjs — fetch a free editorial photo from Unsplash for a NEWS/GUIDE
 * thumbnail, rehost it into the CMS Media library, and print its public URL.
 *
 * Real photography suits editorial pages (news, guides) better than the branded
 * banner (image.mjs), and matches how the front-end homepage/sidebar render their
 * thumbnails from `seo.ogImageUrl`. Category pages keep image.mjs.
 *
 * We rehost (download → upload to Payload Media) rather than hotlink so the image
 * is self-hosted on the CMS (durable, and the only image host the front-end allows
 * in next.config remotePatterns). The Unsplash "download" event is triggered per
 * their API guidelines, and the photographer credit is printed for attribution.
 *
 * Env (affiliate-cms/.env, auto-loaded via lib.mjs):
 *   UNSPLASH_ACCESS_KEY  (free: https://unsplash.com/developers)
 *   PAYLOAD_CMS_URL, PAYLOAD_API_KEY
 *
 * Usage:
 *   node content-tool/unsplash.mjs --query "online casino bonus" --title "<article title>" --slug "<slug>"
 *
 * Exit codes: 0 ok · 1 bad args/upload · 2 no API key (caller falls back to
 * image.mjs) · 3 no matching photo (caller falls back to image.mjs).
 */
import { env } from './lib.mjs'

function args(argv) {
  const o = {}
  for (let i = 0; i < argv.length; i++) if (argv[i].startsWith('--')) o[argv[i].slice(2)] = argv[i + 1]
  return o
}
const a = args(process.argv.slice(2))

const ACCESS = process.env.UNSPLASH_ACCESS_KEY
if (!ACCESS) {
  console.error('UNSPLASH_ACCESS_KEY missing in affiliate-cms/.env — skip Unsplash, use image.mjs banner instead.')
  process.exit(2)
}

const query = a.query || a.title
if (!query) {
  console.error('Usage: unsplash.mjs --query "<english keywords>" [--title "<alt>"] [--slug ...]')
  process.exit(1)
}

const { CMS, KEY } = env()
const uHeaders = { Authorization: `Client-ID ${ACCESS}`, 'Accept-Version': 'v1' }

// 1) Search — landscape, family-safe; pull a handful so we can vary the pick.
const search = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}` +
  `&orientation=${a.orientation || 'landscape'}&content_filter=high&per_page=12`
const sr = await fetch(search, { headers: uHeaders }).then((r) => r.json()).catch(() => null)
const results = (sr && sr.results) || []
if (!results.length) {
  console.error(`No Unsplash results for "${query}".`)
  process.exit(3)
}

// Pick at random among the top matches so similar topics don't share one photo.
const photo = results[Math.floor(Math.random() * Math.min(results.length, 6))]

// 2) Trigger the Unsplash download event (required by their API guidelines).
try {
  if (photo.links?.download_location) await fetch(photo.links.download_location, { headers: uHeaders })
} catch { /* best effort — never block on attribution telemetry */ }

// 3) Download an OG-sized (1200x630) JPG via Unsplash's dynamic image params.
const imgUrl = `${photo.urls.raw}&w=1200&h=630&fit=crop&crop=entropy&fm=jpg&q=80`
const buf = Buffer.from(await fetch(imgUrl).then((r) => r.arrayBuffer()))

// 4) Upload to Payload Media (multipart — don't set Content-Type; fetch sets the boundary).
const credit = `Foto: ${photo.user?.name || 'Unsplash'} / Unsplash`
const filename = `news-${(a.slug || 'artikel').replace(/[^a-z0-9-]/gi, '-').slice(0, 40)}-${Date.now().toString(36)}.jpg`
const fd = new FormData()
fd.append('file', new Blob([buf], { type: 'image/jpeg' }), filename)
fd.append('alt', a.title || query)

const res = await fetch(`${CMS}/api/media`, { method: 'POST', headers: { Authorization: `users API-Key ${KEY}` }, body: fd })
const body = await res.json().catch(() => ({}))
if (!res.ok) {
  console.error(`media upload: ${res.status} ${JSON.stringify(body).slice(0, 400)}`)
  process.exit(1)
}

const doc = body?.doc ?? body
const rel = doc?.url || ''
const url = rel.startsWith('http') ? rel : `${CMS}${rel}`
console.log(JSON.stringify({
  mediaId: doc?.id,
  url,
  filename,
  credit,
  photographer: photo.user?.name,
  unsplashUrl: photo.links?.html,
}, null, 2))
