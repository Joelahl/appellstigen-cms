import type { Block } from 'payload'

/**
 * Reusable content blocks — the scalable, WordPress-Gutenberg-style page
 * builder. Compose a page by stacking these in the Pages `layout` field; the
 * front-end has one <RenderBlocks> component that switches on blockType.
 * Add a new block type here once and it's available on every page.
 */

/** Legacy raw-HTML block (kept for migrated WordPress content). */
export const RichTextBlock: Block = {
  slug: 'richText',
  labels: { singular: 'HTML (rå kod)', plural: 'HTML (rå kod)' },
  fields: [
    { name: 'html', type: 'textarea', label: 'Innehåll (HTML)', maxLength: 500000, admin: { rows: 14 } },
  ],
}

/** Rich-text (Lexical) block — bold, italic, headings, lists, internal/external
 *  links. Use this for new editorial content and internal linking. */
export const ProseBlock: Block = {
  slug: 'prose',
  labels: { singular: 'Rich Text', plural: 'Rich Text' },
  fields: [
    {
      name: 'content',
      type: 'richText',
      label: 'Innehåll',
      admin: {
        description:
          'Redigerbart textblock med rubriker, fetstil, kursiv, listor och interna/externa länkar.',
      },
    },
  ],
}

/** Standalone image block — upload from Media, alt text, caption and size. */
export const ImageBlock: Block = {
  slug: 'image',
  labels: { singular: 'Bild', plural: 'Bilder' },
  fields: [
    { name: 'image', type: 'upload', relationTo: 'media', label: 'Bild' },
    {
      type: 'row',
      fields: [
        {
          name: 'alt',
          type: 'text',
          label: 'Alt-text',
          admin: { width: '50%', description: 'Beskriv bilden för skärmläsare och SEO.' },
        },
        { name: 'caption', type: 'text', label: 'Bildtext', admin: { width: '50%' } },
      ],
    },
    {
      name: 'size',
      type: 'select',
      defaultValue: 'full',
      label: 'Storlek',
      options: [
        { label: 'Full bredd', value: 'full' },
        { label: 'Halv bredd (centrerad)', value: 'half' },
        { label: 'Liten (centrerad)', value: 'small' },
      ],
    },
  ],
}

export const HeroBlock: Block = {
  slug: 'hero',
  labels: { singular: 'Hero', plural: 'Hero' },
  fields: [
    { name: 'heading', type: 'text', required: true, label: 'Rubrik' },
    { name: 'subheading', type: 'textarea', label: 'Underrubrik' },
    {
      type: 'row',
      fields: [
        { name: 'ctaLabel', type: 'text', label: 'Knapptext', admin: { width: '50%' } },
        { name: 'ctaHref', type: 'text', label: 'Knapplänk', admin: { width: '50%' } },
      ],
    },
  ],
}

export const CardComparisonBlock: Block = {
  slug: 'cardComparison',
  labels: { singular: 'Kortjämförelse', plural: 'Kortjämförelser' },
  fields: [
    { name: 'heading', type: 'text', label: 'Rubrik' },
    {
      name: 'source',
      type: 'select',
      defaultValue: 'all',
      label: 'Vilka kort',
      options: [
        { label: 'Alla (sorterade)', value: 'all' },
        { label: 'Endast utvalda', value: 'featured' },
        { label: 'Manuellt valda', value: 'manual' },
      ],
    },
    {
      name: 'cards',
      type: 'relationship',
      relationTo: 'credit-cards',
      hasMany: true,
      label: 'Kort (om manuellt)',
      admin: { condition: (_, siblingData) => siblingData?.source === 'manual' },
    },
    { name: 'limit', type: 'number', defaultValue: 10, label: 'Max antal' },
  ],
}

export const CTABlock: Block = {
  slug: 'cta',
  labels: { singular: 'CTA', plural: 'CTA' },
  fields: [
    { name: 'heading', type: 'text', required: true, label: 'Rubrik' },
    { name: 'text', type: 'textarea', label: 'Text' },
    {
      type: 'row',
      fields: [
        { name: 'buttonLabel', type: 'text', label: 'Knapptext', admin: { width: '50%' } },
        { name: 'buttonHref', type: 'text', label: 'Knapplänk', admin: { width: '50%' } },
      ],
    },
  ],
}

export const FAQBlock: Block = {
  slug: 'faq',
  labels: { singular: 'FAQ', plural: 'FAQ' },
  fields: [
    { name: 'heading', type: 'text', label: 'Rubrik', defaultValue: 'Vanliga frågor' },
    {
      name: 'items',
      type: 'array',
      label: 'Frågor',
      fields: [
        { name: 'question', type: 'text', required: true, label: 'Fråga' },
        { name: 'answer', type: 'textarea', required: true, label: 'Svar' },
      ],
    },
  ],
}

export const ImageTextBlock: Block = {
  slug: 'imageText',
  labels: { singular: 'Bild + text', plural: 'Bild + text' },
  fields: [
    { name: 'imageUrl', type: 'text', label: 'Bild-URL' },
    { name: 'heading', type: 'text', label: 'Rubrik' },
    { name: 'text', type: 'textarea', label: 'Text' },
    {
      name: 'imageSide',
      type: 'select',
      defaultValue: 'left',
      options: [
        { label: 'Vänster', value: 'left' },
        { label: 'Höger', value: 'right' },
      ],
    },
  ],
}

export const layoutBlocks: Block[] = [
  ProseBlock,
  ImageBlock,
  RichTextBlock,
  HeroBlock,
  CardComparisonBlock,
  CTABlock,
  FAQBlock,
  ImageTextBlock,
]
