import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

/**
 * Bump stale year references (2025 → 2026) in page content, title, excerpt and
 * SEO fields so all copy reads as current. Only pages contained 2025 (cards,
 * authors, sites, reviews scanned clean); no 2024 references exist.
 */
const fix = (s: unknown): string => (typeof s === 'string' ? s.replace(/2025/g, '2026') : (s as string))

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  const pages = await payload.find({ collection: 'pages', limit: 1000, pagination: false, overrideAccess: true })
  let changed = 0
  for (const p of pages.docs as Array<Record<string, unknown>>) {
    const data: Record<string, unknown> = {}
    for (const f of ['content', 'title', 'excerpt'] as const) {
      if (typeof p[f] === 'string' && (p[f] as string).includes('2025')) data[f] = fix(p[f])
    }
    const seo = (p.seo as Record<string, unknown>) || {}
    const seoOut: Record<string, unknown> = {}
    let seoChanged = false
    for (const k of ['metaTitle', 'metaDescription', 'ogImageUrl'] as const) {
      if (typeof seo[k] === 'string' && (seo[k] as string).includes('2025')) {
        seoOut[k] = fix(seo[k]); seoChanged = true
      }
    }
    if (seoChanged) data.seo = { ...seo, ...seoOut }
    if (Object.keys(data).length) {
      await payload.update({ collection: 'pages', id: p.id as string, data, overrideAccess: true })
      changed++
    }
  }
  payload.logger.info(`[210000] Updated stale year refs on ${changed} page(s).`)
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // Year text is not restored on rollback.
}
