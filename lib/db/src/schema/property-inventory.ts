import { pgTable, text, integer, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

/** CRM listing rows stored in Postgres (e.g. Supabase `DATABASE_URL`). */
export const propertyInventoryTable = pgTable("property_inventory", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: text("code").notNull().unique(),
  title: text("title").notNull().default(""),
  listingUrl: text("listing_url"),
  description: text("description").notNull().default(""),
  channel: text("channel").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertPropertyInventorySchema = createInsertSchema(propertyInventoryTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertPropertyInventory = z.infer<typeof insertPropertyInventorySchema>;
export type PropertyInventory = typeof propertyInventoryTable.$inferSelect;
