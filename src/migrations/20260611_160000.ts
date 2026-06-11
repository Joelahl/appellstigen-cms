import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

/**
 * Data migration: clean dead internal links in migrated WordPress content.
 *
 * Unlinks anchors in pages.content and credit-cards.reviewContent that point to
 * internal pages which don't exist (e.g. /gratis-kreditkort, /bensinkort,
 * /debetkort …) — replacing the <a> with its inner text. Absolute self-links to
 * pages that DO exist are converted to relative paths. Affiliate links (/till/…)
 * and external links are left untouched.
 *
 * Validated against live content: 15 dead links across 2 pages + 11 cards.
 */

const OWN = [
  /^https?:\/\/(www\.)?xn--bstkreditkort-bfb\.nu/i,
  /^https?:\/\/(www\.)?bästkreditkort\.nu/i,
]

function norm(p: string): string {
  p = p.split('#')[0].split('?')[0]
  if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1)
  return p || '/'
}

function makeRewriter(validPaths: Set<string>) {
  return (html: string | null | undefined): string => {
    if (!html) return html ?? ''
    return html.replace(
      /<a\b[^>]*?href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi,
      (full: string, href: string, inner: string) => {
        const h = href.replace(/&amp;/g, '&')
        // Affiliate links — leave untouched.
        if (h.includes('/till/')) return full
        let path: string | null = null
        let wasAbs = false
        for (const re of OWN) {
          if (re.test(h)) {
            path = h.replace(re, '') || '/'
            wasAbs = true
            break
          }
        }
        if (path === null) {
          if (h.startsWith('/') && !h.startsWith('//')) path = h
          else return full // external link
        }
        const np = norm(path)
        if (validPaths.has(np)) {
          // Existing page: relativise absolute self-links, leave relatives as-is.
          return wasAbs ? full.replace(`"${href}"`, `"${np}"`) : full
        }
        // Dead internal link → unlink (keep the inner text/markup).
        return inner
      },
    )
  }
}

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  const [pages, cards, sites] = await Promise.all([
    payload.find({ collection: 'pages', limit: 1000, depth: 0, overrideAccess: true, pagination: false }),
    payload.find({ collection: 'credit-cards', limit: 1000, depth: 0, overrideAccess: true, pagination: false }),
    payload.find({ collection: 'sites', limit: 1, depth: 0, overrideAccess: true }),
  ])

  const reviewSlug = (sites.docs[0] as { reviewSlug?: string })?.reviewSlug || 'kreditkort'
  const validPaths = new Set<string>(['/'])
  for (const p of pages.docs as Array<{ slug?: string; pageType?: string }>) {
    if (p.slug) validPaths.add(p.pageType === 'homepage' ? '/' : `/${p.slug}`)
  }
  for (const c of cards.docs as Array<{ slug?: string }>) {
    if (c.slug) validPaths.add(`/${reviewSlug}/${c.slug}`)
  }

  const rewrite = makeRewriter(validPaths)

  let changed = 0
  for (const p of pages.docs as Array<{ id: string | number; content?: string }>) {
    const nc = rewrite(p.content)
    if (nc !== (p.content ?? '')) {
      await payload.update({ collection: 'pages', id: p.id, data: { content: nc }, overrideAccess: true })
      changed++
    }
  }
  for (const c of cards.docs as Array<{ id: string | number; reviewContent?: string }>) {
    const nc = rewrite(c.reviewContent)
    if (nc !== (c.reviewContent ?? '')) {
      await payload.update({ collection: 'credit-cards', id: c.id, data: { reviewContent: nc }, overrideAccess: true })
      changed++
    }
  }
  payload.logger.info(`[20260611_160000] Cleaned dead links in ${changed} document(s).`)
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // Data migration — original link markup is not restored on rollback.
}
