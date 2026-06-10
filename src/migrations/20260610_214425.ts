import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "sites" ADD COLUMN "branding_favicon_image_id" integer;
  ALTER TABLE "sites" ADD COLUMN "branding_hero_image_id" integer;
  ALTER TABLE "sites" ADD COLUMN "branding_background_image_id" integer;
  ALTER TABLE "authors" ADD COLUMN "avatar_id" integer;
  ALTER TABLE "sites" ADD CONSTRAINT "sites_branding_favicon_image_id_media_id_fk" FOREIGN KEY ("branding_favicon_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "sites" ADD CONSTRAINT "sites_branding_hero_image_id_media_id_fk" FOREIGN KEY ("branding_hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "sites" ADD CONSTRAINT "sites_branding_background_image_id_media_id_fk" FOREIGN KEY ("branding_background_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "authors" ADD CONSTRAINT "authors_avatar_id_media_id_fk" FOREIGN KEY ("avatar_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "sites_branding_branding_favicon_image_idx" ON "sites" USING btree ("branding_favicon_image_id");
  CREATE INDEX "sites_branding_branding_hero_image_idx" ON "sites" USING btree ("branding_hero_image_id");
  CREATE INDEX "sites_branding_branding_background_image_idx" ON "sites" USING btree ("branding_background_image_id");
  CREATE INDEX "authors_avatar_idx" ON "authors" USING btree ("avatar_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "sites" DROP CONSTRAINT "sites_branding_favicon_image_id_media_id_fk";
  
  ALTER TABLE "sites" DROP CONSTRAINT "sites_branding_hero_image_id_media_id_fk";
  
  ALTER TABLE "sites" DROP CONSTRAINT "sites_branding_background_image_id_media_id_fk";
  
  ALTER TABLE "authors" DROP CONSTRAINT "authors_avatar_id_media_id_fk";
  
  DROP INDEX "sites_branding_branding_favicon_image_idx";
  DROP INDEX "sites_branding_branding_hero_image_idx";
  DROP INDEX "sites_branding_branding_background_image_idx";
  DROP INDEX "authors_avatar_idx";
  ALTER TABLE "sites" DROP COLUMN "branding_favicon_image_id";
  ALTER TABLE "sites" DROP COLUMN "branding_hero_image_id";
  ALTER TABLE "sites" DROP COLUMN "branding_background_image_id";
  ALTER TABLE "authors" DROP COLUMN "avatar_id";`)
}
