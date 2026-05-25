import { Router } from "express";
import { db } from "@workspace/db";
import { testimonialsTable } from "@workspace/db";

const router = Router();

router.get("/testimonials", async (_req, res): Promise<void> => {
  const testimonials = await db
    .select()
    .from(testimonialsTable)
    .orderBy(testimonialsTable.id);

  res.json({
    testimonials: testimonials.map(t => ({
      id: t.id,
      name: t.name,
      country: t.country,
      quote: t.quote,
      projectTitle: t.projectTitle ?? null,
      avatarUrl: t.avatarUrl ?? null,
      rating: t.rating,
    })),
  });
});

export default router;
