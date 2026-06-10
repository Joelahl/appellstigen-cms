import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum__credit_cards_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__pages_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__pages_v_version_page_type" AS ENUM('homepage', 'category', 'info', 'legal', 'other');
  CREATE TABLE "_credit_cards_v_version_pros" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"item" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_credit_cards_v_version_cons" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"item" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_credit_cards_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_card_name" varchar,
  	"version_slug" varchar,
  	"version_status" "enum__credit_cards_v_version_status" DEFAULT 'published',
  	"version_featured" boolean DEFAULT false,
  	"version_sort_order" numeric DEFAULT 100,
  	"version_issuer" varchar,
  	"version_card_type" varchar,
  	"version_card_image_url" varchar,
  	"version_card_image_id" integer,
  	"version_custom_color" varchar,
  	"version_unique_kw" varchar,
  	"version_best_for" varchar,
  	"version_description" varchar,
  	"version_editor_rating" numeric,
  	"version_ratings_bonus" numeric,
  	"version_ratings_insurance" numeric,
  	"version_ratings_credit_terms" numeric,
  	"version_ratings_fees" numeric,
  	"version_fees_annual_cost" varchar,
  	"version_fees_max_credit" varchar,
  	"version_fees_interest_rate" varchar,
  	"version_fees_interest_free_period" varchar,
  	"version_fees_currency_fee" varchar,
  	"version_fees_withdrawal_fee" varchar,
  	"version_fees_invoice_fee" varchar,
  	"version_fees_reminder_fee" varchar,
  	"version_fees_overdraft_fee" varchar,
  	"version_eligibility_min_age" varchar,
  	"version_eligibility_min_income" varchar,
  	"version_eligibility_payment_remarks" varchar,
  	"version_terms_text" varchar,
  	"version_bonus" varchar,
  	"version_concierge" varchar,
  	"version_airport_lounge" varchar,
  	"version_apple_pay" boolean DEFAULT false,
  	"version_google_pay" boolean DEFAULT false,
  	"version_contactless" boolean DEFAULT false,
  	"version_verdict" varchar,
  	"version_review_content" varchar,
  	"version_screenshot_url" varchar,
  	"version_bonus_title" varchar,
  	"version_bonus_explainer" varchar,
  	"version_cashback_title" varchar,
  	"version_cashback_explainer" varchar,
  	"version_affiliate_link" varchar,
  	"version_cta_text" varchar DEFAULT 'Ansök nu',
  	"version_cta_links_index" varchar,
  	"version_cta_links_review" varchar,
  	"version_cta_links_bonus" varchar,
  	"version_cta_links_low_rate" varchar,
  	"version_cta_links_without_u_c" varchar,
  	"version_cta_links_corporate" varchar,
  	"version_cta_links_fuel" varchar,
  	"version_cta_links_debit" varchar,
  	"version_cta_links_cashback" varchar,
  	"version_cta_links_free" varchar,
  	"version_cta_links_cheap" varchar,
  	"version_seo_meta_title" varchar,
  	"version_seo_meta_description" varchar,
  	"version_seo_og_image_url" varchar,
  	"version_source_source_url" varchar,
  	"version_source_wp_id" numeric,
  	"version_last_verified" timestamp(3) with time zone,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__credit_cards_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_credit_cards_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"sites_id" integer
  );
  
  CREATE TABLE "_pages_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_status" "enum__pages_v_version_status" DEFAULT 'published',
  	"version_page_type" "enum__pages_v_version_page_type" DEFAULT 'info',
  	"version_menu_order" numeric DEFAULT 0,
  	"version_site_id" integer,
  	"version_excerpt" varchar,
  	"version_content" varchar,
  	"version_seo_meta_title" varchar,
  	"version_seo_meta_description" varchar,
  	"version_seo_og_image_url" varchar,
  	"version_source_source_url" varchar,
  	"version_source_wp_id" numeric,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__pages_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  ALTER TABLE "credit_cards" ALTER COLUMN "status" SET DATA TYPE text;
  ALTER TABLE "credit_cards" ALTER COLUMN "status" SET DEFAULT 'published'::text;
  ALTER TABLE "credit_cards" ALTER COLUMN "_status" SET DATA TYPE text;
  ALTER TABLE "credit_cards" ALTER COLUMN "_status" SET DEFAULT 'draft'::text;
  DROP TYPE "public"."enum_credit_cards_status";
  CREATE TYPE "public"."enum_credit_cards_status" AS ENUM('draft', 'published');
  ALTER TABLE "credit_cards" ALTER COLUMN "status" SET DEFAULT 'published'::"public"."enum_credit_cards_status";
  ALTER TABLE "credit_cards" ALTER COLUMN "status" SET DATA TYPE "public"."enum_credit_cards_status" USING "status"::"public"."enum_credit_cards_status";
  ALTER TABLE "credit_cards" ALTER COLUMN "_status" SET DEFAULT 'draft'::"public"."enum_credit_cards_status";
  ALTER TABLE "credit_cards" ALTER COLUMN "_status" SET DATA TYPE "public"."enum_credit_cards_status" USING "_status"::"public"."enum_credit_cards_status";
  ALTER TABLE "pages" ALTER COLUMN "status" SET DATA TYPE text;
  ALTER TABLE "pages" ALTER COLUMN "status" SET DEFAULT 'published'::text;
  ALTER TABLE "pages" ALTER COLUMN "_status" SET DATA TYPE text;
  ALTER TABLE "pages" ALTER COLUMN "_status" SET DEFAULT 'draft'::text;
  DROP TYPE "public"."enum_pages_status";
  CREATE TYPE "public"."enum_pages_status" AS ENUM('draft', 'published');
  ALTER TABLE "pages" ALTER COLUMN "status" SET DEFAULT 'published'::"public"."enum_pages_status";
  ALTER TABLE "pages" ALTER COLUMN "status" SET DATA TYPE "public"."enum_pages_status" USING "status"::"public"."enum_pages_status";
  ALTER TABLE "pages" ALTER COLUMN "_status" SET DEFAULT 'draft'::"public"."enum_pages_status";
  ALTER TABLE "pages" ALTER COLUMN "_status" SET DATA TYPE "public"."enum_pages_status" USING "_status"::"public"."enum_pages_status";
  ALTER TABLE "credit_cards_pros" ALTER COLUMN "item" DROP NOT NULL;
  ALTER TABLE "credit_cards_cons" ALTER COLUMN "item" DROP NOT NULL;
  ALTER TABLE "credit_cards" ALTER COLUMN "card_name" DROP NOT NULL;
  ALTER TABLE "credit_cards" ALTER COLUMN "slug" DROP NOT NULL;
  ALTER TABLE "pages" ALTER COLUMN "title" DROP NOT NULL;
  ALTER TABLE "pages" ALTER COLUMN "slug" DROP NOT NULL;
  ALTER TABLE "users" ADD COLUMN "enable_a_p_i_key" boolean;
  ALTER TABLE "users" ADD COLUMN "api_key" varchar;
  ALTER TABLE "users" ADD COLUMN "api_key_index" varchar;
  ALTER TABLE "credit_cards" ADD COLUMN "_status" "enum_credit_cards_status" DEFAULT 'draft';
  ALTER TABLE "pages" ADD COLUMN "_status" "enum_pages_status" DEFAULT 'draft';
  ALTER TABLE "_credit_cards_v_version_pros" ADD CONSTRAINT "_credit_cards_v_version_pros_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_credit_cards_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_credit_cards_v_version_cons" ADD CONSTRAINT "_credit_cards_v_version_cons_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_credit_cards_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_credit_cards_v" ADD CONSTRAINT "_credit_cards_v_parent_id_credit_cards_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."credit_cards"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_credit_cards_v" ADD CONSTRAINT "_credit_cards_v_version_card_image_id_media_id_fk" FOREIGN KEY ("version_card_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_credit_cards_v_rels" ADD CONSTRAINT "_credit_cards_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_credit_cards_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_credit_cards_v_rels" ADD CONSTRAINT "_credit_cards_v_rels_sites_fk" FOREIGN KEY ("sites_id") REFERENCES "public"."sites"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_parent_id_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_site_id_sites_id_fk" FOREIGN KEY ("version_site_id") REFERENCES "public"."sites"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "_credit_cards_v_version_pros_order_idx" ON "_credit_cards_v_version_pros" USING btree ("_order");
  CREATE INDEX "_credit_cards_v_version_pros_parent_id_idx" ON "_credit_cards_v_version_pros" USING btree ("_parent_id");
  CREATE INDEX "_credit_cards_v_version_cons_order_idx" ON "_credit_cards_v_version_cons" USING btree ("_order");
  CREATE INDEX "_credit_cards_v_version_cons_parent_id_idx" ON "_credit_cards_v_version_cons" USING btree ("_parent_id");
  CREATE INDEX "_credit_cards_v_parent_idx" ON "_credit_cards_v" USING btree ("parent_id");
  CREATE INDEX "_credit_cards_v_version_version_slug_idx" ON "_credit_cards_v" USING btree ("version_slug");
  CREATE INDEX "_credit_cards_v_version_version_card_image_idx" ON "_credit_cards_v" USING btree ("version_card_image_id");
  CREATE INDEX "_credit_cards_v_version_version_updated_at_idx" ON "_credit_cards_v" USING btree ("version_updated_at");
  CREATE INDEX "_credit_cards_v_version_version_created_at_idx" ON "_credit_cards_v" USING btree ("version_created_at");
  CREATE INDEX "_credit_cards_v_version_version__status_idx" ON "_credit_cards_v" USING btree ("version__status");
  CREATE INDEX "_credit_cards_v_created_at_idx" ON "_credit_cards_v" USING btree ("created_at");
  CREATE INDEX "_credit_cards_v_updated_at_idx" ON "_credit_cards_v" USING btree ("updated_at");
  CREATE INDEX "_credit_cards_v_latest_idx" ON "_credit_cards_v" USING btree ("latest");
  CREATE INDEX "_credit_cards_v_autosave_idx" ON "_credit_cards_v" USING btree ("autosave");
  CREATE INDEX "_credit_cards_v_rels_order_idx" ON "_credit_cards_v_rels" USING btree ("order");
  CREATE INDEX "_credit_cards_v_rels_parent_idx" ON "_credit_cards_v_rels" USING btree ("parent_id");
  CREATE INDEX "_credit_cards_v_rels_path_idx" ON "_credit_cards_v_rels" USING btree ("path");
  CREATE INDEX "_credit_cards_v_rels_sites_id_idx" ON "_credit_cards_v_rels" USING btree ("sites_id");
  CREATE INDEX "_pages_v_parent_idx" ON "_pages_v" USING btree ("parent_id");
  CREATE INDEX "_pages_v_version_version_slug_idx" ON "_pages_v" USING btree ("version_slug");
  CREATE INDEX "_pages_v_version_version_site_idx" ON "_pages_v" USING btree ("version_site_id");
  CREATE INDEX "_pages_v_version_version_updated_at_idx" ON "_pages_v" USING btree ("version_updated_at");
  CREATE INDEX "_pages_v_version_version_created_at_idx" ON "_pages_v" USING btree ("version_created_at");
  CREATE INDEX "_pages_v_version_version__status_idx" ON "_pages_v" USING btree ("version__status");
  CREATE INDEX "_pages_v_created_at_idx" ON "_pages_v" USING btree ("created_at");
  CREATE INDEX "_pages_v_updated_at_idx" ON "_pages_v" USING btree ("updated_at");
  CREATE INDEX "_pages_v_latest_idx" ON "_pages_v" USING btree ("latest");
  CREATE INDEX "_pages_v_autosave_idx" ON "_pages_v" USING btree ("autosave");
  CREATE INDEX "credit_cards__status_idx" ON "credit_cards" USING btree ("_status");
  CREATE INDEX "pages__status_idx" ON "pages" USING btree ("_status");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "_credit_cards_v_version_pros" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_credit_cards_v_version_cons" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_credit_cards_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_credit_cards_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "_credit_cards_v_version_pros" CASCADE;
  DROP TABLE "_credit_cards_v_version_cons" CASCADE;
  DROP TABLE "_credit_cards_v" CASCADE;
  DROP TABLE "_credit_cards_v_rels" CASCADE;
  DROP TABLE "_pages_v" CASCADE;
  ALTER TABLE "credit_cards" ALTER COLUMN "status" SET DATA TYPE text;
  ALTER TABLE "credit_cards" ALTER COLUMN "status" SET DEFAULT 'draft'::text;
  DROP TYPE "public"."enum_credit_cards_status";
  CREATE TYPE "public"."enum_credit_cards_status" AS ENUM('published', 'draft', 'archived');
  ALTER TABLE "credit_cards" ALTER COLUMN "status" SET DEFAULT 'draft'::"public"."enum_credit_cards_status";
  ALTER TABLE "credit_cards" ALTER COLUMN "status" SET DATA TYPE "public"."enum_credit_cards_status" USING "status"::"public"."enum_credit_cards_status";
  ALTER TABLE "pages" ALTER COLUMN "status" SET DATA TYPE text;
  ALTER TABLE "pages" ALTER COLUMN "status" SET DEFAULT 'draft'::text;
  DROP TYPE "public"."enum_pages_status";
  CREATE TYPE "public"."enum_pages_status" AS ENUM('published', 'draft', 'archived');
  ALTER TABLE "pages" ALTER COLUMN "status" SET DEFAULT 'draft'::"public"."enum_pages_status";
  ALTER TABLE "pages" ALTER COLUMN "status" SET DATA TYPE "public"."enum_pages_status" USING "status"::"public"."enum_pages_status";
  DROP INDEX "credit_cards__status_idx";
  DROP INDEX "pages__status_idx";
  ALTER TABLE "credit_cards_pros" ALTER COLUMN "item" SET NOT NULL;
  ALTER TABLE "credit_cards_cons" ALTER COLUMN "item" SET NOT NULL;
  ALTER TABLE "credit_cards" ALTER COLUMN "card_name" SET NOT NULL;
  ALTER TABLE "credit_cards" ALTER COLUMN "slug" SET NOT NULL;
  ALTER TABLE "pages" ALTER COLUMN "title" SET NOT NULL;
  ALTER TABLE "pages" ALTER COLUMN "slug" SET NOT NULL;
  ALTER TABLE "users" DROP COLUMN "enable_a_p_i_key";
  ALTER TABLE "users" DROP COLUMN "api_key";
  ALTER TABLE "users" DROP COLUMN "api_key_index";
  ALTER TABLE "credit_cards" DROP COLUMN "_status";
  ALTER TABLE "pages" DROP COLUMN "_status";
  DROP TYPE "public"."enum__credit_cards_v_version_status";
  DROP TYPE "public"."enum__pages_v_version_status";
  DROP TYPE "public"."enum__pages_v_version_page_type";`)
}
