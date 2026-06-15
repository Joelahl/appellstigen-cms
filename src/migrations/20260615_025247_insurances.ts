import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  CREATE TYPE "public"."enum_insurances_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__insurances_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE "insurances_highlights" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"item" varchar
  );
  CREATE TABLE "insurances_pros" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"item" varchar
  );
  CREATE TABLE "insurances_cons" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"item" varchar
  );
  CREATE TABLE "insurances" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"insurance_name" varchar,
  	"slug" varchar,
  	"featured" boolean DEFAULT false,
  	"sort_order" numeric DEFAULT 100,
  	"provider" varchar,
  	"insurance_type" varchar,
  	"best_for" varchar,
  	"logo_id" integer,
  	"logo_url" varchar,
  	"editor_rating" numeric,
  	"monthly_premium" varchar,
  	"deductible" varchar,
  	"coverage_amount" varchar,
  	"verdict" varchar,
  	"review_content" jsonb,
  	"affiliate_link" varchar,
  	"cta_text" varchar DEFAULT 'Få offert',
  	"seo_meta_title" varchar,
  	"seo_meta_description" varchar,
  	"seo_og_image_url_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_insurances_status" DEFAULT 'draft'
  );
  CREATE TABLE "_insurances_v_version_highlights" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"item" varchar,
  	"_uuid" varchar
  );
  CREATE TABLE "_insurances_v_version_pros" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"item" varchar,
  	"_uuid" varchar
  );
  CREATE TABLE "_insurances_v_version_cons" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"item" varchar,
  	"_uuid" varchar
  );
  CREATE TABLE "_insurances_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_insurance_name" varchar,
  	"version_slug" varchar,
  	"version_featured" boolean DEFAULT false,
  	"version_sort_order" numeric DEFAULT 100,
  	"version_provider" varchar,
  	"version_insurance_type" varchar,
  	"version_best_for" varchar,
  	"version_logo_id" integer,
  	"version_logo_url" varchar,
  	"version_editor_rating" numeric,
  	"version_monthly_premium" varchar,
  	"version_deductible" varchar,
  	"version_coverage_amount" varchar,
  	"version_verdict" varchar,
  	"version_review_content" jsonb,
  	"version_affiliate_link" varchar,
  	"version_cta_text" varchar DEFAULT 'Få offert',
  	"version_seo_meta_title" varchar,
  	"version_seo_meta_description" varchar,
  	"version_seo_og_image_url_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__insurances_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "insurances_id" integer;
  ALTER TABLE "insurances_highlights" ADD CONSTRAINT "insurances_highlights_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."insurances"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "insurances_pros" ADD CONSTRAINT "insurances_pros_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."insurances"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "insurances_cons" ADD CONSTRAINT "insurances_cons_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."insurances"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "insurances" ADD CONSTRAINT "insurances_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "insurances" ADD CONSTRAINT "insurances_seo_og_image_url_id_media_id_fk" FOREIGN KEY ("seo_og_image_url_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_insurances_v_version_highlights" ADD CONSTRAINT "_insurances_v_version_highlights_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_insurances_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_insurances_v_version_pros" ADD CONSTRAINT "_insurances_v_version_pros_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_insurances_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_insurances_v_version_cons" ADD CONSTRAINT "_insurances_v_version_cons_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_insurances_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_insurances_v" ADD CONSTRAINT "_insurances_v_parent_id_insurances_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."insurances"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_insurances_v" ADD CONSTRAINT "_insurances_v_version_logo_id_media_id_fk" FOREIGN KEY ("version_logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_insurances_v" ADD CONSTRAINT "_insurances_v_version_seo_og_image_url_id_media_id_fk" FOREIGN KEY ("version_seo_og_image_url_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "insurances_highlights_order_idx" ON "insurances_highlights" USING btree ("_order");
  CREATE INDEX "insurances_highlights_parent_id_idx" ON "insurances_highlights" USING btree ("_parent_id");
  CREATE INDEX "insurances_pros_order_idx" ON "insurances_pros" USING btree ("_order");
  CREATE INDEX "insurances_pros_parent_id_idx" ON "insurances_pros" USING btree ("_parent_id");
  CREATE INDEX "insurances_cons_order_idx" ON "insurances_cons" USING btree ("_order");
  CREATE INDEX "insurances_cons_parent_id_idx" ON "insurances_cons" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "insurances_slug_idx" ON "insurances" USING btree ("slug");
  CREATE INDEX "insurances_logo_idx" ON "insurances" USING btree ("logo_id");
  CREATE INDEX "insurances_seo_seo_og_image_url_idx" ON "insurances" USING btree ("seo_og_image_url_id");
  CREATE INDEX "insurances_updated_at_idx" ON "insurances" USING btree ("updated_at");
  CREATE INDEX "insurances_created_at_idx" ON "insurances" USING btree ("created_at");
  CREATE INDEX "insurances__status_idx" ON "insurances" USING btree ("_status");
  CREATE INDEX "_insurances_v_version_highlights_order_idx" ON "_insurances_v_version_highlights" USING btree ("_order");
  CREATE INDEX "_insurances_v_version_highlights_parent_id_idx" ON "_insurances_v_version_highlights" USING btree ("_parent_id");
  CREATE INDEX "_insurances_v_version_pros_order_idx" ON "_insurances_v_version_pros" USING btree ("_order");
  CREATE INDEX "_insurances_v_version_pros_parent_id_idx" ON "_insurances_v_version_pros" USING btree ("_parent_id");
  CREATE INDEX "_insurances_v_version_cons_order_idx" ON "_insurances_v_version_cons" USING btree ("_order");
  CREATE INDEX "_insurances_v_version_cons_parent_id_idx" ON "_insurances_v_version_cons" USING btree ("_parent_id");
  CREATE INDEX "_insurances_v_parent_idx" ON "_insurances_v" USING btree ("parent_id");
  CREATE INDEX "_insurances_v_version_version_slug_idx" ON "_insurances_v" USING btree ("version_slug");
  CREATE INDEX "_insurances_v_version_version_logo_idx" ON "_insurances_v" USING btree ("version_logo_id");
  CREATE INDEX "_insurances_v_version_seo_version_seo_og_image_url_idx" ON "_insurances_v" USING btree ("version_seo_og_image_url_id");
  CREATE INDEX "_insurances_v_version_version_updated_at_idx" ON "_insurances_v" USING btree ("version_updated_at");
  CREATE INDEX "_insurances_v_version_version_created_at_idx" ON "_insurances_v" USING btree ("version_created_at");
  CREATE INDEX "_insurances_v_version_version__status_idx" ON "_insurances_v" USING btree ("version__status");
  CREATE INDEX "_insurances_v_created_at_idx" ON "_insurances_v" USING btree ("created_at");
  CREATE INDEX "_insurances_v_updated_at_idx" ON "_insurances_v" USING btree ("updated_at");
  CREATE INDEX "_insurances_v_latest_idx" ON "_insurances_v" USING btree ("latest");
  CREATE INDEX "_insurances_v_autosave_idx" ON "_insurances_v" USING btree ("autosave");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_insurances_fk" FOREIGN KEY ("insurances_id") REFERENCES "public"."insurances"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_insurances_id_idx" ON "payload_locked_documents_rels" USING btree ("insurances_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "insurances_highlights" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "insurances_pros" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "insurances_cons" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "insurances" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_insurances_v_version_highlights" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_insurances_v_version_pros" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_insurances_v_version_cons" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_insurances_v" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "insurances_highlights" CASCADE;
  DROP TABLE "insurances_pros" CASCADE;
  DROP TABLE "insurances_cons" CASCADE;
  DROP TABLE "insurances" CASCADE;
  DROP TABLE "_insurances_v_version_highlights" CASCADE;
  DROP TABLE "_insurances_v_version_pros" CASCADE;
  DROP TABLE "_insurances_v_version_cons" CASCADE;
  DROP TABLE "_insurances_v" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_insurances_fk";
  DROP INDEX "payload_locked_documents_rels_insurances_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "insurances_id";
  DROP TYPE "public"."enum_insurances_status";
  DROP TYPE "public"."enum__insurances_v_version_status";`)
}
