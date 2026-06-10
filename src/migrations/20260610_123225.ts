import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "authors" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"title" varchar,
  	"avatar_url" varchar,
  	"bio" varchar,
  	"email" varchar,
  	"linkedin" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "sites" ADD COLUMN "branding_favicon_url" varchar;
  ALTER TABLE "sites" ADD COLUMN "branding_hero_image_url" varchar;
  ALTER TABLE "sites" ADD COLUMN "branding_background_image_url" varchar;
  ALTER TABLE "sites" ADD COLUMN "about_heading" varchar DEFAULT 'Vad vi gör';
  ALTER TABLE "sites" ADD COLUMN "about_text" varchar;
  ALTER TABLE "pages" ADD COLUMN "author_id" integer;
  ALTER TABLE "pages" ADD COLUMN "best_card_id" integer;
  ALTER TABLE "pages" ADD COLUMN "best_card_summary" varchar;
  ALTER TABLE "_pages_v" ADD COLUMN "version_author_id" integer;
  ALTER TABLE "_pages_v" ADD COLUMN "version_best_card_id" integer;
  ALTER TABLE "_pages_v" ADD COLUMN "version_best_card_summary" varchar;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "authors_id" integer;
  CREATE INDEX "authors_updated_at_idx" ON "authors" USING btree ("updated_at");
  CREATE INDEX "authors_created_at_idx" ON "authors" USING btree ("created_at");
  ALTER TABLE "pages" ADD CONSTRAINT "pages_author_id_authors_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."authors"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_best_card_id_credit_cards_id_fk" FOREIGN KEY ("best_card_id") REFERENCES "public"."credit_cards"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_author_id_authors_id_fk" FOREIGN KEY ("version_author_id") REFERENCES "public"."authors"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_best_card_id_credit_cards_id_fk" FOREIGN KEY ("version_best_card_id") REFERENCES "public"."credit_cards"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_authors_fk" FOREIGN KEY ("authors_id") REFERENCES "public"."authors"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_author_idx" ON "pages" USING btree ("author_id");
  CREATE INDEX "pages_best_card_idx" ON "pages" USING btree ("best_card_id");
  CREATE INDEX "_pages_v_version_version_author_idx" ON "_pages_v" USING btree ("version_author_id");
  CREATE INDEX "_pages_v_version_version_best_card_idx" ON "_pages_v" USING btree ("version_best_card_id");
  CREATE INDEX "payload_locked_documents_rels_authors_id_idx" ON "payload_locked_documents_rels" USING btree ("authors_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "authors" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "authors" CASCADE;
  ALTER TABLE "pages" DROP CONSTRAINT "pages_author_id_authors_id_fk";
  
  ALTER TABLE "pages" DROP CONSTRAINT "pages_best_card_id_credit_cards_id_fk";
  
  ALTER TABLE "_pages_v" DROP CONSTRAINT "_pages_v_version_author_id_authors_id_fk";
  
  ALTER TABLE "_pages_v" DROP CONSTRAINT "_pages_v_version_best_card_id_credit_cards_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_authors_fk";
  
  DROP INDEX "pages_author_idx";
  DROP INDEX "pages_best_card_idx";
  DROP INDEX "_pages_v_version_version_author_idx";
  DROP INDEX "_pages_v_version_version_best_card_idx";
  DROP INDEX "payload_locked_documents_rels_authors_id_idx";
  ALTER TABLE "sites" DROP COLUMN "branding_favicon_url";
  ALTER TABLE "sites" DROP COLUMN "branding_hero_image_url";
  ALTER TABLE "sites" DROP COLUMN "branding_background_image_url";
  ALTER TABLE "sites" DROP COLUMN "about_heading";
  ALTER TABLE "sites" DROP COLUMN "about_text";
  ALTER TABLE "pages" DROP COLUMN "author_id";
  ALTER TABLE "pages" DROP COLUMN "best_card_id";
  ALTER TABLE "pages" DROP COLUMN "best_card_summary";
  ALTER TABLE "_pages_v" DROP COLUMN "version_author_id";
  ALTER TABLE "_pages_v" DROP COLUMN "version_best_card_id";
  ALTER TABLE "_pages_v" DROP COLUMN "version_best_card_summary";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "authors_id";`)
}
