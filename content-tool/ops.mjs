#!/usr/bin/env node
/**
 * ops.mjs — the driver's client for the ops dashboard's content-tool endpoints.
 *
 * The ops content_plan (at ops.tacotech.se) is the single source of truth for
 * the queue. This talks to its bearer-protected API so the Claude Code driver
 * never needs direct DB access.
 *
 * Env (from affiliate-cms/.env, auto-loaded):
 *   OPS_URL             e.g. https://ops.tacotech.se
 *   CONTENT_TOOL_TOKEN  matches CONTENT_TOOL_TOKEN on the dashboard
 *
 * Usage:
 *   node content-tool/ops.mjs queue --site <cmsSiteId> [--status pending] [--limit 10] [--item <planItemId>]
 *   node content-tool/ops.mjs complete --item <id> --page <cmsPageId> [--site <id>] [--title "..."] [--status published]
 */
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

try {
  process.loadEnvFile(join(dirname(fileURLToPath(import.meta.url)), '..', '.env'))
} catch {
  /* rely on ambient env */
}

function env() {
  const OPS_URL = process.env.OPS_URL
  const TOKEN = process.env.CONTENT_TOOL_TOKEN
  if (!OPS_URL || !TOKEN) {
    console.error('Set OPS_URL and CONTENT_TOOL_TOKEN (in affiliate-cms/.env).')
    process.exit(1)
  }
  return { OPS_URL: OPS_URL.replace(/\/$/, ''), TOKEN }
}

/** Minimal --flag value parser. */
function args(argv) {
  const o = {}
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) o[argv[i].slice(2)] = argv[i + 1]
  }
  return o
}

const [cmd, ...rest] = process.argv.slice(2)
const a = args(rest)
const { OPS_URL, TOKEN } = env()
const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${TOKEN}` }

if (cmd === 'queue') {
  if (!a.site) { console.error('--site <cmsSiteId> required'); process.exit(1) }
  const qs = new URLSearchParams({ siteId: a.site, status: a.status || 'pending', limit: a.limit || '10' })
  if (a.item) qs.set('itemId', a.item) // target ONE specific plan item (any status)
  const res = await fetch(`${OPS_URL}/api/content-tool/queue?${qs}`, { headers })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) { console.error(`queue: ${res.status} ${JSON.stringify(body).slice(0, 300)}`); process.exit(1) }
  console.log(JSON.stringify(body, null, 2))
} else if (cmd === 'complete') {
  if (!a.item) { console.error('--item <id> required'); process.exit(1) }
  const payload = {
    itemId: Number(a.item),
    pageId: a.page != null ? Number(a.page) : null,
    status: a.status || 'published',
    siteId: a.site != null ? Number(a.site) : undefined,
    title: a.title,
  }
  const res = await fetch(`${OPS_URL}/api/content-tool/complete`, {
    method: 'POST', headers, body: JSON.stringify(payload),
  })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) { console.error(`complete: ${res.status} ${JSON.stringify(body).slice(0, 300)}`); process.exit(1) }
  console.log(`✓ ops item ${payload.itemId} → ${payload.status}${payload.pageId ? ` (page ${payload.pageId})` : ''}`)
} else {
  console.error('Usage: ops.mjs queue --site <id> [--status briefed] | ops.mjs complete --item <id> --page <id>')
  process.exit(1)
}
