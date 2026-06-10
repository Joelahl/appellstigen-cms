import type { CollectionConfig } from 'payload'

/**
 * CreditCards — GLOBAL library of factual credit-card data.
 *
 * Cards are shared across all sites in the platform (no required `site`).
 * Field structure mirrors the legacy WordPress ACF "Data: Kort" group so
 * content migrates 1:1, organised into admin tabs for clarity.
 *
 * Fee/rate fields are stored as TEXT (e.g. "21,40 %", "0 kr", "50 dagar")
 * to preserve the exact source formatting from the WordPress site.
 */
export const CreditCards: CollectionConfig = {
  slug: 'credit-cards',
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
    useAsTitle: 'cardName',
    defaultColumns: ['cardName', 'issuer', 'cardType', '_status', 'featured'],
    description: 'Kreditkort — global datakälla som kan användas av flera sajter.',
    preview: (doc) =>
      doc?.slug
        ? `${process.env.PREVIEW_URL || ''}/api/preview?secret=${process.env.PREVIEW_SECRET || ''}&path=/kreditkort/${doc.slug}`
        : null,
  },
  fields: [
    // ── Always-visible identity ───────────────────────────────────────────
    {
      name: 'cardName',
      type: 'text',
      required: true,
      label: 'Kortnamn',
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      label: 'Slug (URL)',
      admin: { description: 'e.g. morrow-bank — används i /kreditkort/[slug]' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'featured',
          type: 'checkbox',
          label: 'Utvalt kort',
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

    // ── Tabs (mirror ACF tabs) ────────────────────────────────────────────
    {
      type: 'tabs',
      tabs: [
        // 1. Allmänt
        {
          label: 'Allmänt',
          fields: [
            { name: 'issuer', type: 'text', label: 'Utgivare (bank/kortbolag)' },
            { name: 'cardType', type: 'text', label: 'Korttyp (t.ex. Bonuskort, Bensinkort)' },
            { name: 'cardImageUrl', type: 'text', label: 'Kortbild — URL' },
            {
              name: 'cardImage',
              type: 'upload',
              relationTo: 'media',
              label: 'Kortbild (uppladdad — valfri)',
            },
            { name: 'customColor', type: 'text', label: 'Custom color (hex)' },
            { name: 'uniqueKw', type: 'text', label: 'Unikt nyckelord' },
            { name: 'bestFor', type: 'text', label: 'Passar bra som' },
            {
              name: 'description',
              type: 'textarea',
              label: 'Kort beskrivning',
            },
          ],
        },

        // 2. Betyg
        {
          label: 'Betyg',
          fields: [
            {
              name: 'editorRating',
              type: 'number',
              label: 'Redaktörens betyg (1–5)',
              min: 0,
              max: 5,
            },
            {
              name: 'ratings',
              type: 'group',
              label: 'Delbetyg',
              fields: [
                { name: 'bonus', type: 'number', label: 'Bonus betyg' },
                { name: 'insurance', type: 'number', label: 'Försäkringar betyg' },
                { name: 'creditTerms', type: 'number', label: 'Kreditvillkor betyg' },
                { name: 'fees', type: 'number', label: 'Avgift betyg' },
              ],
            },
          ],
        },

        // 3. Avgifter & villkor
        {
          label: 'Avgifter & villkor',
          fields: [
            {
              name: 'fees',
              type: 'group',
              label: 'Avgifter & ränta',
              fields: [
                { name: 'annualCost', type: 'text', label: 'Årskostnad' },
                { name: 'maxCredit', type: 'text', label: 'Maxkredit' },
                { name: 'interestRate', type: 'text', label: 'Kreditränta' },
                { name: 'interestFreePeriod', type: 'text', label: 'Räntefri period' },
                { name: 'currencyFee', type: 'text', label: 'Valutaavgift/-påslag' },
                { name: 'withdrawalFee', type: 'text', label: 'Uttagsavgift' },
                { name: 'invoiceFee', type: 'text', label: 'Aviavgift' },
                { name: 'reminderFee', type: 'text', label: 'Påminnelseavgift' },
                { name: 'overdraftFee', type: 'text', label: 'Övertrasseringsavgift' },
              ],
            },
            {
              name: 'eligibility',
              type: 'group',
              label: 'Krav',
              fields: [
                { name: 'minAge', type: 'text', label: 'Ålderskrav' },
                { name: 'minIncome', type: 'text', label: 'Inkomstkrav' },
                { name: 'paymentRemarks', type: 'text', label: 'Betalningsanmärkningar' },
              ],
            },
            { name: 'termsText', type: 'text', label: 'Terms & Conditions text' },
          ],
        },

        // 4. Bonus & fördelar
        {
          label: 'Bonus & fördelar',
          fields: [
            { name: 'bonus', type: 'text', label: 'Bonus' },
            { name: 'concierge', type: 'text', label: 'Concierge' },
            { name: 'airportLounge', type: 'text', label: 'Flyglounger' },
            {
              name: 'pros',
              type: 'array',
              label: 'Fördelar',
              fields: [{ name: 'item', type: 'text', required: true, label: 'Fördel' }],
            },
            {
              name: 'cons',
              type: 'array',
              label: 'Nackdelar',
              fields: [{ name: 'item', type: 'text', required: true, label: 'Nackdel' }],
            },
          ],
        },

        // 5. Funktion
        {
          label: 'Funktion',
          fields: [
            { name: 'applePay', type: 'checkbox', label: 'Apple Pay', defaultValue: false },
            { name: 'googlePay', type: 'checkbox', label: 'Google Pay', defaultValue: false },
            { name: 'contactless', type: 'checkbox', label: 'Contactless', defaultValue: false },
          ],
        },

        // 6. Recension (migrerat innehåll)
        {
          label: 'Recension',
          fields: [
            { name: 'verdict', type: 'textarea', label: 'Kort omdöme' },
            {
              name: 'reviewContent',
              type: 'textarea',
              label: 'Fullständig recension (HTML — migrerat innehåll)',
              maxLength: 500000,
              admin: {
                description:
                  'Migrerat HTML-innehåll från WordPress. Renderas som rik text på sajten.',
                rows: 20,
              },
            },
            { name: 'screenshotUrl', type: 'text', label: 'Skärmdump — URL' },
          ],
        },

        // 7. Topplist promo
        {
          label: 'Promo',
          fields: [
            { name: 'bonusTitle', type: 'text', label: 'Bonus title' },
            { name: 'bonusExplainer', type: 'text', label: 'Bonus explainer' },
            { name: 'cashbackTitle', type: 'text', label: 'Cashback title' },
            { name: 'cashbackExplainer', type: 'text', label: 'Cashback explainer' },
          ],
        },

        // 8. Länkar (affiliate CTAs)
        {
          label: 'Länkar (CTA)',
          fields: [
            {
              name: 'affiliateLink',
              type: 'text',
              label: 'Affiliatelänk (huvud)',
              admin: { description: 'Primär ansökningslänk' },
            },
            { name: 'ctaText', type: 'text', label: 'CTA-text', defaultValue: 'Ansök nu' },
            {
              name: 'ctaLinks',
              type: 'group',
              label: 'CTA per kategori (valfritt)',
              fields: [
                { name: 'index', type: 'text', label: 'CTA Index' },
                { name: 'review', type: 'text', label: 'CTA Review' },
                { name: 'bonus', type: 'text', label: 'CTA Bonuskort' },
                { name: 'lowRate', type: 'text', label: 'CTA Låg ränta' },
                { name: 'withoutUC', type: 'text', label: 'CTA Utan UC' },
                { name: 'corporate', type: 'text', label: 'CTA Företagskort' },
                { name: 'fuel', type: 'text', label: 'CTA Bensinkort' },
                { name: 'debit', type: 'text', label: 'CTA Debet' },
                { name: 'cashback', type: 'text', label: 'CTA Cashback' },
                { name: 'free', type: 'text', label: 'CTA Gratis' },
                { name: 'cheap', type: 'text', label: 'CTA Billiga' },
              ],
            },
          ],
        },

        // 9. SEO
        {
          label: 'SEO',
          fields: [
            { name: 'seo', type: 'group', label: 'SEO', fields: [
              { name: 'metaTitle', type: 'text', label: 'Meta Title' },
              { name: 'metaDescription', type: 'textarea', label: 'Meta Description' },
              { name: 'ogImageUrl', type: 'text', label: 'OG Image — URL' },
            ] },
          ],
        },
      ],
    },

    // ── Relations & source (sidebar) ──────────────────────────────────────
    {
      name: 'sites',
      type: 'relationship',
      relationTo: 'sites',
      hasMany: true,
      label: 'Sajter (valfritt — vilka sajter visar detta kort)',
      admin: { position: 'sidebar' },
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
    {
      name: 'lastVerified',
      type: 'date',
      label: 'Senast verifierad',
      admin: { position: 'sidebar' },
    },
  ],
}
