import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "sites" ADD COLUMN "branding_logo_light_id" integer;
  ALTER TABLE "sites" ADD COLUMN "branding_logo_light_url" varchar;
  ALTER TABLE "sites" ADD COLUMN "company_legal_name" varchar;
  ALTER TABLE "sites" ADD COLUMN "company_org_number" varchar;
  ALTER TABLE "sites" ADD COLUMN "company_address" varchar;
  ALTER TABLE "sites" ADD COLUMN "company_email" varchar;
  ALTER TABLE "sites" ADD COLUMN "company_phone" varchar;
  ALTER TABLE "sites" ADD COLUMN "company_opening_hours" varchar;
  ALTER TABLE "sites" ADD CONSTRAINT "sites_branding_logo_light_id_media_id_fk" FOREIGN KEY ("branding_logo_light_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "sites_branding_branding_logo_light_idx" ON "sites" USING btree ("branding_logo_light_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "sites" DROP CONSTRAINT "sites_branding_logo_light_id_media_id_fk";
  
  DROP INDEX "sites_branding_branding_logo_light_idx";
  ALTER TABLE "sites" DROP COLUMN "branding_logo_light_id";
  ALTER TABLE "sites" DROP COLUMN "branding_logo_light_url";
  ALTER TABLE "sites" DROP COLUMN "company_legal_name";
  ALTER TABLE "sites" DROP COLUMN "company_org_number";
  ALTER TABLE "sites" DROP COLUMN "company_address";
  ALTER TABLE "sites" DROP COLUMN "company_email";
  ALTER TABLE "sites" DROP COLUMN "company_phone";
  ALTER TABLE "sites" DROP COLUMN "company_opening_hours";`)
}
