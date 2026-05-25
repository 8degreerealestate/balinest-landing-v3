import { Router } from "express";
import { eq, and, gte, sql } from "drizzle-orm";
import { db } from "@workspace/db";
import { enquiriesTable, projectsTable } from "@workspace/db";
import {
  ListEnquiriesQueryParams,
  CreateEnquiryBody,
  DeleteEnquiryParams,
} from "@workspace/api-zod";
import { syncEnquiryToGoHighLevel } from "../lib/gohighlevel";
import { logger } from "../lib/logger";

const router = Router();

router.get("/enquiries", async (req, res): Promise<void> => {
  const parsed = ListEnquiriesQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { project_id, limit = 50, offset = 0 } = parsed.data;
  const conditions = [];
  if (project_id) conditions.push(eq(enquiriesTable.interestedProjectId, project_id));
  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [enquiries, countResult] = await Promise.all([
    db.select({
      enquiry: enquiriesTable,
      projectTitle: projectsTable.title,
    })
      .from(enquiriesTable)
      .leftJoin(projectsTable, eq(enquiriesTable.interestedProjectId, projectsTable.id))
      .where(where)
      .orderBy(enquiriesTable.createdAt)
      .limit(limit)
      .offset(offset),
    db.select({ count: sql<number>`count(*)` }).from(enquiriesTable).where(where),
  ]);

  res.json({
    enquiries: enquiries.map(({ enquiry, projectTitle }) => mapEnquiry(enquiry, projectTitle)),
    total: Number(countResult[0]?.count ?? 0),
  });
});

router.post("/enquiries", async (req, res): Promise<void> => {
  const parsed = CreateEnquiryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [enquiry] = await db.insert(enquiriesTable).values({
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone ?? null,
    whatsapp: parsed.data.whatsapp ?? null,
    country: parsed.data.country ?? null,
    budgetRange: parsed.data.budgetRange ?? null,
    message: parsed.data.message ?? null,
    interestedProjectId: parsed.data.interestedProjectId ?? null,
    source: parsed.data.source ?? null,
  }).returning();

  let projectTitle: string | null = null;
  if (parsed.data.interestedProjectId != null) {
    const [project] = await db
      .select({ title: projectsTable.title })
      .from(projectsTable)
      .where(eq(projectsTable.id, parsed.data.interestedProjectId))
      .limit(1);
    projectTitle = project?.title ?? null;
  }

  void syncEnquiryToGoHighLevel({
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone ?? null,
    whatsapp: parsed.data.whatsapp ?? null,
    country: parsed.data.country ?? null,
    budgetRange: parsed.data.budgetRange ?? null,
    message: parsed.data.message ?? null,
    source: parsed.data.source ?? null,
    interestedProjectTitle: projectTitle,
  }).catch((err) => {
    logger.warn({ err, enquiryId: enquiry.id }, "GoHighLevel sync failed after enquiry save");
  });

  res.status(201).json(mapEnquiry(enquiry, projectTitle));
});

router.delete("/enquiries/:id", async (req, res): Promise<void> => {
  const params = DeleteEnquiryParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [enquiry] = await db
    .delete(enquiriesTable)
    .where(eq(enquiriesTable.id, params.data.id))
    .returning();

  if (!enquiry) {
    res.status(404).json({ error: "Enquiry not found" });
    return;
  }

  res.json({ success: true });
});

function mapEnquiry(e: typeof enquiriesTable.$inferSelect, projectTitle: string | null | undefined) {
  return {
    id: e.id,
    name: e.name,
    email: e.email,
    phone: e.phone ?? null,
    whatsapp: e.whatsapp ?? null,
    country: e.country ?? null,
    budgetRange: e.budgetRange ?? null,
    message: e.message ?? null,
    interestedProjectId: e.interestedProjectId ?? null,
    interestedProjectTitle: projectTitle ?? null,
    source: e.source ?? null,
    createdAt: e.createdAt.toISOString(),
  };
}

export default router;
