import type { CollectionConfig } from 'payload'

/**
 * AffiliateLinks — slug-based outbound redirect targets for /till/<slug>.
 *
 * Replaces the legacy WordPress affiliate-redirect plugin. Each row maps an
 * arbitrary slug (NOT a card slug — e.g. "coop", "binance-review") to a real
 * affiliate URL. The front-end serves an interstitial landing page at
 * /till/<slug> with a short countdown, then redirects to targetUrl.
 *
 * No drafts/versions: these are operational redirect rows, published immediately.
 * clickCount is reserved for future click-tracking (no write path yet).
 */
export const AffiliateLinks: CollectionConfig = {
  slug: 'affiliate-links',
  access: {
    // Front-end reads the active redirect target without auth.
    read: () => true,
  },
  admin: {
    useAsTitle: 'label',
    defaultColumns: ['label', 'slug', 'active', 'clickCount', 'updatedAt'],
    description: 'Affiliate-omdirigeringar — /till/[slug] → riktig affiliatelänk.',
  },
  fields: [
    {
      name: 'label',
      type: 'text',
      required: true,
      label: 'Etikett (internt namn)',
      admin: { description: 'T.ex. "Coop Mastercard" — visas bara i admin.' },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      label: 'Slug (URL)',
      admin: { description: 'Används i /till/[slug] — t.ex. coop, binance-review. Inga snedstreck.' },
    },
    {
      name: 'targetUrl',
      type: 'text',
      required: true,
      label: 'Mål-URL (affiliatelänk)',
      admin: { description: 'Fullständig destinations-URL inkl. https://' },
    },
    {
      name: 'active',
      type: 'checkbox',
      label: 'Aktiv',
      defaultValue: true,
      index: true,
      admin: { description: 'Avmarkera för att tillfälligt stänga av (ger 404 på /till/[slug]).' },
    },
    {
      name: 'card',
      type: 'relationship',
      relationTo: 'credit-cards',
      label: 'Kopplat kort (valfritt — för branding på mellansidan)',
      admin: { position: 'sidebar' },
    },
    {
      name: 'clickCount',
      type: 'number',
      label: 'Antal klick',
      defaultValue: 0,
      admin: { position: 'sidebar', readOnly: true, description: 'Reserverat för framtida klickspårning.' },
    },
  ],
}
