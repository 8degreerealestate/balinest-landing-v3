import { pgTable, text, serial, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const downloadableGuidesTable = pgTable("downloadable_guides", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  fileUrl: text("file_url").notNull(),
  coverImageUrl: text("cover_image_url"),
  featured: boolean("featured").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertDownloadableGuideSchema = createInsertSchema(downloadableGuidesTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertDownloadableGuide = z.infer<typeof insertDownloadableGuideSchema>;
export type DownloadableGuide = typeof downloadableGuidesTable.$inferSelect;
