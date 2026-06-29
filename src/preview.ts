/**
 * Shared front-end preview-URL builder.
 *
 * Both the collection "Preview" button (admin.preview) and the editor's
 * "Live Preview" tab (admin.livePreview) must resolve the SAME URL: the doc's
 * own SITE front-end (`site.previewUrl`), not the bare `PREVIEW_URL` env var.
 * Previously the collection buttons used `PREVIEW_URL` directly, so when that env
 * var was unset the button pointed at the CMS host itself and 404'd. This helper
 * centralises the logic; global collections with no site (e.g. credit-cards) fall
 * back to `PREVIEW_URL`.
 */
import type { Payload } from 'payload'

export const PREVIEW_URL = process.env.PREVIEW_URL || ''
export const PREVIEW_SECRET = process.env.PREVIEW_SECRET || ''

const idOf = (v: unknown): number | string | null =>
  v && typeof v === 'object' ? ((v as { id: number | string }).id ?? null) : ((v as number | string) ?? null)

export async function buildPreviewUrl(opts: {
  slug?: string | null
  collection?: string
  site?: unknown
  payload?: Payload | null
}): Promise<string> {
  const { slug, collection } = opts
  if (!slug) return ''

  let base = PREVIEW_URL
  let reviewSlug = 'kreditkort'
  const siteId = idOf(opts.site)
  if (siteId && opts.payload) {
    try {
      const site = await opts.payload.findByID({ collection: 'sites', id: siteId, depth: 0 })
      if (site) {
        base = (site.previewUrl as string) || PREVIEW_URL
        reviewSlug = (site.reviewSlug as string) || reviewSlug
      }
    } catch {
      /* fall back to PREVIEW_URL */
    }
  }
  if (!base) return ''

  const path = collection === 'pages' ? `/${slug}` : `/${reviewSlug}/${slug}`
  return `${base}/api/preview?secret=${PREVIEW_SECRET}&path=${encodeURIComponent(path)}`
}
