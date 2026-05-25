import {
  pgTable,
  text,
  serial,
  integer,
  boolean,
  timestamp,
  json,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const projectsTable = pgTable("projects", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  status: text("status").notNull().default("ongoing"),
  area: text("area").notNull(),
  propertyType: text("property_type").notNull(),
  bedroomsMin: integer("bedrooms_min").notNull().default(1),
  bedroomsMax: integer("bedrooms_max").notNull().default(1),
  priceFrom: integer("price_from").notNull().default(0),
  currency: text("currency").notNull().default("USD"),
  completionDate: text("completion_date"),
  shortDescription: text("short_description").notNull(),
  fullDescription: text("full_description").notNull().default(""),
  amenities: json("amenities").$type<string[]>().notNull().default([]),
  investmentHighlights: json("investment_highlights").$type<string[]>().notNull().default([]),
  brochureUrl: text("brochure_url"),
  heroImageUrl: text("hero_image_url"),
  featured: boolean("featured").notNull().default(false),
  unitsLeft: integer("units_left"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertProjectSchema = createInsertSchema(projectsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projectsTable.$inferSelect;

export const projectImagesTable = pgTable("project_images", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  imageUrl: text("image_url").notNull(),
  caption: text("caption"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type ProjectImage = typeof projectImagesTable.$inferSelect;
