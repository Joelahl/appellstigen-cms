#!/usr/bin/env node
/**
 * freshness.mjs — driver for the lightweight content-freshness loop.
 *
 * v1 flow (run from Claude Code on the Max plan):
 *   queue   → list a site's STALE pages (updatedAt older than the SLA) + content
 *   publish → PATCH a refreshed page back to the CMS as published (bumps updatedAt)
 *   complete→ log the refresh to the ops dashboard (Färskhet + Aktivitetslogg)
 *
 * Staleness uses each CMS page's updatedAt (== sitemap lastmod source).
 * Auto-publishes live — keep edits small/conservative (v1).
 *
 * Env (affiliate-cms/.env, auto-loaded via lib.mjs):
 *   PAYLOAD_CMS_URL, PAYLOAD_API_KEY   (read + publish pages)
 *   OPS_URL, CONTENT_TOOL_TOKEN        (log runs)
 *
 * Usage:
 *   node content-tool/freshness.mjs queue   --site <cmsSiteId> [--max-age 30]
 *   node content-tool/freshness.mjs publish ./page.json
 *   node content-tool/freshness.mjs complete --site <id> --page <id> --title "..." --slug "..." --summary "..."
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { env } from './lib.mjs'

const SLA_DEFAULT = 30

function opsEnv() {
  const OPS_URL = process.env.OPS_URL
  const TOKEN = process.env.CONTENT_TOOL_TOKEN
  if (!OPS_URL || !TOKEN) {
    console.error('Set OPS_URL and CONTENT_TOOL_TOKEN (in affiliate-cms/.env).')
    process.exit(1)
  }
  return { OPS_URL: OPS_URL.replace(/\/$/, ''), TOKEN }
}

function args(argv) {
  const o = {}
  for (let i = 0; i < argv.length; i++) if (argv[i].startsWith('--')) o[argv[i].slice(2)] = argv[i + 1]
  return o
}

const ageDays = (iso) => Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000)

const [cmd, ...rest] = process.argv.slice(2)
const a = args(rest)

if (cmd === 'queue') {
  if (!a.site) { console.error('--site <cmsSiteId> required'); process.exit(1) }
  const { CMS, headers } = env()
  const maxAge = Number(a['max-age']) || SLA_DEFAULT

  const site = await fetch(`${CMS}/api/sites/${a.site}?depth=0`, { headers }).then((r) => r.json())
  const pages = await fetch(
    `${CMS}/api/pages?where[site][equals]=${a.site}&limit=200&depth=0&sort=updatedAt`,
    { headers },
  ).then((r) => r.json())

  const stale = (pages?.docs || [])
    .map((p) => ({ id: p.id, title: p.title, slug: p.slug, updatedAt: p.updatedAt, ageDays: ageDays(p.updatedAt), content: p.content }))
    .filter((p) => p.ageDays > maxAge)
    .sort((x, y) => y.ageDays - x.ageDays)

  console.log(JSON.stringify({
    site: { id: site?.id, name: site?.name, domain: site?.domain, locale: site?.locale },
    slaDays: maxAge,
    count: stale.length,
    items: stale,
  }, null, 2))
} else if (cmd === 'publish') {
  // Refreshed page file: { "pageId": <id>, "content": "<HTML>", "summary"?: "..." }
  const file = rest[0]
  if (!file) { console.error('Usage: freshness.mjs publish <page.json>'); process.exit(1) }
  const { CMS, headers } = env()
  const page = JSON.parse(readFileSync(file, 'utf8'))
  if (!page.pageId || !page.content) { console.error('page.json needs pageId + content'); process.exit(1) }

  const res = await fetch(`${CMS}/api/pages/${page.pageId}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ content: page.content, _status: 'published' }),
  })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) { console.error(`publish ${page.pageId}: ${res.status} ${JSON.stringify(body).slice(0, 300)}`); process.exit(1) }
  writeFileSync(`${file}.result.json`, JSON.stringify({ pageId: page.pageId, updatedAt: body?.doc?.updatedAt }, null, 2))
  console.log(`✓ republished page ${page.pageId} (updatedAt ${body?.doc?.updatedAt})`)
} else if (cmd === 'complete') {
  if (!a.site || !a.page) { console.error('--site and --page required'); process.exit(1) }
  const { OPS_URL, TOKEN } = opsEnv()
  const res = await fetch(`${OPS_URL}/api/freshness/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${TOKEN}` },
    body: JSON.stringify({ siteId: Number(a.site), pageId: Number(a.page), title: a.title, slug: a.slug, summary: a.summary }),
  })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) { console.error(`complete: ${res.status} ${JSON.stringify(body).slice(0, 300)}`); process.exit(1) }
  console.log(`✓ logged freshness run for page ${a.page}`)
} else {
  console.error('Usage: freshness.mjs queue --site <id> [--max-age 30] | publish <file> | complete --site <id> --page <id>')
  process.exit(1)
}
