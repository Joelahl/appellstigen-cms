import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Adds the `affiliate_links` collection — slug-based outbound redirect targets
 * for /till/<slug>. DDL mirrors Payload's own generated conventions:
 *  - serial PK, varchar fields, timestamps, numeric clickCount
 *  - single relationship `card` -> credit_cards becomes card_id integer + FK
 *  - the collection is wired into payload_locked_documents_rels (column + FK +
 *    index), which Payload requires for every collection (admin doc-locking).
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  CREATE TABLE "affiliate_links" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"target_url" varchar NOT NULL,
  	"active" boolean DEFAULT true,
  	"card_id" integer,
  	"click_count" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  ALTER TABLE "affiliate_links" ADD CONSTRAINT "affiliate_links_card_id_credit_cards_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."credit_cards"("id") ON DELETE set null ON UPDATE no action;

  CREATE UNIQUE INDEX "affiliate_links_slug_idx" ON "affiliate_links" USING btree ("slug");
  CREATE INDEX "affiliate_links_active_idx" ON "affiliate_links" USING btree ("active");
  CREATE INDEX "affiliate_links_card_idx" ON "affiliate_links" USING btree ("card_id");
  CREATE INDEX "affiliate_links_updated_at_idx" ON "affiliate_links" USING btree ("updated_at");
  CREATE INDEX "affiliate_links_created_at_idx" ON "affiliate_links" USING btree ("created_at");

  -- Wire the collection into admin doc-locking (Payload requires this).
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "affiliate_links_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_affiliate_links_fk" FOREIGN KEY ("affiliate_links_id") REFERENCES "public"."affiliate_links"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_affiliate_links_id_idx" ON "payload_locked_documents_rels" USING btree ("affiliate_links_id");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_affiliate_links_fk";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_affiliate_links_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "affiliate_links_id";
  DROP TABLE "affiliate_links" CASCADE;`)
}
