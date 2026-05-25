import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "../../..");
const envFile = resolve(repoRoot, ".env");
const dist = resolve(here, "../dist/index.mjs");
const nodeArgs = ["--enable-source-maps", dist];
if (existsSync(envFile)) {
  nodeArgs.unshift("--env-file", envFile);
}
const child = spawn(process.execPath, nodeArgs, { stdio: "inherit", env: process.env });
child.on("exit", (code, signal) => {
  if (signal) process.exit(1);
  process.exit(code ?? 0);
});
