import type { CollectionConfig } from 'payload'

export const Sites: CollectionConfig = {
  slug: 'sites',
  access: {
    // Front-end sites read their own branding/design/nav without auth.
    read: () => true,
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'domain', 'template', 'status'],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Site Name',
    },
    {
      name: 'domain',
      type: 'text',
      required: true,
      unique: true,
      label: 'Domain (e.g. bästa-kreditkort.nu)',
    },
    {
      name: 'template',
      type: 'select',
      required: true,
      label: 'Template Type',
      options: [
        { label: 'Credit Card Comparison', value: 'credit-card-comparison' },
        { label: 'Loan Comparison', value: 'loan-comparison' },
        { label: 'Insurance Comparison', value: 'insurance-comparison' },
      ],
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Active', value: 'active' },
        { label: 'Archived', value: 'archived' },
      ],
    },
    {
      name: 'locale',
      type: 'select',
      defaultValue: 'sv',
      required: true,
      label: 'Primary Locale',
      options: [
        { label: 'Swedish (sv)', value: 'sv' },
        { label: 'English (en)', value: 'en' },
        { label: 'Norwegian (no)', value: 'no' },
        { label: 'Danish (da)', value: 'da' },
        { label: 'Finnish (fi)', value: 'fi' },
      ],
    },
    {
      name: 'branding',
      type: 'group',
      label: 'Branding',
      fields: [
        {
          name: 'siteName',
          type: 'text',
          label: 'Display Name',
        },
        {
          name: 'tagline',
          type: 'text',
          label: 'Tagline',
        },
        {
          name: 'logo',
          type: 'upload',
          relationTo: 'media',
          label: 'Logo',
        },
        {
          name: 'primaryColor',
          type: 'text',
          label: 'Primary Color (hex)',
          defaultValue: '#2563eb',
        },
        {
          name: 'accentColor',
          type: 'text',
          label: 'Accent Color (hex)',
          defaultValue: '#f59e0b',
        },
        // Per-site design assets — upload (preferred) or paste a URL.
        { name: 'faviconImage', type: 'upload', relationTo: 'media', label: 'Favicon/ikon (uppladdad)' },
        { name: 'faviconUrl', type: 'text', label: 'Favicon/ikon — URL (alternativ)' },
        { name: 'heroImage', type: 'upload', relationTo: 'media', label: 'Hero-bakgrundsbild (uppladdad)' },
        { name: 'heroImageUrl', type: 'text', label: 'Hero-bakgrundsbild — URL (alternativ)' },
        { name: 'backgroundImage', type: 'upload', relationTo: 'media', label: 'Sidbakgrund (uppladdad)' },
        { name: 'backgroundImageUrl', type: 'text', label: 'Sidbakgrund — URL (alternativ)' },
        // Light logo variant for dark backgrounds (e.g. footer).
        { name: 'logoLight', type: 'upload', relationTo: 'media', label: 'Logotyp ljus (för mörk bakgrund)' },
        { name: 'logoLightUrl', type: 'text', label: 'Logotyp ljus — URL (alternativ)' },
      ],
    },
    {
      name: 'company',
      type: 'group',
      label: 'Företagsuppgifter (footer)',
      fields: [
        { name: 'legalName', type: 'text', label: 'Företagsnamn' },
        { name: 'orgNumber', type: 'text', label: 'Organisationsnummer' },
        { name: 'address', type: 'textarea', label: 'Adress' },
        {
          type: 'row',
          fields: [
            { name: 'email', type: 'text', label: 'E-post', admin: { width: '50%' } },
            { name: 'phone', type: 'text', label: 'Telefon', admin: { width: '50%' } },
          ],
        },
        { name: 'openingHours', type: 'textarea', label: 'Öppettider' },
      ],
    },
    {
      name: 'about',
      type: 'group',
      label: 'Om / Vad vi gör',
      fields: [
        { name: 'heading', type: 'text', label: 'Rubrik', defaultValue: 'Vad vi gör' },
        { name: 'text', type: 'richText', label: 'Text' },
      ],
    },
    {
      name: 'seo',
      type: 'group',
      label: 'SEO Defaults',
      fields: [
        {
          name: 'defaultTitle',
          type: 'text',
          label: 'Default Title',
        },
        {
          name: 'titleTemplate',
          type: 'text',
          label: 'Title Template',
          admin: {
            description: 'Use %s for page title, e.g. "%s | Bästa Kreditkort"',
          },
        },
        {
          name: 'defaultDescription',
          type: 'textarea',
          label: 'Default Meta Description',
        },
        {
          name: 'defaultOgImage',
          type: 'upload',
          relationTo: 'media',
          label: 'Default OG Image',
        },
        {
          name: 'googleVerification',
          type: 'text',
          label: 'Google Site Verification',
        },
      ],
    },
    {
      name: 'tracking',
      type: 'group',
      label: 'Tracking & Analytics',
      fields: [
        {
          name: 'gaId',
          type: 'text',
          label: 'Google Analytics ID',
        },
        {
          name: 'gscVerification',
          type: 'text',
          label: 'Google Search Console Verification',
        },
      ],
    },
    {
      name: 'navigation',
      type: 'array',
      label: 'Navigation Links',
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
        },
        {
          name: 'href',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'affiliateDefaults',
      type: 'group',
      label: 'Affiliate Defaults',
      fields: [
        {
          name: 'disclosureText',
          type: 'textarea',
          label: 'Affiliate Disclosure Text',
        },
        {
          name: 'disclaimerText',
          type: 'textarea',
          label: 'Disclaimer Text',
        },
      ],
    },
  ],
}
