import { boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core";

/**
 * Admin overrides for sheet-sourced inventory rows, keyed by listing `code`.
 * Optional table — if missing, API treats all rows as active, available, not featured.
 */
export const inventoryListingMetaTable = pgTable("inventory_listing_meta", {
  code: text("code").primaryKey(),
  featured: boolean("featured").notNull().default(false),
  /** `active` = shown on public site; `draft` = hidden from public portfolio. */
  visibility: text("visibility").notNull().default("active"),
  /** `available` vs `sold` for public display and admin status. */
  saleStatus: text("sale_status").notNull().default("available"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export type InventoryListingMeta = typeof inventoryListingMetaTable.$inferSelect;
export type InsertInventoryListingMeta = typeof inventoryListingMetaTable.$inferInsert;
