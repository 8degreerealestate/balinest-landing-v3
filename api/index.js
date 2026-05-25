const path = require("node:path");

let appHandler;

module.exports = async (req, res) => {
  try {
    if (!appHandler) {
      const appPath = path.join(process.cwd(), "artifacts/api-server/dist/app.mjs");
      const mod = await import(appPath);
      appHandler = mod.default;
      if (typeof appHandler !== "function") {
        throw new Error("API app export is not a request handler");
      }
    }
    return appHandler(req, res);
  } catch (err) {
    console.error("[api/index] handler error", err);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          error: "API failed to start",
          message: err instanceof Error ? err.message : String(err),
        }),
      );
    }
  }
};
