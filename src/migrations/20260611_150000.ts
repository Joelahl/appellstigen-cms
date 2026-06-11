import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Adds `review_slug` to sites — the per-site URL segment for individual reviews
 * (e.g. "kreditkort" → /kreditkort/<slug>; "lan", "kort" for other sites).
 * Existing rows default to 'kreditkort' so current URLs are unchanged.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "sites" ADD COLUMN IF NOT EXISTS "review_slug" varchar DEFAULT 'kreditkort';
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "sites" DROP COLUMN IF EXISTS "review_slug";
  `)
}
