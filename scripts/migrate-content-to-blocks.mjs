#!/usr/bin/env node
/**
 * migrate-content-to-blocks.mjs
 *
 * Converts all Pages that have HTML in the `content` field (migrated WordPress
 * content) but no `layout` blocks into a single `html` layout block.
 * After migration, `content` is cleared so the site uses the blocks renderer.
 *
 * Usage (run from the affiliate-cms directory):
 *   CMS_URL=http://localhost:3001 CMS_EMAIL=admin@example.com CMS_PASSWORD=secret \
 *     node scripts/migrate-content-to-blocks.mjs
 *
 * Or against the live CMS:
 *   CMS_URL=https://cms.tacotech.se ...
 *
 * Flags:
 *   --dry-run   Print what would change without writing anything.
 */

const CMS_URL = process.env.CMS_URL || 'http://localhost:3001'
const EMAIL = process.env.CMS_EMAIL
const PASSWORD = process.env.CMS_PASSWORD
const DRY_RUN = process.argv.includes('--dry-run')

if (!EMAIL || !PASSWORD) {
  console.error('Set CMS_EMAIL and CMS_PASSWORD environment variables.')
  process.exit(1)
}

// ── 1. Login ─────────────────────────────────────────────────────────────────
console.log(`Logging in to ${CMS_URL} as ${EMAIL} …`)
const loginRes = await fetch(`${CMS_URL}/api/users/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
})
if (!loginRes.ok) {
  console.error('Login failed:', loginRes.status, await loginRes.text())
  process.exit(1)
}
const { token } = await loginRes.json()
console.log('Logged in. Token acquired.')

const headers = {
  'Content-Type': 'application/json',
  Authorization: `JWT ${token}`,
}

// ── 2. Fetch all pages ────────────────────────────────────────────────────────
let page = 1
let totalPages = 1
const allPages = []

while (page <= totalPages) {
  const res = await fetch(`${CMS_URL}/api/pages?limit=100&page=${page}&depth=0`, { headers })
  const data = await res.json()
  allPages.push(...(data.docs || []))
  totalPages = data.totalPages || 1
  page++
}
console.log(`Fetched ${allPages.length} page(s) total.`)

// ── 3. Filter: has content HTML, layout empty ─────────────────────────────────
const toMigrate = allPages.filter((p) => {
  const hasContent = typeof p.content === 'string' && p.content.trim().length > 0
  const hasLayout = Array.isArray(p.layout) && p.layout.length > 0
  return hasContent && !hasLayout
})

console.log(`${toMigrate.length} page(s) need migration.`)
if (DRY_RUN) console.log('DRY RUN — no changes will be written.\n')

// ── 4. Patch each page ────────────────────────────────────────────────────────
let success = 0
let failed = 0

for (const p of toMigrate) {
  const title = p.title || p.slug || p.id
  const htmlBlock = {
    blockType: 'html',
    html: p.content,
  }

  if (DRY_RUN) {
    console.log(`  [DRY] Would migrate: "${title}" (id: ${p.id}) — ${p.content.length} chars HTML → html block`)
    continue
  }

  const patchRes = await fetch(`${CMS_URL}/api/pages/${p.id}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({
      layout: [htmlBlock],
      content: '',   // clear the raw HTML field
    }),
  })

  if (patchRes.ok) {
    console.log(`  ✓ Migrated: "${title}"`)
    success++
  } else {
    const err = await patchRes.text()
    console.error(`  ✗ Failed:  "${title}" — ${patchRes.status} ${err}`)
    failed++
  }
}

console.log(`\nDone. ${success} migrated, ${failed} failed.${DRY_RUN ? ' (dry run)' : ''}`)
