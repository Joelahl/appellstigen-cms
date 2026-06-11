import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Adds:
 *  1. `best_card_title` — editable heading for the "Vilket är bäst?" box
 *     (on both `pages` and the version table `_pages_v`).
 *  2. `prose` block — Lexical rich-text (jsonb) for editorial content + links.
 *  3. `image` block — upload (→ media) with alt, caption and size.
 *
 * The DDL mirrors exactly what Payload's own migrate:create produces for block
 * tables (see 20260610_120344), including the parallel `_pages_v_blocks_*`
 * version tables, FKs, enums and indexes. Existing block tables are NOT touched.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  -- 1. Best-box title -----------------------------------------------------------
  ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "best_card_title" varchar;
  ALTER TABLE "_pages_v" ADD COLUMN IF NOT EXISTS "version_best_card_title" varchar;

  -- 2. Enums for the image-block size selector ----------------------------------
  CREATE TYPE "public"."enum_pages_blocks_image_size" AS ENUM('full', 'half', 'small');
  CREATE TYPE "public"."enum__pages_v_blocks_image_size" AS ENUM('full', 'half', 'small');

  -- 3. prose (Lexical rich text) ------------------------------------------------
  CREATE TABLE "pages_blocks_prose" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"content" jsonb,
  	"block_name" varchar
  );

  CREATE TABLE "_pages_v_blocks_prose" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"content" jsonb,
  	"_uuid" varchar,
  	"block_name" varchar
  );

  -- 4. image block --------------------------------------------------------------
  CREATE TABLE "pages_blocks_image" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"alt" varchar,
  	"caption" varchar,
  	"size" "enum_pages_blocks_image_size" DEFAULT 'full',
  	"block_name" varchar
  );

  CREATE TABLE "_pages_v_blocks_image" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"alt" varchar,
  	"caption" varchar,
  	"size" "enum__pages_v_blocks_image_size" DEFAULT 'full',
  	"_uuid" varchar,
  	"block_name" varchar
  );

  -- Foreign keys ----------------------------------------------------------------
  ALTER TABLE "pages_blocks_prose" ADD CONSTRAINT "pages_blocks_prose_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_prose" ADD CONSTRAINT "_pages_v_blocks_prose_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_image" ADD CONSTRAINT "pages_blocks_image_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_image" ADD CONSTRAINT "pages_blocks_image_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_image" ADD CONSTRAINT "_pages_v_blocks_image_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_image" ADD CONSTRAINT "_pages_v_blocks_image_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;

  -- Indexes ---------------------------------------------------------------------
  CREATE INDEX "pages_blocks_prose_order_idx" ON "pages_blocks_prose" USING btree ("_order");
  CREATE INDEX "pages_blocks_prose_parent_id_idx" ON "pages_blocks_prose" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_prose_path_idx" ON "pages_blocks_prose" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_prose_order_idx" ON "_pages_v_blocks_prose" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_prose_parent_id_idx" ON "_pages_v_blocks_prose" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_prose_path_idx" ON "_pages_v_blocks_prose" USING btree ("_path");
  CREATE INDEX "pages_blocks_image_order_idx" ON "pages_blocks_image" USING btree ("_order");
  CREATE INDEX "pages_blocks_image_parent_id_idx" ON "pages_blocks_image" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_image_path_idx" ON "pages_blocks_image" USING btree ("_path");
  CREATE INDEX "pages_blocks_image_image_idx" ON "pages_blocks_image" USING btree ("image_id");
  CREATE INDEX "_pages_v_blocks_image_order_idx" ON "_pages_v_blocks_image" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_image_parent_id_idx" ON "_pages_v_blocks_image" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_image_path_idx" ON "_pages_v_blocks_image" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_image_image_idx" ON "_pages_v_blocks_image" USING btree ("image_id");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  DROP TABLE "pages_blocks_prose" CASCADE;
  DROP TABLE "_pages_v_blocks_prose" CASCADE;
  DROP TABLE "pages_blocks_image" CASCADE;
  DROP TABLE "_pages_v_blocks_image" CASCADE;
  DROP TYPE "public"."enum_pages_blocks_image_size";
  DROP TYPE "public"."enum__pages_v_blocks_image_size";
  ALTER TABLE "pages" DROP COLUMN IF EXISTS "best_card_title";
  ALTER TABLE "_pages_v" DROP COLUMN IF EXISTS "version_best_card_title";`)
}
