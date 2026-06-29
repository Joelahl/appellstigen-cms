/**
 * lib.mjs — shared helpers for the Content tool.
 *
 * Auth mirrors scripts/seed-content-plan.mjs: a Users API key over REST.
 */
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

// Auto-load affiliate-cms/.env (gitignored) so PAYLOAD_* vars are available to
// every script and to the /content-tool skill without re-exporting. Real
// environment variables take precedence — loadEnvFile only fills what's unset.
try {
  process.loadEnvFile(join(dirname(fileURLToPath(import.meta.url)), '..', '.env'))
} catch {
  /* no .env file — rely on the ambient environment instead */
}

export function env() {
  const CMS = process.env.PAYLOAD_CMS_URL
  const KEY = process.env.PAYLOAD_API_KEY
  if (!CMS || !KEY) {
    console.error('Set PAYLOAD_CMS_URL and PAYLOAD_API_KEY env vars.')
    process.exit(1)
  }
  return {
    CMS,
    KEY,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `users API-Key ${KEY}`,
    },
  }
}

/** Resolve a site by its domain → full Sites doc. Exits if not found. */
export async function resolveSite(domain) {
  const { CMS, headers } = env()
  const q = `${CMS}/api/sites?where[domain][equals]=${encodeURIComponent(domain)}&depth=1&limit=1`
  const res = await fetch(q, { headers })
  const body = await res.json().catch(() => ({}))
  const site = body?.docs?.[0]
  if (!res.ok || !site) {
    console.error(`Could not resolve site for domain "${domain}" (${res.status}).`)
    process.exit(1)
  }
  return site
}

/**
 * Upsert a draft doc into a collection, scoped by slug + site so re-runs update
 * rather than duplicate. Creates with _status: 'draft' so it lands in the CMS
 * draft queue for human review/publish. Returns { id, action }.
 */
export async function upsertDraft(collection, { slug, siteId }, data) {
  const { CMS, headers } = env()
  const where =
    `where[slug][equals]=${encodeURIComponent(slug)}` +
    (siteId != null ? `&where[site][equals]=${encodeURIComponent(siteId)}` : '')
  const found = await fetch(`${CMS}/api/${collection}?${where}&limit=1&draft=true`, { headers })
    .then((r) => r.json())
    .then((b) => b?.docs?.[0])

  const payload = { ...data, _status: 'draft' }
  const res = found
    ? await fetch(`${CMS}/api/${collection}/${found.id}?draft=true`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(payload),
      })
    : await fetch(`${CMS}/api/${collection}?draft=true`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      })

  const body = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(`${collection}/${slug}: ${res.status} ${JSON.stringify(body).slice(0, 400)}`)
  }
  return { id: body?.doc?.id ?? found?.id, action: found ? 'updated' : 'created' }
}

/** Resolve a related doc id by slug (e.g. a credit-card product). */
export async function resolveBySlug(collection, slug) {
  const { CMS, headers } = env()
  const body = await fetch(
    `${CMS}/api/${collection}?where[slug][equals]=${encodeURIComponent(slug)}&limit=1`,
    { headers },
  ).then((r) => r.json())
  return body?.docs?.[0]?.id ?? null
}
