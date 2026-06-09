import type { CollectionConfig } from 'payload'

export const CreditCards: CollectionConfig = {
  slug: 'credit-cards',
  admin: {
    useAsTitle: 'cardName',
    defaultColumns: ['cardName', 'issuer', 'site', 'editorRating', 'featured'],
    description: 'Kreditkort för jämförelse — ett dokument per kort per sajt.',
  },
  fields: [
    // ── Relation ──────────────────────────────────────────────────────────
    {
      name: 'site',
      type: 'relationship',
      relationTo: 'sites',
      required: true,
      label: 'Sajt',
      admin: {
        description: 'Vilken sajt detta kort tillhör',
      },
    },

    // ── Identity ──────────────────────────────────────────────────────────
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
      admin: {
        description: 'e.g. amex-gold — used in /kreditkort/[slug]',
      },
    },
    {
      name: 'issuer',
      type: 'text',
      required: true,
      label: 'Utgivare (bank/kortbolag)',
    },
    {
      name: 'cardImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Kortbild',
    },
    {
      name: 'featured',
      type: 'checkbox',
      label: 'Utvalt kort (visas överst)',
      defaultValue: false,
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'published',
      options: [
        { label: 'Publicerat', value: 'published' },
        { label: 'Utkast', value: 'draft' },
        { label: 'Arkiverat', value: 'archived' },
      ],
    },

    // ── Fees & Rates ──────────────────────────────────────────────────────
    {
      name: 'fees',
      type: 'group',
      label: 'Avgifter & Ränta',
      fields: [
        {
          name: 'annualFee',
          type: 'number',
          label: 'Årsavgift (SEK)',
          min: 0,
        },
        {
          name: 'annualFeeNote',
          type: 'text',
          label: 'Årsavgift — kommentar (t.ex. "gratis första året")',
        },
        {
          name: 'interestRate',
          type: 'number',
          label: 'Ränta (%)',
          min: 0,
          admin: {
            description: 'Kreditränta per år i procent',
          },
        },
        {
          name: 'interestFreedays',
          type: 'number',
          label: 'Räntefria dagar',
          min: 0,
        },
        {
          name: 'withdrawalFee',
          type: 'text',
          label: 'Uttagsavgift',
        },
        {
          name: 'foreignTransactionFee',
          type: 'text',
          label: 'Utlandsavgift',
        },
      ],
    },

    // ── Credit Limit ──────────────────────────────────────────────────────
    {
      name: 'creditLimit',
      type: 'group',
      label: 'Kreditgräns',
      fields: [
        {
          name: 'min',
          type: 'number',
          label: 'Min (SEK)',
        },
        {
          name: 'max',
          type: 'number',
          label: 'Max (SEK)',
        },
      ],
    },

    // ── Bonus & Cashback ──────────────────────────────────────────────────
    {
      name: 'rewards',
      type: 'group',
      label: 'Bonus & Cashback',
      fields: [
        {
          name: 'welcomeBonus',
          type: 'text',
          label: 'Välkomstbonus',
        },
        {
          name: 'cashbackPercent',
          type: 'number',
          label: 'Cashback (%)',
          min: 0,
        },
        {
          name: 'cashbackNote',
          type: 'text',
          label: 'Cashback — kommentar',
        },
        {
          name: 'pointsProgram',
          type: 'text',
          label: 'Poängprogram',
        },
      ],
    },

    // ── Benefits ─────────────────────────────────────────────────────────
    {
      name: 'benefits',
      type: 'array',
      label: 'Förmåner',
      fields: [
        {
          name: 'benefit',
          type: 'text',
          required: true,
          label: 'Förmån',
        },
      ],
    },

    // ── Insurance ─────────────────────────────────────────────────────────
    {
      name: 'insurance',
      type: 'group',
      label: 'Försäkringar',
      fields: [
        {
          name: 'travelInsurance',
          type: 'checkbox',
          label: 'Reseförsäkring',
          defaultValue: false,
        },
        {
          name: 'travelInsuranceNote',
          type: 'text',
          label: 'Reseförsäkring — detaljer',
        },
        {
          name: 'purchaseProtection',
          type: 'checkbox',
          label: 'Köpskydd',
          defaultValue: false,
        },
        {
          name: 'cancellationProtection',
          type: 'checkbox',
          label: 'Avbeställningsskydd',
          defaultValue: false,
        },
        {
          name: 'priceProtection',
          type: 'checkbox',
          label: 'Prisskydd',
          defaultValue: false,
        },
      ],
    },

    // ── Eligibility ───────────────────────────────────────────────────────
    {
      name: 'eligibility',
      type: 'group',
      label: 'Krav & Behörighet',
      fields: [
        {
          name: 'minAge',
          type: 'number',
          label: 'Lägsta ålder',
          defaultValue: 18,
        },
        {
          name: 'minIncome',
          type: 'number',
          label: 'Lägsta inkomst (SEK/år)',
        },
        {
          name: 'requiresSwedishResident',
          type: 'checkbox',
          label: 'Kräver folkbokföring i Sverige',
          defaultValue: true,
        },
      ],
    },

    // ── Editor Review ─────────────────────────────────────────────────────
    {
      name: 'editorRating',
      type: 'number',
      label: 'Redaktörens betyg (1–5)',
      min: 1,
      max: 5,
      required: true,
    },
    {
      name: 'pros',
      type: 'array',
      label: 'Fördelar',
      fields: [
        { name: 'item', type: 'text', required: true, label: 'Fördel' },
      ],
    },
    {
      name: 'cons',
      type: 'array',
      label: 'Nackdelar',
      fields: [
        { name: 'item', type: 'text', required: true, label: 'Nackdel' },
      ],
    },
    {
      name: 'verdict',
      type: 'textarea',
      label: 'Redaktörens omdöme (kort)',
    },
    {
      name: 'fullReview',
      type: 'richText',
      label: 'Fullständig recension',
    },

    // ── Affiliate ─────────────────────────────────────────────────────────
    {
      name: 'affiliateLink',
      type: 'text',
      label: 'Affiliatelänk',
      required: true,
      admin: {
        description: 'Länk till kortets ansökningssida via affiliatenätverk',
      },
    },
    {
      name: 'ctaText',
      type: 'text',
      label: 'CTA-text',
      defaultValue: 'Ansök nu',
    },
    {
      name: 'sortOrder',
      type: 'number',
      label: 'Sorteringsordning',
      defaultValue: 100,
      admin: {
        description: 'Lägre siffra = visas högre upp',
      },
    },

    // ── SEO ───────────────────────────────────────────────────────────────
    {
      name: 'seo',
      type: 'group',
      label: 'SEO',
      fields: [
        {
          name: 'metaTitle',
          type: 'text',
          label: 'Meta Title',
        },
        {
          name: 'metaDescription',
          type: 'textarea',
          label: 'Meta Description',
        },
        {
          name: 'ogImage',
          type: 'upload',
          relationTo: 'media',
          label: 'OG Image',
        },
      ],
    },

    // ── Timestamps (managed) ──────────────────────────────────────────────
    {
      name: 'lastVerified',
      type: 'date',
      label: 'Senast verifierad',
      admin: {
        description: 'Datum när kortets uppgifter senast kontrollerades',
      },
    },
  ],
}
