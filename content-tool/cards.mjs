#!/usr/bin/env node
/**
 * cards.mjs — map a list of card names/slugs to existing CreditCard ids so a
 * category page's `toplistCards` can be populated (drives the native card grid +
 * comparison table on the front-end).
 *
 * The CreditCards library is the single source of factual product data. We NEVER
 * invent product records for a YMYL finance site — so this only returns cards
 * that already exist. Anything it can't match is reported as `unmatched` for a
 * human to create in the CMS first.
 *
 * Usage:
 *   node content-tool/cards.mjs --names "GF Card,Ferratum,Bank Norwegian"
 *   → { "matched": [{ input, id, slug, cardName }], "unmatched": ["GF Card", ...] }
 */
import { env } from './lib.mjs'

function args(argv) {
  const o = {}
  for (let i = 0; i < argv.length; i++) if (argv[i].startsWith('--')) o[argv[i].slice(2)] = argv[i + 1]
  return o
}
const a = args(process.argv.slice(2))
if (!a.names) { console.error('Usage: cards.mjs --names "GF Card,Ferratum"'); process.exit(1) }

const { CMS, headers } = env()

const slugify = (s) =>
  String(s)
    .toLowerCase()
    .replace(/[åä]/g, 'a').replace(/ö/g, 'o').replace(/é/g, 'e').replace(/ü/g, 'u')
    .normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

const all = await fetch(`${CMS}/api/credit-cards?limit=300&depth=0`, { headers })
  .then((r) => r.json()).then((b) => b?.docs || []).catch(() => [])

const lib = all.map((d) => ({ id: d.id, slug: d.slug || '', cardName: d.cardName || '', s: slugify(d.cardName || d.slug || '') }))

function findCard(input) {
  const q = slugify(input)
  if (!q) return null
  // exact slug / slugified-name, then containment either direction.
  return (
    lib.find((c) => c.slug === input || c.slug === q || c.s === q) ||
    lib.find((c) => c.slug.includes(q) || q.includes(c.slug) || c.s.includes(q) || q.includes(c.s)) ||
    null
  )
}

const names = a.names.split(',').map((s) => s.trim()).filter(Boolean)
const matched = []
const unmatched = []
const seen = new Set()
for (const n of names) {
  const c = findCard(n)
  if (c && !seen.has(c.id)) { matched.push({ input: n, id: c.id, slug: c.slug, cardName: c.cardName }); seen.add(c.id) }
  else if (!c) unmatched.push(n)
}
console.log(JSON.stringify({ matched, unmatched }, null, 2))
