import { Router } from "express";
import { eq, and } from "drizzle-orm";
import { db } from "@workspace/db";
import { unitsTable, projectsTable } from "@workspace/db";
import {
  ListUnitsQueryParams,
  CreateUnitBody,
  UpdateUnitParams,
  UpdateUnitBody,
  DeleteUnitParams,
  GetProjectUnitsParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/projects/:slug/units", async (req, res): Promise<void> => {
  const params = GetProjectUnitsParams.safeParse(req.params);
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

  const units = await db
    .select()
    .from(unitsTable)
    .where(eq(unitsTable.projectId, project.id))
    .orderBy(unitsTable.id);

  res.json({ units: units.map(mapUnit) });
});

router.get("/units", async (req, res): Promise<void> => {
  const parsed = ListUnitsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { project_id, status } = parsed.data;
  const conditions = [];

  if (project_id) conditions.push(eq(unitsTable.projectId, project_id));
  if (status) conditions.push(eq(unitsTable.status, status));

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const units = await db
    .select()
    .from(unitsTable)
    .where(where)
    .orderBy(unitsTable.id);

  res.json({ units: units.map(mapUnit) });
});

router.post("/units", async (req, res): Promise<void> => {
  const parsed = CreateUnitBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [unit] = await db.insert(unitsTable).values({
    projectId: parsed.data.projectId,
    unitName: parsed.data.unitName,
    bedrooms: parsed.data.bedrooms,
    bathrooms: parsed.data.bathrooms,
    buildSize: parsed.data.buildSize ?? null,
    landSize: parsed.data.landSize ?? null,
    price: parsed.data.price,
    currency: parsed.data.currency,
    status: parsed.data.status,
    floorplanUrl: parsed.data.floorplanUrl ?? null,
  }).returning();

  res.status(201).json(mapUnit(unit));
});

router.put("/units/:id", async (req, res): Promise<void> => {
  const params = UpdateUnitParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateUnitBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [unit] = await db
    .update(unitsTable)
    .set({
      projectId: parsed.data.projectId,
      unitName: parsed.data.unitName,
      bedrooms: parsed.data.bedrooms,
      bathrooms: parsed.data.bathrooms,
      buildSize: parsed.data.buildSize ?? null,
      landSize: parsed.data.landSize ?? null,
      price: parsed.data.price,
      currency: parsed.data.currency,
      status: parsed.data.status,
      floorplanUrl: parsed.data.floorplanUrl ?? null,
    })
    .where(eq(unitsTable.id, params.data.id))
    .returning();

  if (!unit) {
    res.status(404).json({ error: "Unit not found" });
    return;
  }

  res.json(mapUnit(unit));
});

router.delete("/units/:id", async (req, res): Promise<void> => {
  const params = DeleteUnitParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [unit] = await db
    .delete(unitsTable)
    .where(eq(unitsTable.id, params.data.id))
    .returning();

  if (!unit) {
    res.status(404).json({ error: "Unit not found" });
    return;
  }

  res.json({ success: true });
});

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
