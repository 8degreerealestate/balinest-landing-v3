import { Router } from "express";
import { eq, and, gte, lte, sql } from "drizzle-orm";
import { db } from "@workspace/db";
import { projectsTable, projectImagesTable, projectMediaTable, unitsTable } from "@workspace/db";
import {
  ListProjectsQueryParams,
  CreateProjectBody,
  GetProjectParams,
  UpdateProjectBody,
  UpdateProjectParams,
  DeleteProjectParams,
} from "@workspace/api-zod";

const router = Router();

function getPgOrSystemErrorCode(error: unknown): string | undefined {
  let cur: unknown = error;
  for (let i = 0; i < 10 && cur; i++) {
    if (typeof cur === "object" && cur !== null && "code" in cur) {
      const c = (cur as { code: unknown }).code;
      if (typeof c === "string" && c.length > 0) return c;
    }
    cur =
      typeof cur === "object" && cur !== null && "cause" in cur
        ? (cur as { cause: unknown }).cause
        : undefined;
  }
  return undefined;
}

function isUndefinedTableError(error: unknown): boolean {
  return getPgOrSystemErrorCode(error) === "42P01";
}

function isDbUnreachableError(error: unknown): boolean {
  const c = getPgOrSystemErrorCode(error);
  return c === "ECONNREFUSED" || c === "ETIMEDOUT" || c === "ENOTFOUND" || c === "EAI_AGAIN";
}

function isProjectsListRecoverableError(error: unknown): boolean {
  return isUndefinedTableError(error) || isDbUnreachableError(error);
}

router.get("/projects/featured", async (req, res): Promise<void> => {
  try {
    const projects = await db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.featured, true))
      .orderBy(projectsTable.createdAt)
      .limit(6);
    res.json({ projects: projects.map(mapProject) });
  } catch (error) {
    if (isProjectsListRecoverableError(error)) {
      res.json({ projects: [] });
      return;
    }
    console.error("[GET /projects/featured]", error);
    res.status(500).json({ error: "Failed to list featured projects" });
  }
});

router.get("/projects", async (req, res): Promise<void> => {
  const parsed = ListProjectsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  try {
    const { status, area, property_type, bedrooms, price_min, price_max, featured, limit = 20, offset = 0 } =
      parsed.data;

    const conditions = [];

    if (status) conditions.push(eq(projectsTable.status, status));
    if (area) conditions.push(eq(projectsTable.area, area));
    if (property_type) conditions.push(eq(projectsTable.propertyType, property_type));
    if (bedrooms) conditions.push(eq(projectsTable.bedroomsMin, bedrooms));
    if (price_min) conditions.push(gte(projectsTable.priceFrom, price_min));
    if (price_max) conditions.push(lte(projectsTable.priceFrom, price_max));
    if (featured !== undefined) conditions.push(eq(projectsTable.featured, featured));

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [projects, countResult] = await Promise.all([
      db.select().from(projectsTable).where(where).orderBy(projectsTable.createdAt).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(projectsTable).where(where),
    ]);

    res.json({
      projects: projects.map(mapProject),
      total: Number(countResult[0]?.count ?? 0),
    });
  } catch (error) {
    if (isProjectsListRecoverableError(error)) {
      res.json({ projects: [], total: 0 });
      return;
    }
    console.error("[GET /projects]", error);
    res.status(500).json({ error: "Failed to list projects" });
  }
});

router.get("/projects/:slug", async (req, res): Promise<void> => {
  const params = GetProjectParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [project] = await db
    .select()
    .from(projectsTable)
    .where(eq(projectsTable.slug, params.data.slug));

  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  const [images, media, units] = await Promise.all([
    db.select().from(projectImagesTable).where(eq(projectImagesTable.projectId, project.id)).orderBy(projectImagesTable.sortOrder),
    db.select().from(projectMediaTable).where(eq(projectMediaTable.projectId, project.id)).orderBy(projectMediaTable.sortOrder),
    db.select().from(unitsTable).where(eq(unitsTable.projectId, project.id)).orderBy(unitsTable.id),
  ]);

  res.json({
    ...mapProject(project),
    fullDescription: project.fullDescription,
    amenities: project.amenities,
    investmentHighlights: project.investmentHighlights,
    brochureUrl: project.brochureUrl,
    images: images.map(img => ({
      id: img.id,
      imageUrl: img.imageUrl,
      caption: img.caption,
      sortOrder: img.sortOrder,
    })),
    media: media.map((item) => ({
      id: item.id,
      mediaType: item.mediaType,
      mediaUrl: item.mediaUrl,
      thumbnailUrl: item.thumbnailUrl,
      caption: item.caption,
      sortOrder: item.sortOrder,
    })),
    units: units.map(mapUnit),
  });
});

