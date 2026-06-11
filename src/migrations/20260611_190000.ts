import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

/**
 * Seed affiliate-links for every card's /till/<slug> (placeholder target
 * https://kortio.se/ for now) so the live card CTAs resolve instead of 404ing.
 * Idempotent: skips slugs that already exist for the site.
 */
const SLUGS = [
  'amex-blue-cashback', 'bank-norwegian-kreditkort', 'binance-review', 'circle-k-mastercard',
  'coop', 'curve-metal', 'ecster', 'ica-bankkort', 'komplett-bank-mastercard', 'lunar-review',
  'marginalen-gold', 'marginalen-traveller', 'midnight-blue', 'moregolf-mastercard', 'morrow-bank',
  'mynt', 'okq8-kreditkort', 'pfc-review', 'preem-mastercard', 'qred', 'quickbit', 'refunder',
  'remember-flex', 'resurs-classic-review', 'resurs-gold', 'resurs-world', 'revolut',
  'revolut-business', 'rocker-review', 'ruby-steel', 'steven',
]

const TARGET = 'https://kortio.se/'
const humanize = (s: string) =>
  s.split('-').map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w)).join(' ')

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  const sites = await payload.find({ collection: 'sites', limit: 1, overrideAccess: true })
  const siteId = (sites.docs[0] as { id?: string | number })?.id
  if (!siteId) {
    payload.logger.warn('[190000] No site found — skipping affiliate-link seed.')
    return
  }

  let created = 0
  for (const slug of SLUGS) {
    const existing = await payload.find({
      collection: 'affiliate-links',
      where: { and: [{ slug: { equals: slug } }, { site: { equals: siteId } }] },
      limit: 1,
      overrideAccess: true,
    })
    if (existing.docs.length) continue
    await payload.create({
      collection: 'affiliate-links',
      data: { label: humanize(slug), slug, targetUrl: TARGET, active: true, site: siteId },
      overrideAccess: true,
    })
    created++
  }
  payload.logger.info(`[190000] Seeded ${created} affiliate-link(s).`)
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  for (const slug of SLUGS) {
    await payload.delete({
      collection: 'affiliate-links',
      where: { and: [{ slug: { equals: slug } }, { targetUrl: { equals: TARGET } }] },
      overrideAccess: true,
    })
  }
}
