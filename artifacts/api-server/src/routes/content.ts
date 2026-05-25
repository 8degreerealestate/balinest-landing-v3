import { Router } from "express";
import { asc, eq } from "drizzle-orm";
import { z } from "zod";
import { db, homepageSectionsTable, projectMediaTable } from "@workspace/db";

const router = Router();

const homepageBodySchema = z.object({
  sectionKey: z.string().min(1),
  title: z.string().nullable().optional(),
  subtitle: z.string().nullable().optional(),
  body: z.string().nullable().optional(),
  ctaLabel: z.string().nullable().optional(),
  ctaHref: z.string().nullable().optional(),
  imageUrl: z.string().url().nullable().optional(),
  sortOrder: z.number().int().optional().default(0),
  enabled: z.boolean().optional().default(true),
  payload: z.record(z.string(), z.unknown()).optional().default({}),
});

const projectMediaBodySchema = z.object({
  projectId: z.number().int().positive(),
  mediaType: z.enum(["image", "video"]).default("image"),
  mediaUrl: z.string().url(),
  thumbnailUrl: z.string().url().nullable().optional(),
  caption: z.string().nullable().optional(),
  sortOrder: z.number().int().optional().default(0),
});

const idParamsSchema = z.object({ id: z.coerce.number().int().positive() });

router.get("/content/homepage-sections", async (_req, res): Promise<void> => {
  const sections = await db.select().from(homepageSectionsTable).orderBy(asc(homepageSectionsTable.sortOrder));
  res.json({ sections });
});

router.post("/content/homepage-sections", async (req, res): Promise<void> => {
  const parsed = homepageBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [section] = await db.insert(homepageSectionsTable).values({
    sectionKey: parsed.data.sectionKey,
    title: parsed.data.title ?? null,
    subtitle: parsed.data.subtitle ?? null,
    body: parsed.data.body ?? null,
    ctaLabel: parsed.data.ctaLabel ?? null,
    ctaHref: parsed.data.ctaHref ?? null,
    imageUrl: parsed.data.imageUrl ?? null,
    sortOrder: parsed.data.sortOrder,
    enabled: parsed.data.enabled,
    payload: parsed.data.payload,
  }).returning();
  res.status(201).json(section);
});

router.put("/content/homepage-sections/:id", async (req, res): Promise<void> => {
  const params = idParamsSchema.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = homepageBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [section] = await db.update(homepageSectionsTable).set({
    sectionKey: parsed.data.sectionKey,
    title: parsed.data.title ?? null,
    subtitle: parsed.data.subtitle ?? null,
    body: parsed.data.body ?? null,
    ctaLabel: parsed.data.ctaLabel ?? null,
    ctaHref: parsed.data.ctaHref ?? null,
    imageUrl: parsed.data.imageUrl ?? null,
    sortOrder: parsed.data.sortOrder,
    enabled: parsed.data.enabled,
    payload: parsed.data.payload,
  }).where(eq(homepageSectionsTable.id, params.data.id)).returning();
  if (!section) {
    res.status(404).json({ error: "Section not found" });
    return;
  }
  res.json(section);
});

router.delete("/content/homepage-sections/:id", async (req, res): Promise<void> => {
  const params = idParamsSchema.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [section] = await db.delete(homepageSectionsTable).where(eq(homepageSectionsTable.id, params.data.id)).returning();
  if (!section) {
    res.status(404).json({ error: "Section not found" });
    return;
  }
  res.json({ success: true });
});

router.get("/content/project-media", async (req, res): Promise<void> => {
  const projectId = Number(req.query.project_id ?? 0);
  if (!Number.isFinite(projectId) || projectId <= 0) {
    res.status(400).json({ error: "project_id query param is required" });
    return;
  }
  const media = await db.select().from(projectMediaTable).where(eq(projectMediaTable.projectId, projectId)).orderBy(asc(projectMediaTable.sortOrder));
  res.json({ media });
});

router.post("/content/project-media", async (req, res): Promise<void> => {
  const parsed = projectMediaBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [media] = await db.insert(projectMediaTable).values({
    projectId: parsed.data.projectId,
    mediaType: parsed.data.mediaType,
    mediaUrl: parsed.data.mediaUrl,
    thumbnailUrl: parsed.data.thumbnailUrl ?? null,
    caption: parsed.data.caption ?? null,
    sortOrder: parsed.data.sortOrder,
  }).returning();
  res.status(201).json(media);
});

router.delete("/content/project-media/:id", async (req, res): Promise<void> => {
  const params = idParamsSchema.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [media] = await db.delete(projectMediaTable).where(eq(projectMediaTable.id, params.data.id)).returning();
  if (!media) {
    res.status(404).json({ error: "Media not found" });
    return;
  }
  res.json({ success: true });
});

export default router;
