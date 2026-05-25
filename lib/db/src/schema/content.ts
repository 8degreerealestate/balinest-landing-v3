import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const homepageSectionsTable = pgTable("homepage_sections", {
  id: serial("id").primaryKey(),
  sectionKey: text("section_key").notNull().unique(),
  title: text("title"),
  subtitle: text("subtitle"),
  body: text("body"),
  ctaLabel: text("cta_label"),
  ctaHref: text("cta_href"),
  imageUrl: text("image_url"),
  sortOrder: integer("sort_order").notNull().default(0),
  enabled: boolean("enabled").notNull().default(true),
  payload: json("payload").$type<Record<string, unknown>>().notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const projectMediaTable = pgTable("project_media", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  mediaType: text("media_type").notNull().default("image"),
  mediaUrl: text("media_url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  caption: text("caption"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertHomepageSectionSchema = createInsertSchema(homepageSectionsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProjectMediaSchema = createInsertSchema(projectMediaTable).omit({
  id: true,
  createdAt: true,
});

export type InsertHomepageSection = z.infer<typeof insertHomepageSectionSchema>;
export type HomepageSection = typeof homepageSectionsTable.$inferSelect;
export type InsertProjectMedia = z.infer<typeof insertProjectMediaSchema>;
export type ProjectMedia = typeof projectMediaTable.$inferSelect;
