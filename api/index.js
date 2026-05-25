module.exports = async (req, res) => {
  const mod = await import("../artifacts/api-server/dist/app.mjs");
  return mod.default(req, res);
};
