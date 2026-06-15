import type { CollectionConfig } from 'payload'

/**
 * ContentPlan — the "leaves" of a site's SEO tree.
 *
 * One record per planned piece of content, targeting a query at a defined
 * search intent and funnel stage, grouped under a TopicCluster. This is the
 * editorial roadmap that turns a site into a topical-authority "root system".
 *
 * Internal planning record (no draft/publish workflow). The `status` field is
 * the workflow (idea → planned → … → published). Once a plan item graduates
 * into a real page, link it via `page`.
 */
export const ContentPlan: CollectionConfig = {
  slug: 'content-plan',
  access: {
    read: () => true,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'primaryKeyword', 'contentType', 'status', 'site'],
    description: 'Innehållsplan — planerade artiklar/sidor per sajt med SEO-metadata.',
    group: 'SEO & Innehåll',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Arbetstitel',
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      index: true,
      unique: true,
      label: 'Plan-ID (slug)',
      admin: { description: 'Unik nyckel för planposten, t.ex. bkk-bonus-guide.' },
    },
    {
      name: 'site',
      type: 'relationship',
      relationTo: 'sites',
      required: true,
      label: 'Sajt',
      admin: { position: 'sidebar' },
    },
    {
      name: 'cluster',
      type: 'relationship',
      relationTo: 'topic-clusters',
      label: 'Ämneskluster',
      admin: { position: 'sidebar', description: 'Vilken SEO-gren posten tillhör.' },
    },
    {
      name: 'primaryKeyword',
      type: 'text',
      label: 'Primärt sökord',
      admin: { description: 'Det huvudsakliga sökord sidan ska ranka för.' },
    },
    {
      name: 'secondaryKeywords',
      type: 'array',
      label: 'Sekundära sökord',
      labels: { singular: 'Sökord', plural: 'Sökord' },
      fields: [{ name: 'keyword', type: 'text', required: true, label: 'Sökord' }],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'searchIntent',
          type: 'select',
          label: 'Sökintention',
          options: [
            { label: 'Informativ', value: 'informational' },
            { label: 'Kommersiell', value: 'commercial' },
            { label: 'Transaktionell', value: 'transactional' },
            { label: 'Navigerande', value: 'navigational' },
          ],
          admin: { width: '33%' },
        },
        {
          name: 'funnelStage',
          type: 'select',
          label: 'Tratt-steg',
          options: [
            { label: 'TOFU (medvetenhet)', value: 'tofu' },
            { label: 'MOFU (övervägande)', value: 'mofu' },
            { label: 'BOFU (beslut)', value: 'bofu' },
          ],
          admin: { width: '33%' },
        },
        {
          name: 'contentType',
          type: 'select',
          label: 'Innehållstyp',
          options: [
            { label: 'Pelarsida', value: 'pillar' },
            { label: 'Kategorisida', value: 'category' },
            { label: 'Jämförelse', value: 'comparison' },
            { label: 'Recension', value: 'review' },
            { label: 'Guide', value: 'guide' },
            { label: 'Topplista', value: 'listicle' },
            { label: 'FAQ', value: 'faq' },
            { label: 'Ordlista', value: 'glossary' },
            { label: 'Nyhet', value: 'news' },
          ],
          admin: { width: '34%' },
        },
      ],
    },
    {
      name: 'targetSlug',
      type: 'text',
      label: 'Mål-URL (slug)',
      admin: { description: 'Den planerade URL-sökvägen, t.ex. kreditkort-med-bonus.' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'priority',
          type: 'select',
          defaultValue: 'medium',
          label: 'Prioritet',
          options: [
            { label: 'Hög', value: 'high' },
            { label: 'Medel', value: 'medium' },
            { label: 'Låg', value: 'low' },
          ],
          admin: { width: '50%' },
        },
        {
          name: 'status',
          type: 'select',
          defaultValue: 'idea',
          label: 'Status',
          options: [
            { label: 'Idé', value: 'idea' },
            { label: 'Planerad', value: 'planned' },
            { label: 'Brief klar', value: 'briefed' },
            { label: 'Skrivs', value: 'drafting' },
            { label: 'Granskas', value: 'review' },
            { label: 'Publicerad', value: 'published' },
          ],
          admin: { width: '50%' },
        },
      ],
    },
    {
      name: 'page',
      type: 'relationship',
      relationTo: 'pages',
      label: 'Publicerad sida',
      admin: {
        position: 'sidebar',
        description: 'Koppla till den riktiga sidan när posten blivit innehåll.',
      },
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'authors',
      label: 'Skribent',
      admin: { position: 'sidebar' },
    },
    {
      name: 'targetPublishDate',
      type: 'date',
      label: 'Måldatum för publicering',
      admin: { position: 'sidebar', date: { pickerAppearance: 'dayOnly' } },
    },
    {
      name: 'metrics',
      type: 'group',
      label: 'SEO-mått',
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'searchVolume',
              type: 'number',
              label: 'Sökvolym/mån',
              admin: { width: '50%' },
            },
            {
              name: 'keywordDifficulty',
              type: 'number',
              label: 'Svårighetsgrad (0–100)',
              admin: { width: '50%' },
            },
          ],
        },
      ],
    },
    {
      name: 'notes',
      type: 'textarea',
      label: 'Brief / anteckningar',
      admin: { rows: 6, description: 'Vinkel, vad sidan ska täcka, interna länkar m.m.' },
    },
  ],
}
