import { Router } from "express";
import { asc, eq } from "drizzle-orm";
import { z } from "zod";
import { db, downloadableGuidesTable } from "@workspace/db";

const router = Router();

const guideBodySchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().nullable().optional(),
  fileUrl: z.string().url(),
  coverImageUrl: z.string().url().nullable().optional(),
  featured: z.boolean().optional().default(false),
});

const idParamsSchema = z.object({ id: z.coerce.number().int().positive() });

router.get("/guides", async (_req, res): Promise<void> => {
  const guides = await db.select().from(downloadableGuidesTable).orderBy(asc(downloadableGuidesTable.title));
  res.json({
    guides: guides.map((g) => ({
      id: g.id,
      title: g.title,
      slug: g.slug,
      description: g.description ?? null,
      fileUrl: g.fileUrl,
      coverImageUrl: g.coverImageUrl ?? null,
      featured: g.featured,
      createdAt: g.createdAt.toISOString(),
      updatedAt: g.updatedAt.toISOString(),
    })),
  });
});

router.post("/guides", async (req, res): Promise<void> => {
  const parsed = guideBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [guide] = await db.insert(downloadableGuidesTable).values({
    title: parsed.data.title,
    slug: parsed.data.slug,
    description: parsed.data.description ?? null,
    fileUrl: parsed.data.fileUrl,
    coverImageUrl: parsed.data.coverImageUrl ?? null,
    featured: parsed.data.featured,
  }).returning();

  res.status(201).json(guide);
});

router.put("/guides/:id", async (req, res): Promise<void> => {
  const params = idParamsSchema.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = guideBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [guide] = await db.update(downloadableGuidesTable).set({
    title: parsed.data.title,
    slug: parsed.data.slug,
    description: parsed.data.description ?? null,
    fileUrl: parsed.data.fileUrl,
    coverImageUrl: parsed.data.coverImageUrl ?? null,
    featured: parsed.data.featured,
  }).where(eq(downloadableGuidesTable.id, params.data.id)).returning();

  if (!guide) {
    res.status(404).json({ error: "Guide not found" });
    return;
  }

  res.json(guide);
});

router.delete("/guides/:id", async (req, res): Promise<void> => {
  const params = idParamsSchema.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [guide] = await db.delete(downloadableGuidesTable).where(eq(downloadableGuidesTable.id, params.data.id)).returning();
  if (!guide) {
    res.status(404).json({ error: "Guide not found" });
    return;
  }

  res.json({ success: true });
});

export default router;
