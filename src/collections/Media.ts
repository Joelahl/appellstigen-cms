import type { CollectionConfig } from 'payload'
import path from 'path'
import { fileURLToPath } from 'url'

const dirname = path.dirname(fileURLToPath(import.meta.url))

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    // Uploaded files must be publicly readable so front-end sites can display them.
    read: () => true,
  },
  admin: {
    useAsTitle: 'filename',
  },
  upload: {
    // Persisted via a mounted volume in production (PAYLOAD_MEDIA_DIR=/app/media).
    // Falls back to repo-local public/media for local dev.
    staticDir: process.env.PAYLOAD_MEDIA_DIR || path.resolve(dirname, '../../public/media'),
    imageSizes: [
      { name: 'thumbnail', width: 400, height: 300, position: 'centre' },
      { name: 'card', width: 800, height: 600, position: 'centre' },
      { name: 'og', width: 1200, height: 630, position: 'centre' },
    ],
    adminThumbnail: 'thumbnail',
    mimeTypes: ['image/*'],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      label: 'Alt Text',
    },
  ],
}
