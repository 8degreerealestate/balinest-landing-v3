import { Router } from "express";
import { eq, sql } from "drizzle-orm";
import { db } from "@workspace/db";
import { projectsTable, unitsTable, enquiriesTable, blogPostsTable } from "@workspace/db";

const router = Router();

router.get("/stats/dashboard", async (_req, res): Promise<void> => {
  const [projectStats, unitStats, enquiryStats, blogStats, recentEnquiries] = await Promise.all([
    db.select({
      total: sql<number>`count(*)`,
      ongoing: sql<number>`count(*) filter (where status = 'ongoing')`,
      completed: sql<number>`count(*) filter (where status = 'completed')`,
    }).from(projectsTable),
    db.select({
      total: sql<number>`count(*)`,
      available: sql<number>`count(*) filter (where status = 'available')`,
      sold: sql<number>`count(*) filter (where status = 'sold')`,
      reserved: sql<number>`count(*) filter (where status = 'reserved')`,
    }).from(unitsTable),
    db.select({ total: sql<number>`count(*)` }).from(enquiriesTable),
    db.select({ total: sql<number>`count(*)` }).from(blogPostsTable),
    db.select({ total: sql<number>`count(*)` }).from(enquiriesTable)
      .where(sql`created_at >= now() - interval '30 days'`),
  ]);

  res.json({
    totalProjects: Number(projectStats[0]?.total ?? 0),
    ongoingProjects: Number(projectStats[0]?.ongoing ?? 0),
    completedProjects: Number(projectStats[0]?.completed ?? 0),
    totalUnits: Number(unitStats[0]?.total ?? 0),
    availableUnits: Number(unitStats[0]?.available ?? 0),
    soldUnits: Number(unitStats[0]?.sold ?? 0),
    reservedUnits: Number(unitStats[0]?.reserved ?? 0),
    totalEnquiries: Number(enquiryStats[0]?.total ?? 0),
    newEnquiriesThisMonth: Number(recentEnquiries[0]?.total ?? 0),
    totalBlogPosts: Number(blogStats[0]?.total ?? 0),
  });
});

router.get("/stats/overview", async (_req, res): Promise<void> => {
  const [projectStats, unitStats] = await Promise.all([
    db.select({
      total: sql<number>`count(*)`,
      completed: sql<number>`count(*) filter (where status = 'completed')`,
    }).from(projectsTable),
    db.select({ total: sql<number>`count(*)` }).from(unitsTable),
  ]);

  res.json({
    totalProjects: Number(projectStats[0]?.total ?? 0),
    completedProjects: Number(projectStats[0]?.completed ?? 0),
    totalUnits: Number(unitStats[0]?.total ?? 0),
    yearsExperience: 8,
    averageRoi: "15-22%",
  });
});

export default router;
