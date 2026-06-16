import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { up as createContentPlan, down as dropContentPlan } from './20260615_140000_content_plan'

/**
 * Remove the content-plan + topic-clusters collections from the CMS.
 *
 * The content plan moved to the ops dashboard's own datastore (appellstigen_ops);
 * the CMS now holds only site content. Data was migrated and verified first.
 *
 * This is the reverse of 20260615_140000_content_plan: up() drops the tables,
 * down() recreates them — so the change is reversible if ever needed.
 */
export async function up(args: MigrateUpArgs): Promise<void> {
  await dropContentPlan(args as unknown as MigrateDownArgs)
}

export async function down(args: MigrateDownArgs): Promise<void> {
  await createContentPlan(args as unknown as MigrateUpArgs)
}
