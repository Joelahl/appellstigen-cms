#!/usr/bin/env node
/**
 * links.mjs — filter a list of internal-link targets down to the ones that are
 * actually LIVE (published) in the CMS for a given site.
 *
 * The ops queue often hands a plan item internal links to sibling pages that are
 * still later in the queue and therefore not published yet. Linking to them
 * creates dead internal links. Run every candidate path through here first and
 * only give the writer the `live` ones.
 *
 * A path like "/guider/kreditupplysning-uc" is matched against published pages by
 * trying both the full path (minus leading slash) and the last path segment as
 * the page slug. Only a published doc counts as live (no ?draft=true).
 *
 * Usage:
 *   node content-tool/links.mjs --site <cmsSiteId> --paths "/a,/guider/b,/c"
 *   → { "live": ["/a"], "dead": ["/guider/b","/c"] }
 */
import { env } from './lib.mjs'

function args(argv) {
  const o = {}
  for (let i = 0; i < argv.length; i++) if (argv[i].startsWith('--')) o[argv[i].slice(2)] = argv[i + 1]
  return o
}
const a = args(process.argv.slice(2))
if (!a.site || !a.paths) { console.error('Usage: links.mjs --site <id> --paths "/a,/b"'); process.exit(1) }

const { CMS, headers } = env()

async function isLive(path) {
  const clean = path.replace(/^\/+/, '').replace(/\/+$/, '')
  const candidates = [...new Set([clean, clean.split('/').pop()])].filter(Boolean)
  for (const slug of candidates) {
    const q =
      `${CMS}/api/pages?where[slug][equals]=${encodeURIComponent(slug)}` +
      `&where[site][equals]=${encodeURIComponent(a.site)}&depth=0&limit=1`
    const doc = await fetch(q, { headers }).then((r) => r.json()).then((b) => b?.docs?.[0]).catch(() => null)
    // No ?draft=true → the REST API returns only published docs, so a hit = live.
    if (doc && doc._status !== 'draft') return true
  }
  return false
}

const paths = a.paths.split(',').map((s) => s.trim()).filter(Boolean)
const live = []
const dead = []
for (const p of paths) ((await isLive(p)) ? live : dead).push(p)
console.log(JSON.stringify({ live, dead }, null, 2))
