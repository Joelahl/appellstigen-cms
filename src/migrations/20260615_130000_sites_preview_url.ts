import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Add Sites.previewUrl — per-site preview base URL so each site previews on its
 * own app (no cross-site content mixing) and the CMS can list each site's
 * preview link. Seeds the two existing sites; safe to re-run.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "sites" ADD COLUMN IF NOT EXISTS "preview_url" varchar;
   UPDATE "sites" SET "preview_url" = 'https://xn--bstkreditkort-bfb.nu' WHERE "id" = 1 AND "preview_url" IS NULL;
   UPDATE "sites" SET "preview_url" = 'http://insfind.65.108.85.200.sslip.io' WHERE "id" = 2 AND "preview_url" IS NULL;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`ALTER TABLE "sites" DROP COLUMN IF EXISTS "preview_url";`)
}
