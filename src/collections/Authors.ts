import type { CollectionConfig } from 'payload'

/**
 * Authors — reusable editorial profiles used for bylines on Pages/Reviews and
 * the "Our experts" team section. Shared across all sites.
 */
export const Authors: CollectionConfig = {
  slug: 'authors',
  access: { read: () => true },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'title'],
    description: 'Skribenter / experter — används för bylines och teamsektioner.',
  },
  fields: [
    { name: 'name', type: 'text', required: true, label: 'Namn' },
    { name: 'title', type: 'text', label: 'Titel/roll (t.ex. Kreditkortsexpert)' },
    { name: 'avatar', type: 'upload', relationTo: 'media', label: 'Profilbild (uppladdad)' },
    { name: 'avatarUrl', type: 'text', label: 'Profilbild — URL (alternativ)' },
    { name: 'bio', type: 'textarea', label: 'Kort bio' },
    {
      type: 'row',
      fields: [
        { name: 'email', type: 'text', label: 'E-post', admin: { width: '50%' } },
        { name: 'linkedin', type: 'text', label: 'LinkedIn-URL', admin: { width: '50%' } },
      ],
    },
  ],
}
