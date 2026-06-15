import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import path from 'path'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Sites } from './collections/Sites'
import { CreditCards } from './collections/CreditCards'
import { Insurances } from './collections/Insurances'
import { Pages } from './collections/Pages'
import { Reviews } from './collections/Reviews'
import { Authors } from './collections/Authors'
import { Media } from './collections/Media'
import { AffiliateLinks } from './collections/AffiliateLinks'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const PREVIEW_URL = process.env.PREVIEW_URL || ''
const PREVIEW_SECRET = process.env.PREVIEW_SECRET || ''

// Build the front-end preview URL for a doc in a given collection.
/**
 * Resolve a doc's live-preview URL, SCOPED TO ITS SITE so each site previews on
 * its own app (no cross-site content mixing). Pages carry a `site`; credit-cards
 * are global, so we use their first associated site (or the default PREVIEW_URL).
 * Async: looks up the site's previewUrl + reviewSlug.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const resolvePreviewUrl = async ({ data, collectionConfig, req }: any): Promise<string> => {
  const slug = data?.slug
  if (!slug) return ''
  const coll = collectionConfig?.slug
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const idOf = (v: any) => (v && typeof v === 'object' ? v.id : v)
  const siteId = coll === 'pages' ? idOf(data?.site) : idOf((data?.sites || [])[0])

  let base = PREVIEW_URL
  let reviewSlug = 'kreditkort'
  const payload = req?.payload
  if (siteId && payload) {
    try {
      const site = await payload.findByID({ collection: 'sites', id: siteId, depth: 0 })
      if (site) {
        base = (site.previewUrl as string) || PREVIEW_URL
        reviewSlug = (site.reviewSlug as string) || reviewSlug
      }
    } catch {
      /* fall back to PREVIEW_URL */
    }
  }
  const path = coll === 'pages' ? `/${slug}` : `/${reviewSlug}/${slug}`
  return `${base}/api/preview?secret=${PREVIEW_SECRET}&path=${encodeURIComponent(path)}`
}

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      beforeDashboard: ['/components/admin/SitesDashboard#default'],
    },
    livePreview: {
      url: resolvePreviewUrl,
      collections: ['pages', 'credit-cards'],
      breakpoints: [
        { label: 'Mobil', name: 'mobile', width: 390, height: 844 },
        { label: 'Surfplatta', name: 'tablet', width: 768, height: 1024 },
        { label: 'Desktop', name: 'desktop', width: 1440, height: 900 },
      ],
    },
  },
  collections: [Users, Sites, CreditCards, Insurances, Pages, Reviews, Authors, Media, AffiliateLinks],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
    // Set PAYLOAD_DB_PUSH=true on first deploy to auto-create schema.
    // Set to false (or remove) once migrations exist.
    push: process.env.PAYLOAD_DB_PUSH === 'true',
  }),
  sharp,
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || '',
  cors: [process.env.NEXT_PUBLIC_SERVER_URL || '', PREVIEW_URL].filter(Boolean),
  csrf: [process.env.NEXT_PUBLIC_SERVER_URL || '', PREVIEW_URL].filter(Boolean),
})
