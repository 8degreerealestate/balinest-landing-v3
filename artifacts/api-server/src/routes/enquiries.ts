import { Router } from "express";
import { eq, and, sql } from "drizzle-orm";
import { db, enquiriesTable, projectsTable, isDatabaseConfigured } from "@workspace/db";
import {
  ListEnquiriesQueryParams,
  CreateEnquiryBody,
  DeleteEnquiryParams,
} from "@workspace/api-zod";
import type { z } from "zod";

type CreateEnquiryPayload = z.infer<typeof CreateEnquiryBody>;
import { isGoHighLevelSyncEnabled, syncEnquiryToGoHighLevel } from "../lib/gohighlevel";
import { logger } from "../lib/logger";

const router = Router();

router.get("/enquiries", async (req, res): Promise<void> => {
  if (!isDatabaseConfigured()) {
    res.status(503).json({
      error: "Enquiry list requires DATABASE_URL on the API server.",
    });
    return;
  }

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
    db
      .select({
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

  const payload = parsed.data;
  let projectTitle: string | null = null;

  if (isDatabaseConfigured() && payload.interestedProjectId != null) {
    const [project] = await db
      .select({ title: projectsTable.title })
      .from(projectsTable)
      .where(eq(projectsTable.id, payload.interestedProjectId))
      .limit(1);
    projectTitle = project?.title ?? null;
  }

  const crmPayload = {
    name: payload.name,
    email: payload.email,
    phone: payload.phone ?? null,
    whatsapp: payload.whatsapp ?? null,
    country: payload.country ?? null,
    budgetRange: payload.budgetRange ?? null,
    message: payload.message ?? null,
    source: payload.source ?? null,
    interestedProjectTitle: projectTitle,
  };

  if (isDatabaseConfigured()) {
    const [enquiry] = await db
      .insert(enquiriesTable)
      .values({
        name: payload.name,
        email: payload.email,
        phone: payload.phone ?? null,
        whatsapp: payload.whatsapp ?? null,
        country: payload.country ?? null,
        budgetRange: payload.budgetRange ?? null,
        message: payload.message ?? null,
        interestedProjectId: payload.interestedProjectId ?? null,
        source: payload.source ?? null,
      })
      .returning();

    void syncEnquiryToGoHighLevel(crmPayload).catch((err) => {
      logger.warn({ err, enquiryId: enquiry.id }, "GoHighLevel sync failed after enquiry save");
    });

    res.status(201).json(mapEnquiry(enquiry, projectTitle));
    return;
  }

  if (!isGoHighLevelSyncEnabled()) {
    logger.error("POST /enquiries: no DATABASE_URL and Go High Level sync disabled");
    res.status(503).json({
      error:
        "Enquiry service is not configured. Set DATABASE_URL or GOHIGHLEVEL_API_TOKEN on the API server.",
    });
    return;
  }

  const { synced } = await syncEnquiryToGoHighLevel(crmPayload);
  if (!synced) {
    logger.warn({ source: payload.source, email: payload.email }, "GoHighLevel sync failed (no database)");
    res.status(502).json({
      error: "We could not deliver your message right now. Please email us directly or try WhatsApp.",
    });
    return;
  }

  res.status(201).json(ephemeralEnquiry(payload, projectTitle));
});

router.delete("/enquiries/:id", async (req, res): Promise<void> => {
  if (!isDatabaseConfigured()) {
    res.status(503).json({ error: "Enquiry delete requires DATABASE_URL on the API server." });
    return;
  }

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

function ephemeralEnquiry(
  payload: CreateEnquiryPayload,
  projectTitle: string | null,
): ReturnType<typeof mapEnquiry> {
  return {
    id: 0,
    name: payload.name,
    email: payload.email,
    phone: payload.phone ?? null,
    whatsapp: payload.whatsapp ?? null,
    country: payload.country ?? null,
    budgetRange: payload.budgetRange ?? null,
    message: payload.message ?? null,
    interestedProjectId: payload.interestedProjectId ?? null,
    interestedProjectTitle: projectTitle,
    source: payload.source ?? null,
    createdAt: new Date().toISOString(),
  };
}

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