router.post("/projects", async (req, res): Promise<void> => {
  const parsed = CreateProjectBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [project] = await db.insert(projectsTable).values({
    title: parsed.data.title,
    slug: parsed.data.slug,
    status: parsed.data.status,
    area: parsed.data.area,
    propertyType: parsed.data.propertyType,
    bedroomsMin: parsed.data.bedroomsMin,
    bedroomsMax: parsed.data.bedroomsMax,
    priceFrom: parsed.data.priceFrom,
    currency: parsed.data.currency,
    completionDate: parsed.data.completionDate ?? null,
    shortDescription: parsed.data.shortDescription,
    fullDescription: parsed.data.fullDescription,
    amenities: parsed.data.amenities,
    investmentHighlights: parsed.data.investmentHighlights,
    brochureUrl: parsed.data.brochureUrl ?? null,
    heroImageUrl: parsed.data.heroImageUrl ?? null,
    featured: parsed.data.featured,
    unitsLeft: parsed.data.unitsLeft ?? null,
  }).returning();

  res.status(201).json(mapProject(project));
});

router.put("/projects/:slug", async (req, res): Promise<void> => {
  const params = UpdateProjectParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateProjectBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [project] = await db
    .update(projectsTable)
    .set({
      title: parsed.data.title,
      slug: parsed.data.slug,
      status: parsed.data.status,
      area: parsed.data.area,
      propertyType: parsed.data.propertyType,
      bedroomsMin: parsed.data.bedroomsMin,
      bedroomsMax: parsed.data.bedroomsMax,
      priceFrom: parsed.data.priceFrom,
      currency: parsed.data.currency,
      completionDate: parsed.data.completionDate ?? null,
      shortDescription: parsed.data.shortDescription,
      fullDescription: parsed.data.fullDescription,
      amenities: parsed.data.amenities,
      investmentHighlights: parsed.data.investmentHighlights,
      brochureUrl: parsed.data.brochureUrl ?? null,
      heroImageUrl: parsed.data.heroImageUrl ?? null,
      featured: parsed.data.featured,
      unitsLeft: parsed.data.unitsLeft ?? null,
    })
    .where(eq(projectsTable.slug, params.data.slug))
    .returning();

  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  res.json(mapProject(project));
});

router.delete("/projects/:slug", async (req, res): Promise<void> => {
  const params = DeleteProjectParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [project] = await db
    .delete(projectsTable)
    .where(eq(projectsTable.slug, params.data.slug))
    .returning();

  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  res.json({ success: true });
});

function mapProject(p: typeof projectsTable.$inferSelect) {
  return {
    id: p.id,
    title: p.title,
    slug: p.slug,
    status: p.status,
    area: p.area,
    propertyType: p.propertyType,
    bedroomsMin: p.bedroomsMin,
    bedroomsMax: p.bedroomsMax,
    priceFrom: p.priceFrom,
    currency: p.currency,
    completionDate: p.completionDate ?? null,
    shortDescription: p.shortDescription,
    heroImageUrl: p.heroImageUrl ?? null,
    featured: p.featured,
    unitsLeft: p.unitsLeft ?? null,
    createdAt: p.createdAt.toISOString(),
  };
}

function mapUnit(u: typeof unitsTable.$inferSelect) {
  return {
    id: u.id,
    projectId: u.projectId,
    unitName: u.unitName,
    bedrooms: u.bedrooms,
    bathrooms: u.bathrooms,
    buildSize: u.buildSize ?? null,
    landSize: u.landSize ?? null,
    price: u.price,
    currency: u.currency,
    status: u.status,
    floorplanUrl: u.floorplanUrl ?? null,
    createdAt: u.createdAt.toISOString(),
  };
}

export default router;
