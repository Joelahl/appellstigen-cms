#!/usr/bin/env node
/**
 * upload.mjs — publish ONE written article into the CMS as a DRAFT.
 *
 * The writer subagent produces an "article file" (JSON) describing the doc;
 * this script resolves the site + any product relation, then upserts a draft
 * into `pages` or `reviews`. Nothing is ever auto-published — a human reviews
 * and publishes it in the Payload admin (that is the quality gate).
 *
 * Article file shape:
 * {
 *   "collection": "pages" | "reviews",
 *   "site": "<domain>",
 *   "queueId": "<row id, for logging>",
 *   "product": { "relationTo": "credit-cards", "slug": "morrow-bank" },  // reviews only
 *   "data": { ...Payload fields for the collection (title, slug, content/body, seo, …) }
 * }
 *
 * Usage:
 *   PAYLOAD_CMS_URL=… PAYLOAD_API_KEY=… node upload.mjs ./article.json
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { env, resolveSite, upsertDraft, resolveBySlug } from './lib.mjs'

const file = process.argv[2]
if (!file) {
  console.error('Usage: node upload.mjs <article.json>')
  process.exit(1)
}

const { CMS } = env()
const article = JSON.parse(readFileSync(file, 'utf8'))
const { collection, site: domain, product, data, queueId } = article

if (!['pages', 'reviews'].includes(collection)) {
  console.error(`Unsupported collection "${collection}" (expected pages|reviews).`)
  process.exit(1)
}
if (!data?.slug) {
  console.error('article.data.slug is required.')
  process.exit(1)
}

const site = await resolveSite(domain)
const doc = { ...data, site: site.id }

// Reviews carry a polymorphic product relation; resolve it by slug.
if (collection === 'reviews' && product?.slug) {
  const value = await resolveBySlug(product.relationTo, product.slug)
  if (!value) {
    console.error(`Could not resolve ${product.relationTo}/${product.slug} for review.`)
    process.exit(1)
  }
  doc.product = { relationTo: product.relationTo, value }
}

const { id, action } = await upsertDraft(collection, { slug: data.slug, siteId: site.id }, doc)

const path = collection === 'pages' ? `/${data.slug}` : `/${site.reviewSlug || 'kreditkort'}/${data.slug}`

// Machine-readable result sidecar so the driver can read the CMS page id and
// report it back to the ops queue (node ops.mjs complete --page <id>).
writeFileSync(`${file}.result.json`, JSON.stringify({ collection, id, slug: data.slug, action, queueId }, null, 2))

console.log(`✓ ${action} draft ${collection}/${data.slug}${queueId ? ` (queue: ${queueId})` : ''}`)
console.log(`  CMS page id:      ${id}`)
console.log(`  Review & publish: ${CMS}/admin/collections/${collection}/${id}`)
if (site.previewUrl) console.log(`  Preview path:     ${site.previewUrl}${path}`)
