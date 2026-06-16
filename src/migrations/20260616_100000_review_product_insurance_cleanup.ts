import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Schema changes:
 * 1. Reviews: rename card → product as a polymorphic relationship
 *    (supports both credit-cards and insurances). Backfills existing rows
 *    with product_relation = 'credit-cards'.
 * 2. Insurances: drop insuranceType column, and the Recension fields
 *    (pros/cons arrays, verdict, reviewContent).
 * 3. CreditCards: drop the sites relationship (credit cards are global;
 *    site association is managed on Reviews, not on the card itself).
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    -- ── 1. Reviews: card → product (polymorphic) ──────────────────────────

    -- Drop old FK and index on reviews.card_id
    ALTER TABLE "reviews"
      DROP CONSTRAINT IF EXISTS "reviews_card_id_credit_cards_id_fk";
    DROP INDEX IF EXISTS "reviews_card_idx";

    -- Rename card_id → product_id and add product_relation
    ALTER TABLE "reviews"
      RENAME COLUMN "card_id" TO "product_id";
    ALTER TABLE "reviews"
      ADD COLUMN IF NOT EXISTS "product_relation" varchar;

    -- Backfill: all existing rows reference credit-cards
    UPDATE "reviews"
      SET "product_relation" = 'credit-cards'
      WHERE "product_id" IS NOT NULL AND "product_relation" IS NULL;

    -- Re-add index under new name
    CREATE INDEX IF NOT EXISTS "reviews_product_idx" ON "reviews" USING btree ("product_id");

    -- Same for _reviews_v (versions table)
    ALTER TABLE "_reviews_v"
      DROP CONSTRAINT IF EXISTS "_reviews_v_version_card_id_credit_cards_id_fk";
    DROP INDEX IF EXISTS "_reviews_v_version_version_card_idx";

    ALTER TABLE "_reviews_v"
      RENAME COLUMN "version_card_id" TO "version_product_id";
    ALTER TABLE "_reviews_v"
      ADD COLUMN IF NOT EXISTS "version_product_relation" varchar;

    UPDATE "_reviews_v"
      SET "version_product_relation" = 'credit-cards'
      WHERE "version_product_id" IS NOT NULL AND "version_product_relation" IS NULL;

    CREATE INDEX IF NOT EXISTS "_reviews_v_version_product_idx" ON "_reviews_v" USING btree ("version_product_id");


    -- ── 2. Insurances: remove insuranceType + Recension fields ────────────

    -- Drop pros/cons array tables (Recension tab)
    DROP TABLE IF EXISTS "insurances_pros" CASCADE;
    DROP TABLE IF EXISTS "insurances_cons" CASCADE;
    DROP TABLE IF EXISTS "_insurances_v_version_pros" CASCADE;
    DROP TABLE IF EXISTS "_insurances_v_version_cons" CASCADE;

    -- Drop scalar columns from the Recension tab + insuranceType
    ALTER TABLE "insurances"
      DROP COLUMN IF EXISTS "insurance_type",
      DROP COLUMN IF EXISTS "verdict",
      DROP COLUMN IF EXISTS "review_content";

    ALTER TABLE "_insurances_v"
      DROP COLUMN IF EXISTS "version_insurance_type",
      DROP COLUMN IF EXISTS "version_verdict",
      DROP COLUMN IF EXISTS "version_review_content";


    -- ── 3. CreditCards: remove sites relationship ─────────────────────────

    -- The credit_cards_rels table exists solely for the sites hasMany field;
    -- drop it entirely (cascade handles FK constraints).
    DROP TABLE IF EXISTS "credit_cards_rels" CASCADE;
    DROP TABLE IF EXISTS "_credit_cards_v_rels" CASCADE;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    -- ── 1. Reverse: product → card ────────────────────────────────────────

    DROP INDEX IF EXISTS "reviews_product_idx";
    ALTER TABLE "reviews"
      DROP COLUMN IF EXISTS "product_relation",
      RENAME COLUMN "product_id" TO "card_id";
    ALTER TABLE "reviews"
      ADD CONSTRAINT "reviews_card_id_credit_cards_id_fk"
        FOREIGN KEY ("card_id") REFERENCES "public"."credit_cards"("id")
        ON DELETE set null ON UPDATE no action;
    CREATE INDEX IF NOT EXISTS "reviews_card_idx" ON "reviews" USING btree ("card_id");

    DROP INDEX IF EXISTS "_reviews_v_version_product_idx";
    ALTER TABLE "_reviews_v"
      DROP COLUMN IF EXISTS "version_product_relation",
      RENAME COLUMN "version_product_id" TO "version_card_id";
    ALTER TABLE "_reviews_v"
      ADD CONSTRAINT "_reviews_v_version_card_id_credit_cards_id_fk"
        FOREIGN KEY ("version_card_id") REFERENCES "public"."credit_cards"("id")
        ON DELETE set null ON UPDATE no action;
    CREATE INDEX IF NOT EXISTS "_reviews_v_version_version_card_idx" ON "_reviews_v" USING btree ("version_card_id");


    -- ── 2. Reverse: restore Insurances fields ─────────────────────────────

    ALTER TABLE "insurances"
      ADD COLUMN IF NOT EXISTS "insurance_type" varchar,
      ADD COLUMN IF NOT EXISTS "verdict" varchar,
      ADD COLUMN IF NOT EXISTS "review_content" jsonb;

    ALTER TABLE "_insurances_v"
      ADD COLUMN IF NOT EXISTS "version_insurance_type" varchar,
      ADD COLUMN IF NOT EXISTS "version_verdict" varchar,
      ADD COLUMN IF NOT EXISTS "version_review_content" jsonb;

    CREATE TABLE IF NOT EXISTS "insurances_pros" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "item" varchar
    );
    CREATE TABLE IF NOT EXISTS "insurances_cons" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "item" varchar
    );
    ALTER TABLE "insurances_pros"
      ADD CONSTRAINT "insurances_pros_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "public"."insurances"("id") ON DELETE cascade;
    ALTER TABLE "insurances_cons"
      ADD CONSTRAINT "insurances_cons_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "public"."insurances"("id") ON DELETE cascade;

    CREATE TABLE IF NOT EXISTS "_insurances_v_version_pros" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" serial PRIMARY KEY NOT NULL,
      "item" varchar,
      "_uuid" varchar
    );
    CREATE TABLE IF NOT EXISTS "_insurances_v_version_cons" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" serial PRIMARY KEY NOT NULL,
      "item" varchar,
      "_uuid" varchar
    );
    ALTER TABLE "_insurances_v_version_pros"
      ADD CONSTRAINT "_insurances_v_version_pros_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "public"."_insurances_v"("id") ON DELETE cascade;
    ALTER TABLE "_insurances_v_version_cons"
      ADD CONSTRAINT "_insurances_v_version_cons_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "public"."_insurances_v"("id") ON DELETE cascade;


    -- ── 3. Reverse: restore credit_cards_rels ────────────────────────────

    CREATE TABLE IF NOT EXISTS "credit_cards_rels" (
      "id" serial PRIMARY KEY NOT NULL,
      "order" integer,
      "parent_id" integer NOT NULL,
      "path" varchar NOT NULL,
      "sites_id" integer
    );
    ALTER TABLE "credit_cards_rels"
      ADD CONSTRAINT "credit_cards_rels_parent_fk"
        FOREIGN KEY ("parent_id") REFERENCES "public"."credit_cards"("id") ON DELETE cascade;
    ALTER TABLE "credit_cards_rels"
      ADD CONSTRAINT "credit_cards_rels_sites_fk"
        FOREIGN KEY ("sites_id") REFERENCES "public"."sites"("id") ON DELETE cascade;

    CREATE TABLE IF NOT EXISTS "_credit_cards_v_rels" (
      "id" serial PRIMARY KEY NOT NULL,
      "order" integer,
      "parent_id" integer NOT NULL,
      "path" varchar NOT NULL,
      "sites_id" integer
    );
    ALTER TABLE "_credit_cards_v_rels"
      ADD CONSTRAINT "_credit_cards_v_rels_parent_fk"
        FOREIGN KEY ("parent_id") REFERENCES "public"."_credit_cards_v"("id") ON DELETE cascade;
    ALTER TABLE "_credit_cards_v_rels"
      ADD CONSTRAINT "_credit_cards_v_rels_sites_fk"
        FOREIGN KEY ("sites_id") REFERENCES "public"."sites"("id") ON DELETE cascade;
  `)
}
