#!/usr/bin/env node
/**
 * seed-content-plan.mjs — seed the SEO content plan (topic-clusters + content-plan
 * items) for the platform's sites via the Payload REST API.
 *
 * Usage:
 *   PAYLOAD_CMS_URL=https://cms.tacotech.se \
 *   PAYLOAD_API_KEY=<users api key> \
 *   node scripts/seed-content-plan.mjs            # seeds all data files
 *   node scripts/seed-content-plan.mjs insfind    # seeds one (by file basename)
 *
 * Idempotent: upserts by `slug` (PATCH if found, else POST). Clusters are seeded
 * first so items can resolve their cluster relationship by slug. Requires the
 * topic-clusters + content-plan collections to be deployed to the target CMS.
 */
import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, basename } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_DIR = join(__dirname, 'seed-data')

const CMS = process.env.PAYLOAD_CMS_URL
const KEY = process.env.PAYLOAD_API_KEY
if (!CMS || !KEY) {
  console.error('Set PAYLOAD_CMS_URL and PAYLOAD_API_KEY env vars.')
  process.exit(1)
}

const headers = {
  'Content-Type': 'application/json',
  Authorization: `users API-Key ${KEY}`,
}

/** Upsert one doc into a collection by its unique `slug`; returns the doc id. */
async function upsert(collection, slug, doc) {
  const q = `${CMS}/api/${collection}?where[slug][equals]=${encodeURIComponent(slug)}&limit=1`
  const existing = await fetch(q, { headers }).then((r) => r.json())
  const found = existing?.docs?.[0]

  const res = found
    ? await fetch(`${CMS}/api/${collection}/${found.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(doc),
      })
    : await fetch(`${CMS}/api/${collection}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(doc),
      })

  const body = await res.json().catch(() => ({}))
  if (!res.ok) {
    console.error(`  ✗ ${collection}/${slug}: ${res.status} ${JSON.stringify(body).slice(0, 300)}`)
    return null
  }
  console.log(`  ${found ? '↻ updated' : '＋ created'} ${collection}/${slug}`)
  return body?.doc?.id ?? found?.id ?? null
}

async function seedFile(file) {
  const data = JSON.parse(readFileSync(file, 'utf8'))
  console.log(`\n▶ ${data.siteName} (site ${data.siteId}) — ${basename(file)}`)

  // 1) Clusters first → build slug→id map for item relationships.
  const clusterId = {}
  for (const c of data.clusters) {
    const id = await upsert('topic-clusters', c.slug, {
      name: c.name,
      slug: c.slug,
      site: data.siteId,
      description: c.description,
      pillarKeyword: c.pillarKeyword,
      priority: c.priority,
      status: c.status,
    })
    if (id) clusterId[c.slug] = id
  }

  // 2) Content-plan items, linked to their cluster.
  for (const it of data.items) {
    await upsert('content-plan', it.slug, {
      title: it.title,
      slug: it.slug,
      site: data.siteId,
      cluster: it.clusterSlug ? clusterId[it.clusterSlug] ?? null : null,
      primaryKeyword: it.primaryKeyword,
      secondaryKeywords: (it.secondaryKeywords || []).map((keyword) => ({ keyword })),
      searchIntent: it.searchIntent,
      funnelStage: it.funnelStage,
      contentType: it.contentType,
      targetSlug: it.targetSlug,
      priority: it.priority,
      status: it.status,
    })
  }
}

const arg = process.argv[2]
const files = readdirSync(DATA_DIR)
  .filter((f) => f.endsWith('.json'))
  .filter((f) => !arg || basename(f, '.json') === arg)
  .map((f) => join(DATA_DIR, f))

if (files.length === 0) {
  console.error(`No data files matched${arg ? ` "${arg}"` : ''} in ${DATA_DIR}`)
  process.exit(1)
}

console.log(`Seeding content plan → ${CMS}`)
for (const f of files) await seedFile(f)
console.log('\nDone.')
