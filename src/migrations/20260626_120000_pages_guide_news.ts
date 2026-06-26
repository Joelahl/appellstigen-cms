import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Add 'guide' + 'news' to the Pages `pageType` enums — both the live table
 * (enum_pages_page_type) and the drafts/versions table
 * (enum__pages_v_version_page_type). Idempotent via ADD VALUE IF NOT EXISTS.
 *
 * Postgres (PG16) permits ALTER TYPE ... ADD VALUE inside a transaction as long
 * as the new value isn't used in the same transaction (it isn't here). Postgres
 * cannot drop enum values, so down() is a no-op.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TYPE "enum_pages_page_type" ADD VALUE IF NOT EXISTS 'guide';
    ALTER TYPE "enum_pages_page_type" ADD VALUE IF NOT EXISTS 'news';
    ALTER TYPE "enum__pages_v_version_page_type" ADD VALUE IF NOT EXISTS 'guide';
    ALTER TYPE "enum__pages_v_version_page_type" ADD VALUE IF NOT EXISTS 'news';
  `)
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // Enum values cannot be removed in Postgres — nothing to revert.
}
