import type { CollectionConfig } from 'payload'

/**
 * Reviews — site-unique editorial reviews of a (global) credit card.
 *
 * The factual card data lives once in CreditCards; a Review layers site-specific
 * content on top: each site can have its own review of the same card (its own
 * title, body, rating, pros/cons, SEO). One card → many reviews (one per site).
 */
export const Reviews: CollectionConfig = {
  slug: 'reviews',
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
    defaultColumns: ['title', 'site', 'card', '_status'],
    description: 'Sajt-unika recensioner ovanpå global kortdata.',
    preview: (doc) =>
      doc?.slug
        ? `${process.env.PREVIEW_URL || ''}/api/preview?secret=${process.env.PREVIEW_SECRET || ''}&path=/kreditkort/${doc.slug}`
        : null,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Rubrik',
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      index: true,
      label: 'Slug (URL)',
      admin: { description: 'Vanligtvis samma som kortets slug, t.ex. morrow-bank' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'site',
          type: 'relationship',
          relationTo: 'sites',
          required: true,
          label: 'Sajt',
          admin: { width: '50%' },
        },
        {
          name: 'card',
          type: 'relationship',
          relationTo: 'credit-cards',
          required: true,
          label: 'Kort (global data)',
          admin: { width: '50%' },
        },
      ],
    },
    {
      name: 'rating',
      type: 'number',
      min: 0,
      max: 5,
      label: 'Betyg (1–5) — sajt-specifikt',
      admin: { description: 'Lämna tomt för att använda kortets standardbetyg.' },
    },
    {
      name: 'excerpt',
      type: 'textarea',
      label: 'Ingress',
    },
    {
      name: 'body',
      type: 'textarea',
      label: 'Recensionstext (HTML)',
      maxLength: 500000,
      admin: { rows: 20, description: 'Sajt-unik recension. Renderas som rik text.' },
    },
    {
      name: 'pros',
      type: 'array',
      label: 'Fördelar (sajt-specifika, valfritt)',
      fields: [{ name: 'item', type: 'text', required: true, label: 'Fördel' }],
    },
    {
      name: 'cons',
      type: 'array',
      label: 'Nackdelar (sajt-specifika, valfritt)',
      fields: [{ name: 'item', type: 'text', required: true, label: 'Nackdel' }],
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
