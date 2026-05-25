import { Router, type IRouter } from "express";
import { HealthCheckResponse } from "@workspace/api-zod";
import {
  databaseProviderLabel,
  isDatabaseConfigured,
  pingDatabase,
} from "@workspace/db";

const router: IRouter = Router();

router.get("/healthz", async (_req, res) => {
  const data = HealthCheckResponse.parse({ status: "ok" });
  const provider = databaseProviderLabel();
  let database: string = "not_configured";
  if (isDatabaseConfigured()) {
    database = (await pingDatabase()) ? `connected:${provider}` : `error:${provider}`;
  }
  res.json({
    ...data,
    database,
    inventorySource: process.env.PROPERTY_INVENTORY_SOURCE?.trim() || "sheet",
  });
});

export default router;
