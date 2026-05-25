import { Router, type IRouter } from "express";
import { HealthCheckResponse } from "@workspace/api-zod";
import { isDatabaseConfigured } from "@workspace/db";

const router: IRouter = Router();

router.get("/healthz", (_req, res) => {
  const data = HealthCheckResponse.parse({ status: "ok" });
  res.json({
    ...data,
    database: isDatabaseConfigured() ? "configured" : "not_configured",
    inventorySource: process.env.PROPERTY_INVENTORY_SOURCE?.trim() || "sheet",
  });
});

export default router;
