import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Per-site affiliate redirects + configurable outbound URL segment.
 *  - sites.outbound_slug (default 'till') — URL prefix for /till/<slug>.
 *  - affiliate_links.site_id — every redirect belongs to a site, so the same
 *    slug (e.g. "coop") can resolve to different affiliate URLs per site.
 *  - slug uniqueness moves from global → composite (site_id, slug).
 *
 * Safe: affiliate_links has no rows yet.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "sites" ADD COLUMN IF NOT EXISTS "outbound_slug" varchar DEFAULT 'till';

  ALTER TABLE "affiliate_links" ADD COLUMN "site_id" integer;
  ALTER TABLE "affiliate_links" ADD CONSTRAINT "affiliate_links_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "affiliate_links_site_idx" ON "affiliate_links" USING btree ("site_id");

  -- slug uniqueness is now per-site, not global.
  DROP INDEX IF EXISTS "affiliate_links_slug_idx";
  CREATE INDEX "affiliate_links_slug_idx" ON "affiliate_links" USING btree ("slug");
  CREATE UNIQUE INDEX "affiliate_links_site_slug_idx" ON "affiliate_links" USING btree ("site_id", "slug");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  DROP INDEX IF EXISTS "affiliate_links_site_slug_idx";
  DROP INDEX IF EXISTS "affiliate_links_slug_idx";
  CREATE UNIQUE INDEX "affiliate_links_slug_idx" ON "affiliate_links" USING btree ("slug");
  ALTER TABLE "affiliate_links" DROP CONSTRAINT IF EXISTS "affiliate_links_site_id_sites_id_fk";
  DROP INDEX IF EXISTS "affiliate_links_site_idx";
  ALTER TABLE "affiliate_links" DROP COLUMN IF EXISTS "site_id";
  ALTER TABLE "sites" DROP COLUMN IF EXISTS "outbound_slug";`)
}
