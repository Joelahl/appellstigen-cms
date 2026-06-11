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
    defaultColumns: ['label', 'slug', 'site', 'active', 'clickCount', 'updatedAt'],
    description: 'Affiliate-omdirigeringar — /till/[slug] → riktig affiliatelänk.',
  },
  // Slug is unique per site (not globally) — two sites can each have "coop"
  // pointing at different affiliate URLs / tracking IDs.
  indexes: [{ fields: ['site', 'slug'], unique: true }],
  fields: [
    {
      name: 'label',
      type: 'text',
      required: true,
      label: 'Etikett (internt namn)',
      admin: { description: 'T.ex. "Coop Mastercard" — visas bara i admin.' },
    },
    {
      name: 'site',
      type: 'relationship',
      relationTo: 'sites',
      required: true,
      label: 'Sajt',
      admin: {
        position: 'sidebar',
        description: 'Vilken sajt länken hör till. Samma slug kan återanvändas på olika sajter.',
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      index: true,
      label: 'Slug (URL)',
      admin: { description: 'Används i /till/[slug] — t.ex. coop, binance-review. Inga snedstreck. Unik per sajt.' },
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
