import {
  pgTable,
  text,
  serial,
  integer,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const unitsTable = pgTable("units", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  unitName: text("unit_name").notNull(),
  bedrooms: integer("bedrooms").notNull().default(1),
  bathrooms: integer("bathrooms").notNull().default(1),
  buildSize: integer("build_size"),
  landSize: integer("land_size"),
  price: integer("price").notNull().default(0),
  currency: text("currency").notNull().default("USD"),
  status: text("status").notNull().default("available"),
  floorplanUrl: text("floorplan_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertUnitSchema = createInsertSchema(unitsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertUnit = z.infer<typeof insertUnitSchema>;
export type Unit = typeof unitsTable.$inferSelect;
