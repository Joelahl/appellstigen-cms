import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_users_role" AS ENUM('super-admin', 'editor');
  CREATE TYPE "public"."enum_sites_template" AS ENUM('credit-card-comparison', 'loan-comparison', 'insurance-comparison');
  CREATE TYPE "public"."enum_sites_status" AS ENUM('draft', 'active', 'archived');
  CREATE TYPE "public"."enum_sites_locale" AS ENUM('sv', 'en', 'no', 'da', 'fi');
  CREATE TYPE "public"."enum_credit_cards_status" AS ENUM('published', 'draft', 'archived');
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"role" "enum_users_role" DEFAULT 'editor' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "sites_navigation" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"href" varchar NOT NULL
  );
  
  CREATE TABLE "sites" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"domain" varchar NOT NULL,
  	"template" "enum_sites_template" NOT NULL,
  	"status" "enum_sites_status" DEFAULT 'draft',
  	"locale" "enum_sites_locale" DEFAULT 'sv' NOT NULL,
  	"branding_site_name" varchar,
  	"branding_tagline" varchar,
  	"branding_logo_id" integer,
  	"branding_primary_color" varchar DEFAULT '#2563eb',
  	"branding_accent_color" varchar DEFAULT '#f59e0b',
  	"seo_default_title" varchar,
  	"seo_title_template" varchar,
  	"seo_default_description" varchar,
  	"seo_default_og_image_id" integer,
  	"seo_google_verification" varchar,
  	"tracking_ga_id" varchar,
  	"tracking_gsc_verification" varchar,
  	"affiliate_defaults_disclosure_text" varchar,
  	"affiliate_defaults_disclaimer_text" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "credit_cards_pros" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"item" varchar NOT NULL
  );
  
  CREATE TABLE "credit_cards_cons" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"item" varchar NOT NULL
  );
  
  CREATE TABLE "credit_cards" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"card_name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"status" "enum_credit_cards_status" DEFAULT 'draft',
  	"featured" boolean DEFAULT false,
  	"sort_order" numeric DEFAULT 100,
  	"issuer" varchar,
  	"card_type" varchar,
  	"card_image_url" varchar,
  	"card_image_id" integer,
  	"custom_color" varchar,
  	"unique_kw" varchar,
  	"best_for" varchar,
  	"description" varchar,
  	"editor_rating" numeric,
  	"ratings_bonus" numeric,
  	"ratings_insurance" numeric,
  	"ratings_credit_terms" numeric,
  	"ratings_fees" numeric,
  	"fees_annual_cost" varchar,
  	"fees_max_credit" varchar,
  	"fees_interest_rate" varchar,
  	"fees_interest_free_period" varchar,
  	"fees_currency_fee" varchar,
  	"fees_withdrawal_fee" varchar,
  	"fees_invoice_fee" varchar,
  	"fees_reminder_fee" varchar,
  	"fees_overdraft_fee" varchar,
  	"eligibility_min_age" varchar,
  	"eligibility_min_income" varchar,
  	"eligibility_payment_remarks" varchar,
  	"terms_text" varchar,
  	"bonus" varchar,
  	"concierge" varchar,
  	"airport_lounge" varchar,
  	"apple_pay" boolean DEFAULT false,
  	"google_pay" boolean DEFAULT false,
  	"contactless" boolean DEFAULT false,
  	"verdict" varchar,
  	"review_content" varchar,
  	"screenshot_url" varchar,
  	"bonus_title" varchar,
  	"bonus_explainer" varchar,
  	"cashback_title" varchar,
  	"cashback_explainer" varchar,
  	"affiliate_link" varchar,
  	"cta_text" varchar DEFAULT 'Ansök nu',
  	"cta_links_index" varchar,
  	"cta_links_review" varchar,
  	"cta_links_bonus" varchar,
  	"cta_links_low_rate" varchar,
  	"cta_links_without_u_c" varchar,
  	"cta_links_corporate" varchar,
  	"cta_links_fuel" varchar,
  	"cta_links_debit" varchar,
  	"cta_links_cashback" varchar,
  	"cta_links_free" varchar,
  	"cta_links_cheap" varchar,
  	"seo_meta_title" varchar,
  	"seo_meta_description" varchar,
  	"seo_og_image_url" varchar,
  	"source_source_url" varchar,
  	"source_wp_id" numeric,
  	"last_verified" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "credit_cards_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"sites_id" integer
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumbnail_url" varchar,
  	"sizes_thumbnail_width" numeric,
  	"sizes_thumbnail_height" numeric,
  	"sizes_thumbnail_mime_type" varchar,
  	"sizes_thumbnail_filesize" numeric,
  	"sizes_thumbnail_filename" varchar,
  	"sizes_card_url" varchar,
  	"sizes_card_width" numeric,
  	"sizes_card_height" numeric,
  	"sizes_card_mime_type" varchar,
  	"sizes_card_filesize" numeric,
  	"sizes_card_filename" varchar,
  	"sizes_og_url" varchar,
  	"sizes_og_width" numeric,
  	"sizes_og_height" numeric,
  	"sizes_og_mime_type" varchar,
  	"sizes_og_filesize" numeric,
  	"sizes_og_filename" varchar
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"sites_id" integer,
  	"credit_cards_id" integer,
  	"media_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sites_navigation" ADD CONSTRAINT "sites_navigation_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sites"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sites" ADD CONSTRAINT "sites_branding_logo_id_media_id_fk" FOREIGN KEY ("branding_logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "sites" ADD CONSTRAINT "sites_seo_default_og_image_id_media_id_fk" FOREIGN KEY ("seo_default_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "credit_cards_pros" ADD CONSTRAINT "credit_cards_pros_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."credit_cards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "credit_cards_cons" ADD CONSTRAINT "credit_cards_cons_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."credit_cards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "credit_cards" ADD CONSTRAINT "credit_cards_card_image_id_media_id_fk" FOREIGN KEY ("card_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "credit_cards_rels" ADD CONSTRAINT "credit_cards_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."credit_cards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "credit_cards_rels" ADD CONSTRAINT "credit_cards_rels_sites_fk" FOREIGN KEY ("sites_id") REFERENCES "public"."sites"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_sites_fk" FOREIGN KEY ("sites_id") REFERENCES "public"."sites"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_credit_cards_fk" FOREIGN KEY ("credit_cards_id") REFERENCES "public"."credit_cards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "sites_navigation_order_idx" ON "sites_navigation" USING btree ("_order");
  CREATE INDEX "sites_navigation_parent_id_idx" ON "sites_navigation" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "sites_domain_idx" ON "sites" USING btree ("domain");
  CREATE INDEX "sites_branding_branding_logo_idx" ON "sites" USING btree ("branding_logo_id");
  CREATE INDEX "sites_seo_seo_default_og_image_idx" ON "sites" USING btree ("seo_default_og_image_id");
  CREATE INDEX "sites_updated_at_idx" ON "sites" USING btree ("updated_at");
  CREATE INDEX "sites_created_at_idx" ON "sites" USING btree ("created_at");
  CREATE INDEX "credit_cards_pros_order_idx" ON "credit_cards_pros" USING btree ("_order");
  CREATE INDEX "credit_cards_pros_parent_id_idx" ON "credit_cards_pros" USING btree ("_parent_id");
  CREATE INDEX "credit_cards_cons_order_idx" ON "credit_cards_cons" USING btree ("_order");
  CREATE INDEX "credit_cards_cons_parent_id_idx" ON "credit_cards_cons" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "credit_cards_slug_idx" ON "credit_cards" USING btree ("slug");
  CREATE INDEX "credit_cards_card_image_idx" ON "credit_cards" USING btree ("card_image_id");
  CREATE INDEX "credit_cards_updated_at_idx" ON "credit_cards" USING btree ("updated_at");
  CREATE INDEX "credit_cards_created_at_idx" ON "credit_cards" USING btree ("created_at");
  CREATE INDEX "credit_cards_rels_order_idx" ON "credit_cards_rels" USING btree ("order");
  CREATE INDEX "credit_cards_rels_parent_idx" ON "credit_cards_rels" USING btree ("parent_id");
  CREATE INDEX "credit_cards_rels_path_idx" ON "credit_cards_rels" USING btree ("path");
  CREATE INDEX "credit_cards_rels_sites_id_idx" ON "credit_cards_rels" USING btree ("sites_id");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "media" USING btree ("sizes_thumbnail_filename");
  CREATE INDEX "media_sizes_card_sizes_card_filename_idx" ON "media" USING btree ("sizes_card_filename");
  CREATE INDEX "media_sizes_og_sizes_og_filename_idx" ON "media" USING btree ("sizes_og_filename");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_sites_id_idx" ON "payload_locked_documents_rels" USING btree ("sites_id");
  CREATE INDEX "payload_locked_documents_rels_credit_cards_id_idx" ON "payload_locked_documents_rels" USING btree ("credit_cards_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "sites_navigation" CASCADE;
  DROP TABLE "sites" CASCADE;
  DROP TABLE "credit_cards_pros" CASCADE;
  DROP TABLE "credit_cards_cons" CASCADE;
  DROP TABLE "credit_cards" CASCADE;
  DROP TABLE "credit_cards_rels" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TYPE "public"."enum_users_role";
  DROP TYPE "public"."enum_sites_template";
  DROP TYPE "public"."enum_sites_status";
  DROP TYPE "public"."enum_sites_locale";
  DROP TYPE "public"."enum_credit_cards_status";`)
}
