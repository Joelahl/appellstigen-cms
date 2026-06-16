import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Add the SEO planning collections: `topic-clusters` (a site's pillar topics)
 * and `content-plan` (planned content items). Both are site-scoped internal
 * planning records — NO draft/publish versioning (so no `_v` tables); their
 * `status` field is the workflow.
 *
 * Hand-written (not via migrate:create) to avoid the pre-existing snapshot
 * drift in this repo — this migration only adds the two new tables + their
 * enums + the secondaryKeywords array table + locked-documents rel columns.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  CREATE TYPE "public"."enum_topic_clusters_priority" AS ENUM('high', 'medium', 'low');
  CREATE TYPE "public"."enum_topic_clusters_status" AS ENUM('planned', 'in-progress', 'established');
  CREATE TYPE "public"."enum_content_plan_search_intent" AS ENUM('informational', 'commercial', 'transactional', 'navigational');
  CREATE TYPE "public"."enum_content_plan_funnel_stage" AS ENUM('tofu', 'mofu', 'bofu');
  CREATE TYPE "public"."enum_content_plan_content_type" AS ENUM('pillar', 'category', 'comparison', 'review', 'guide', 'listicle', 'faq', 'glossary', 'news');
  CREATE TYPE "public"."enum_content_plan_priority" AS ENUM('high', 'medium', 'low');
  CREATE TYPE "public"."enum_content_plan_status" AS ENUM('idea', 'planned', 'briefed', 'drafting', 'review', 'published');

  CREATE TABLE "topic_clusters" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"slug" varchar,
  	"site_id" integer,
  	"description" varchar,
  	"pillar_keyword" varchar,
  	"pillar_page_id" integer,
  	"priority" "enum_topic_clusters_priority" DEFAULT 'medium',
  	"status" "enum_topic_clusters_status" DEFAULT 'planned',
  	"notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "content_plan_secondary_keywords" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"keyword" varchar
  );

  CREATE TABLE "content_plan" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"site_id" integer,
  	"cluster_id" integer,
  	"primary_keyword" varchar,
  	"search_intent" "enum_content_plan_search_intent",
  	"funnel_stage" "enum_content_plan_funnel_stage",
  	"content_type" "enum_content_plan_content_type",
  	"target_slug" varchar,
  	"priority" "enum_content_plan_priority" DEFAULT 'medium',
  	"status" "enum_content_plan_status" DEFAULT 'idea',
  	"page_id" integer,
  	"author_id" integer,
  	"target_publish_date" timestamp(3) with time zone,
  	"metrics_search_volume" numeric,
  	"metrics_keyword_difficulty" numeric,
  	"notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "topic_clusters_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "content_plan_id" integer;

  ALTER TABLE "topic_clusters" ADD CONSTRAINT "topic_clusters_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "topic_clusters" ADD CONSTRAINT "topic_clusters_pillar_page_id_pages_id_fk" FOREIGN KEY ("pillar_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "content_plan_secondary_keywords" ADD CONSTRAINT "content_plan_secondary_keywords_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."content_plan"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "content_plan" ADD CONSTRAINT "content_plan_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "content_plan" ADD CONSTRAINT "content_plan_cluster_id_topic_clusters_id_fk" FOREIGN KEY ("cluster_id") REFERENCES "public"."topic_clusters"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "content_plan" ADD CONSTRAINT "content_plan_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "content_plan" ADD CONSTRAINT "content_plan_author_id_authors_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."authors"("id") ON DELETE set null ON UPDATE no action;

  CREATE UNIQUE INDEX "topic_clusters_slug_idx" ON "topic_clusters" USING btree ("slug");
  CREATE INDEX "topic_clusters_site_idx" ON "topic_clusters" USING btree ("site_id");
  CREATE INDEX "topic_clusters_pillar_page_idx" ON "topic_clusters" USING btree ("pillar_page_id");
  CREATE INDEX "topic_clusters_updated_at_idx" ON "topic_clusters" USING btree ("updated_at");
  CREATE INDEX "topic_clusters_created_at_idx" ON "topic_clusters" USING btree ("created_at");

  CREATE INDEX "content_plan_secondary_keywords_order_idx" ON "content_plan_secondary_keywords" USING btree ("_order");
  CREATE INDEX "content_plan_secondary_keywords_parent_id_idx" ON "content_plan_secondary_keywords" USING btree ("_parent_id");

  CREATE UNIQUE INDEX "content_plan_slug_idx" ON "content_plan" USING btree ("slug");
  CREATE INDEX "content_plan_site_idx" ON "content_plan" USING btree ("site_id");
  CREATE INDEX "content_plan_cluster_idx" ON "content_plan" USING btree ("cluster_id");
  CREATE INDEX "content_plan_page_idx" ON "content_plan" USING btree ("page_id");
  CREATE INDEX "content_plan_author_idx" ON "content_plan" USING btree ("author_id");
  CREATE INDEX "content_plan_updated_at_idx" ON "content_plan" USING btree ("updated_at");
  CREATE INDEX "content_plan_created_at_idx" ON "content_plan" USING btree ("created_at");

  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_topic_clusters_fk" FOREIGN KEY ("topic_clusters_id") REFERENCES "public"."topic_clusters"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_content_plan_fk" FOREIGN KEY ("content_plan_id") REFERENCES "public"."content_plan"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_topic_clusters_id_idx" ON "payload_locked_documents_rels" USING btree ("topic_clusters_id");
  CREATE INDEX "payload_locked_documents_rels_content_plan_id_idx" ON "payload_locked_documents_rels" USING btree ("content_plan_id");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  -- Drop FK constraints before tables to avoid cascade-then-explicit-drop conflicts
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_topic_clusters_fk";
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_content_plan_fk";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_topic_clusters_id_idx";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_content_plan_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "topic_clusters_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "content_plan_id";
  DROP TABLE IF EXISTS "content_plan_secondary_keywords" CASCADE;
  DROP TABLE IF EXISTS "content_plan" CASCADE;
  DROP TABLE IF EXISTS "topic_clusters" CASCADE;
  DROP TYPE IF EXISTS "public"."enum_topic_clusters_priority";
  DROP TYPE IF EXISTS "public"."enum_topic_clusters_status";
  DROP TYPE IF EXISTS "public"."enum_content_plan_search_intent";
  DROP TYPE IF EXISTS "public"."enum_content_plan_funnel_stage";
  DROP TYPE IF EXISTS "public"."enum_content_plan_content_type";
  DROP TYPE IF EXISTS "public"."enum_content_plan_priority";
  DROP TYPE IF EXISTS "public"."enum_content_plan_status";`)
}
