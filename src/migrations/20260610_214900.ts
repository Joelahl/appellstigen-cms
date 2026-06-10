import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "sites" ALTER COLUMN "about_text" SET DATA TYPE jsonb USING NULL;
  ALTER TABLE "pages" ALTER COLUMN "best_card_summary" SET DATA TYPE jsonb USING NULL;
  ALTER TABLE "_pages_v" ALTER COLUMN "version_best_card_summary" SET DATA TYPE jsonb USING NULL;
  ALTER TABLE "authors" ALTER COLUMN "bio" SET DATA TYPE jsonb USING NULL;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "sites" ALTER COLUMN "about_text" SET DATA TYPE varchar;
  ALTER TABLE "pages" ALTER COLUMN "best_card_summary" SET DATA TYPE varchar;
  ALTER TABLE "_pages_v" ALTER COLUMN "version_best_card_summary" SET DATA TYPE varchar;
  ALTER TABLE "authors" ALTER COLUMN "bio" SET DATA TYPE varchar;`)
}
