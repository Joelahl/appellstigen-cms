import type { CollectionConfig } from 'payload'
import { layoutBlocks } from '../blocks'

/**
 * Pages — editorial pages for a site (homepage copy, category landing pages,
 * about, legal, etc.). Content migrated from WordPress is stored as HTML.
 */
export const Pages: CollectionConfig = {
  slug: 'pages',
  versions: {
    drafts: {
      autosave: { interval: 375 },
    },
    maxPerDoc: 20,
  },
  access: {
    read: () => true,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'pageType', 'site', '_status'],
    description: 'Sidor — startsida, kategorisidor, om oss, juridiskt m.m.',
    preview: (doc) =>
      doc?.slug
        ? `${process.env.PREVIEW_URL || ''}/api/preview?secret=${process.env.PREVIEW_SECRET || ''}&path=/${doc.slug}`
        : null,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Titel',
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      index: true,
      label: 'Slug (URL)',
      admin: { description: 'e.g. kreditkort-med-bonus' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'pageType',
          type: 'select',
          defaultValue: 'info',
          label: 'Sidtyp',
          options: [
            { label: 'Startsida', value: 'homepage' },
            { label: 'Kategorisida', value: 'category' },
            { label: 'Informationssida', value: 'info' },
            { label: 'Juridisk', value: 'legal' },
            { label: 'Övrig', value: 'other' },
          ],
          admin: { width: '33%' },
        },
        {
          name: 'menuOrder',
          type: 'number',
          label: 'Ordning',
          defaultValue: 0,
          admin: { width: '33%' },
        },
      ],
    },
    {
      name: 'site',
      type: 'relationship',
      relationTo: 'sites',
      label: 'Sajt',
      admin: { position: 'sidebar' },
    },
    {
      name: 'excerpt',
      type: 'textarea',
      label: 'Ingress / utdrag',
    },
    {
      name: 'layout',
      type: 'blocks',
      label: 'Sidlayout (block)',
      blocks: layoutBlocks,
      admin: {
        description:
          'Bygg sidan med block. Om tomt används det migrerade HTML-innehållet nedan.',
      },
    },
    {
      name: 'content',
      type: 'textarea',
      label: 'Innehåll (HTML — migrerat, fallback)',
      maxLength: 500000,
      admin: {
        description: 'Migrerat HTML-innehåll. Används om Sidlayout är tom.',
        rows: 18,
      },
    },
    {
      name: 'seo',
      type: 'group',
      label: 'SEO',
      fields: [
        { name: 'metaTitle', type: 'text', label: 'Meta Title' },
        { name: 'metaDescription', type: 'textarea', label: 'Meta Description' },
        { name: 'ogImageUrl', type: 'text', label: 'OG Image — URL' },
      ],
    },
    {
      name: 'source',
      type: 'group',
      label: 'Källa',
      admin: { position: 'sidebar' },
      fields: [
        { name: 'sourceUrl', type: 'text', label: 'Käll-URL' },
        { name: 'wpId', type: 'number', label: 'WordPress ID' },
      ],
    },
  ],
}
