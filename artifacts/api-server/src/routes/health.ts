import { Router, type IRouter } from "express";
import { HealthCheckResponse } from "@workspace/api-zod";
import {
  databaseProviderLabel,
  isDatabaseConfigured,
  pingDatabase,
} from "@workspace/db";
import { isGoHighLevelSyncEnabled, probeGoHighLevel } from "../lib/gohighlevel";

const router: IRouter = Router();

router.get("/healthz", async (_req, res) => {
  const data = HealthCheckResponse.parse({ status: "ok" });
  const provider = databaseProviderLabel();
  let database: string = "not_configured";
  if (isDatabaseConfigured()) {
    database = (await pingDatabase()) ? `connected:${provider}` : `error:${provider}`;
  }
  let crm = "disabled";
  if (isGoHighLevelSyncEnabled()) {
    const ghl = await probeGoHighLevel();
    crm = ghl.ok ? "connected" : `error:${ghl.detail ?? "unknown"}`;
  }

  res.json({
    ...data,
    database,
    crm,
    inventorySource: process.env.PROPERTY_INVENTORY_SOURCE?.trim() || "sheet",
  });
});

export default router;
