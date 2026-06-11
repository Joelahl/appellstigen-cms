import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

/**
 * SEO content polish:
 *  - Decode HTML entities (e.g. &#187;, &#8211;) in plain-text SEO/title/excerpt
 *    fields. They render fine inside HTML body but show literally ("&#187;") in
 *    <title>/<meta> attributes — garbling the SERP snippet.
 *  - Add a meta description to Användarvillkor (it had none).
 */
const NAMED: Record<string, string> = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
  raquo: '»', laquo: '«', ndash: '–', mdash: '—', hellip: '…',
  rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“',
}
function decodeEntities(s: string): string {
  return s
    .replace(/&#x([0-9a-fA-F]+);/g, (_m, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_m, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&([a-zA-Z]+);/g, (m, n) => NAMED[n] ?? m)
}

const ANV_DESC =
  'Läs användarvillkoren för Bästkreditkort.nu — villkoren för hur du får använda vår jämförelsetjänst och vårt innehåll.'

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  const pages = await payload.find({ collection: 'pages', limit: 1000, pagination: false, overrideAccess: true })
  let changed = 0
  for (const p of pages.docs as Array<Record<string, unknown>>) {
    const data: Record<string, unknown> = {}
    for (const f of ['title', 'excerpt'] as const) {
      const v = p[f]
      if (typeof v === 'string' && /&#?\w+;/.test(v)) data[f] = decodeEntities(v)
    }
    const seo = (p.seo as Record<string, unknown>) || {}
    const seoOut: Record<string, unknown> = {}
    let seoChanged = false
    for (const k of ['metaTitle', 'metaDescription'] as const) {
      const v = seo[k]
      if (typeof v === 'string' && /&#?\w+;/.test(v)) { seoOut[k] = decodeEntities(v); seoChanged = true }
    }
    // Fill missing description on Användarvillkor.
    if (p.slug === 'anvandarvillkor' && !seo.metaDescription) {
      seoOut.metaDescription = ANV_DESC; seoChanged = true
    }
    if (seoChanged) data.seo = { ...seo, ...seoOut }
    if (Object.keys(data).length) {
      await payload.update({ collection: 'pages', id: p.id as string, data, overrideAccess: true })
      changed++
    }
  }
  payload.logger.info(`[20260612_090000] SEO-cleaned ${changed} page(s).`)
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // Text normalization is not reverted.
}
