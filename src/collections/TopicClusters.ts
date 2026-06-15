import type { CollectionConfig } from 'payload'

/**
 * TopicClusters — the SEO "branches" of a site.
 *
 * Each site is the root of a topical tree; a cluster is a pillar topic the site
 * wants to own (a head term + its supporting sub-topics). Content-plan items
 * (the leaves) attach to a cluster. This is an internal planning record — no
 * draft/publish workflow; `status` tracks how built-out the cluster is.
 */
export const TopicClusters: CollectionConfig = {
  slug: 'topic-clusters',
  access: {
    read: () => true,
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'pillarKeyword', 'site', 'status'],
    description: 'Ämneskluster — sajtens SEO-grenar (pelarämnen).',
    group: 'SEO & Innehåll',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Klusternamn',
      admin: { description: 'T.ex. "Kreditkort med bonus" eller "Bilförsäkring".' },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      index: true,
      unique: true,
      label: 'Slug (identifierare)',
      admin: { description: 'Unik nyckel, t.ex. bkk-bonus. Inga snedstreck.' },
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
      name: 'description',
      type: 'textarea',
      label: 'Beskrivning / topikalt omfång',
      admin: { description: 'Vad klustret täcker — hjälper att bygga ämnesauktoritet.' },
    },
    {
      name: 'pillarKeyword',
      type: 'text',
      label: 'Pelarsökord (head term)',
      admin: { description: 'Det breda sökord klustret ska äga, t.ex. "kreditkort".' },
    },
    {
      name: 'pillarPage',
      type: 'relationship',
      relationTo: 'pages',
      label: 'Pelarsida (hub)',
      admin: {
        position: 'sidebar',
        description: 'Den centrala sidan i klustret som stödartiklarna länkar till.',
      },
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
          defaultValue: 'planned',
          label: 'Status',
          options: [
            { label: 'Planerad', value: 'planned' },
            { label: 'Pågår', value: 'in-progress' },
            { label: 'Etablerad', value: 'established' },
          ],
          admin: { width: '50%' },
        },
      ],
    },
    {
      name: 'notes',
      type: 'textarea',
      label: 'Anteckningar',
    },
  ],
}
