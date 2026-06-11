import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

/**
 * Remove broken <img> tags pointing at the dead WordPress /wp-content/uploads/
 * assets from page content (the homepage's decorative SVGs no longer resolve
 * now that WordPress is replaced). Strips the <img> tag entirely.
 */
const WP_IMG = /<img\b[^>]*\bsrc="[^"]*wp-content\/uploads\/[^"]*"[^>]*>/gi

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  const pages = await payload.find({
    collection: 'pages',
    limit: 1000,
    overrideAccess: true,
    pagination: false,
  })
  let changed = 0
  for (const p of pages.docs as Array<{ id: string | number; content?: string }>) {
    const c = p.content || ''
    if (!c) continue
    const nc = c.replace(WP_IMG, '')
    if (nc !== c) {
      await payload.update({ collection: 'pages', id: p.id, data: { content: nc }, overrideAccess: true })
      changed++
    }
  }
  payload.logger.info(`[200000] Stripped broken wp-content images from ${changed} page(s).`)
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // Cannot restore removed markup.
}
