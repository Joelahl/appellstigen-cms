import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Fix: polymorphic relationship fields use a `_rels` table, not inline columns.
 * The previous migration incorrectly placed product_id / product_relation as
 * inline columns on reviews / _reviews_v. Payload's Drizzle adapter queries
 * reviews_rels and _reviews_v_rels, so this migration:
 *   1. Creates those rels tables with the structure Payload expects
 *   2. Migrates data from the incorrect inline columns into the rels tables
 *   3. Drops the inline columns
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    -- ── 1. reviews_rels ───────────────────────────────────────────────────

    CREATE TABLE IF NOT EXISTS "reviews_rels" (
      "id"             serial PRIMARY KEY NOT NULL,
      "order"          integer,
      "parent_id"      integer NOT NULL,
      "path"           varchar NOT NULL,
      "credit_cards_id" integer,
      "insurances_id"  integer
    );
    ALTER TABLE "reviews_rels"
      ADD CONSTRAINT "reviews_rels_parent_fk"
        FOREIGN KEY ("parent_id") REFERENCES "public"."reviews"("id")
        ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "reviews_rels"
      ADD CONSTRAINT "reviews_rels_credit_cards_fk"
        FOREIGN KEY ("credit_cards_id") REFERENCES "public"."credit_cards"("id")
        ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "reviews_rels"
      ADD CONSTRAINT "reviews_rels_insurances_fk"
        FOREIGN KEY ("insurances_id") REFERENCES "public"."insurances"("id")
        ON DELETE cascade ON UPDATE no action;
    CREATE INDEX IF NOT EXISTS "reviews_rels_order_idx"          ON "reviews_rels" USING btree ("order");
    CREATE INDEX IF NOT EXISTS "reviews_rels_parent_idx"         ON "reviews_rels" USING btree ("parent_id");
    CREATE INDEX IF NOT EXISTS "reviews_rels_path_idx"           ON "reviews_rels" USING btree ("path");
    CREATE INDEX IF NOT EXISTS "reviews_rels_credit_cards_id_idx" ON "reviews_rels" USING btree ("credit_cards_id");
    CREATE INDEX IF NOT EXISTS "reviews_rels_insurances_id_idx"  ON "reviews_rels" USING btree ("insurances_id");

    -- ── 2. Migrate existing data from inline columns ──────────────────────

    INSERT INTO "reviews_rels" ("order", "parent_id", "path", "credit_cards_id", "insurances_id")
    SELECT
      1,
      r.id,
      'product',
      CASE WHEN r.product_relation = 'credit-cards' THEN r.product_id ELSE NULL END,
      CASE WHEN r.product_relation = 'insurances'   THEN r.product_id ELSE NULL END
    FROM "reviews" r
    WHERE r.product_id IS NOT NULL;

    -- ── 3. Drop the incorrectly placed inline columns from reviews ─────────

    DROP INDEX IF EXISTS "reviews_product_idx";
    ALTER TABLE "reviews" DROP COLUMN IF EXISTS "product_id";
    ALTER TABLE "reviews" DROP COLUMN IF EXISTS "product_relation";

    -- ── 4. _reviews_v_rels ────────────────────────────────────────────────

    CREATE TABLE IF NOT EXISTS "_reviews_v_rels" (
      "id"             serial PRIMARY KEY NOT NULL,
      "order"          integer,
      "parent_id"      integer NOT NULL,
      "path"           varchar NOT NULL,
      "credit_cards_id" integer,
      "insurances_id"  integer
    );
    ALTER TABLE "_reviews_v_rels"
      ADD CONSTRAINT "_reviews_v_rels_parent_fk"
        FOREIGN KEY ("parent_id") REFERENCES "public"."_reviews_v"("id")
        ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "_reviews_v_rels"
      ADD CONSTRAINT "_reviews_v_rels_credit_cards_fk"
        FOREIGN KEY ("credit_cards_id") REFERENCES "public"."credit_cards"("id")
        ON DELETE cascade ON UPDATE no action;
    ALTER TABLE "_reviews_v_rels"
      ADD CONSTRAINT "_reviews_v_rels_insurances_fk"
        FOREIGN KEY ("insurances_id") REFERENCES "public"."insurances"("id")
        ON DELETE cascade ON UPDATE no action;
    CREATE INDEX IF NOT EXISTS "_reviews_v_rels_order_idx"          ON "_reviews_v_rels" USING btree ("order");
    CREATE INDEX IF NOT EXISTS "_reviews_v_rels_parent_idx"         ON "_reviews_v_rels" USING btree ("parent_id");
    CREATE INDEX IF NOT EXISTS "_reviews_v_rels_path_idx"           ON "_reviews_v_rels" USING btree ("path");
    CREATE INDEX IF NOT EXISTS "_reviews_v_rels_credit_cards_id_idx" ON "_reviews_v_rels" USING btree ("credit_cards_id");
    CREATE INDEX IF NOT EXISTS "_reviews_v_rels_insurances_id_idx"  ON "_reviews_v_rels" USING btree ("insurances_id");

    -- ── 5. Migrate version data ───────────────────────────────────────────

    INSERT INTO "_reviews_v_rels" ("order", "parent_id", "path", "credit_cards_id", "insurances_id")
    SELECT
      1,
      rv.id,
      'product',
      CASE WHEN rv.version_product_relation = 'credit-cards' THEN rv.version_product_id ELSE NULL END,
      CASE WHEN rv.version_product_relation = 'insurances'   THEN rv.version_product_id ELSE NULL END
    FROM "_reviews_v" rv
    WHERE rv.version_product_id IS NOT NULL;

    -- ── 6. Drop inline columns from _reviews_v ────────────────────────────

    DROP INDEX IF EXISTS "_reviews_v_version_product_idx";
    ALTER TABLE "_reviews_v" DROP COLUMN IF EXISTS "version_product_id";
    ALTER TABLE "_reviews_v" DROP COLUMN IF EXISTS "version_product_relation";
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    -- Restore inline columns on reviews
    ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "product_id"       integer;
    ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "product_relation"  varchar;

    UPDATE "reviews" r SET
      product_id = COALESCE(
        (SELECT credit_cards_id FROM "reviews_rels" WHERE parent_id = r.id AND path = 'product' AND credit_cards_id IS NOT NULL LIMIT 1),
        (SELECT insurances_id   FROM "reviews_rels" WHERE parent_id = r.id AND path = 'product' AND insurances_id IS NOT NULL LIMIT 1)
      ),
      product_relation = CASE
        WHEN EXISTS (SELECT 1 FROM "reviews_rels" WHERE parent_id = r.id AND path = 'product' AND credit_cards_id IS NOT NULL) THEN 'credit-cards'
        WHEN EXISTS (SELECT 1 FROM "reviews_rels" WHERE parent_id = r.id AND path = 'product' AND insurances_id IS NOT NULL) THEN 'insurances'
      END;

    CREATE INDEX IF NOT EXISTS "reviews_product_idx" ON "reviews" USING btree ("product_id");

    -- Restore inline columns on _reviews_v
    ALTER TABLE "_reviews_v" ADD COLUMN IF NOT EXISTS "version_product_id"       integer;
    ALTER TABLE "_reviews_v" ADD COLUMN IF NOT EXISTS "version_product_relation"  varchar;

    UPDATE "_reviews_v" rv SET
      version_product_id = COALESCE(
        (SELECT credit_cards_id FROM "_reviews_v_rels" WHERE parent_id = rv.id AND path = 'product' AND credit_cards_id IS NOT NULL LIMIT 1),
        (SELECT insurances_id   FROM "_reviews_v_rels" WHERE parent_id = rv.id AND path = 'product' AND insurances_id IS NOT NULL LIMIT 1)
      ),
      version_product_relation = CASE
        WHEN EXISTS (SELECT 1 FROM "_reviews_v_rels" WHERE parent_id = rv.id AND path = 'product' AND credit_cards_id IS NOT NULL) THEN 'credit-cards'
        WHEN EXISTS (SELECT 1 FROM "_reviews_v_rels" WHERE parent_id = rv.id AND path = 'product' AND insurances_id IS NOT NULL) THEN 'insurances'
      END;

    CREATE INDEX IF NOT EXISTS "_reviews_v_version_product_idx" ON "_reviews_v" USING btree ("version_product_id");

    DROP TABLE IF EXISTS "reviews_rels" CASCADE;
    DROP TABLE IF EXISTS "_reviews_v_rels" CASCADE;
  `)
}
