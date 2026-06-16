import type { CollectionConfig } from 'payload'

/**
 * Insurances — GLOBAL library of insurance products, the insurance-niche
 * counterpart to CreditCards. Shared across all insurance sites (no required
 * `site`). Field names mirror the `Insurance` type in
 * @tacotech/niche-insurance so the front-end mapper maps 1:1.
 *
 * Money/amount values are stored as TEXT (e.g. "129 kr/mån", "1 500 kr") to
 * preserve display formatting, consistent with CreditCards.
 */
export const Insurances: CollectionConfig = {
  slug: 'insurances',
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
    useAsTitle: 'insuranceName',
    defaultColumns: ['insuranceName', 'provider', '_status', 'featured'],
    description: 'Försäkringar — global datakälla som kan användas av flera sajter.',
  },
  fields: [
    {
      name: 'insuranceName',
      type: 'text',
      required: true,
      label: 'Försäkringens namn',
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      label: 'Slug (URL)',
      admin: { description: 'e.g. if-hemforsakring — används i /forsakring/[slug]' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'featured',
          type: 'checkbox',
          label: 'Utvald',
          defaultValue: false,
          admin: { width: '50%' },
        },
        {
          name: 'sortOrder',
          type: 'number',
          label: 'Sortering',
          defaultValue: 100,
          admin: { width: '50%', description: 'Lägre = högre upp' },
        },
      ],
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Allmänt',
          fields: [
            { name: 'provider', type: 'text', label: 'Försäkringsbolag' },
            { name: 'bestFor', type: 'text', label: 'Passar bra som' },
            { name: 'logo', type: 'upload', relationTo: 'media', label: 'Logotyp (uppladdad — valfri)' },
            { name: 'logoUrl', type: 'text', label: 'Logotyp — URL (alternativ)' },
            { name: 'editorRating', type: 'number', label: 'Redaktionens betyg (0–5)', min: 0, max: 5 },
          ],
        },
        {
          label: 'Villkor',
          fields: [
            { name: 'monthlyPremium', type: 'text', label: 'Premie (t.ex. "129 kr/mån")' },
            { name: 'deductible', type: 'text', label: 'Självrisk (t.ex. "1 500 kr")' },
            { name: 'coverageAmount', type: 'text', label: 'Täckning (t.ex. "1 000 000 kr")' },
            {
              name: 'highlights',
              type: 'array',
              label: 'Höjdpunkter (chips)',
              fields: [{ name: 'item', type: 'text', required: true }],
            },
          ],
        },
        {
          label: 'Affiliate & SEO',
          fields: [
            { name: 'affiliateLink', type: 'text', label: 'Affiliate-länk' },
            { name: 'ctaText', type: 'text', label: 'CTA-text', defaultValue: 'Få offert' },
            {
              name: 'seo',
              type: 'group',
              label: 'SEO',
              fields: [
                { name: 'metaTitle', type: 'text', label: 'Meta Title' },
                { name: 'metaDescription', type: 'textarea', label: 'Meta Description' },
                { name: 'ogImageUrl', type: 'upload', relationTo: 'media', label: 'OG Image' },
              ],
            },
          ],
        },
      ],
    },
  ],
}
