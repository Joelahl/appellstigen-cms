import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import path from 'path'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Sites } from './collections/Sites'
import { CreditCards } from './collections/CreditCards'
import { Pages } from './collections/Pages'
import { Reviews } from './collections/Reviews'
import { Authors } from './collections/Authors'
import { Media } from './collections/Media'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const PREVIEW_URL = process.env.PREVIEW_URL || ''
const PREVIEW_SECRET = process.env.PREVIEW_SECRET || ''

// Build the front-end preview URL for a doc in a given collection.
const previewPath = (slug: string | undefined, collection: string | undefined) => {
  if (!slug) return ''
  const path = collection === 'pages' ? `/${slug}` : `/kreditkort/${slug}`
  return `${PREVIEW_URL}/api/preview?secret=${PREVIEW_SECRET}&path=${encodeURIComponent(path)}`
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
      url: ({ data, collectionConfig }) => previewPath(data?.slug, collectionConfig?.slug),
      collections: ['pages', 'credit-cards'],
      breakpoints: [
        { label: 'Mobil', name: 'mobile', width: 390, height: 844 },
        { label: 'Surfplatta', name: 'tablet', width: 768, height: 1024 },
        { label: 'Desktop', name: 'desktop', width: 1440, height: 900 },
      ],
    },
  },
  collections: [Users, Sites, CreditCards, Pages, Reviews, Authors, Media],
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
