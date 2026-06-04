import { Router } from "express";
import { createReadStream, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { fetchJournalUploadFromUpstream } from "../lib/journal-media-upstream";
import { journalUploadRelativePath } from "../lib/journal-image-url";

const router = Router();

function uploadsRoots(): string[] {
  const here = path.dirname(fileURLToPath(import.meta.url));
  return [
    path.resolve(here, "../../../8degree/public/journal-media"),
    path.resolve(here, "../../../8degree/public/wp-content/uploads"),
    path.resolve(process.cwd(), "artifacts/8degree/public/journal-media"),
    path.resolve(process.cwd(), "artifacts/8degree/public/wp-content/uploads"),
    path.resolve(process.cwd(), "public/journal-media"),
    path.resolve(process.cwd(), "public/wp-content/uploads"),
  ];
}

function resolveUploadFile(rel: string): string | null {
  for (const root of uploadsRoots()) {
    const filePath = path.join(root, rel);
    if (existsSync(filePath)) return filePath;
  }
  return null;
}

const MIME: Record<string, string> = {
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
};

async function serveUpload(rel: string, res: import("express").Response): Promise<boolean> {
  if (!rel || rel.includes("..")) {
    res.status(400).end();
    return true;
  }

  const filePath = resolveUploadFile(rel);
  if (filePath) {
    const ext = path.extname(filePath).toLowerCase();
    res.setHeader("Content-Type", MIME[ext] ?? "application/octet-stream");
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    createReadStream(filePath).pipe(res);
    return true;
  }

  const fetched = await fetchJournalUploadFromUpstream(rel);
  if (fetched) {
    res.setHeader("Content-Type", fetched.contentType);
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.send(fetched.buffer);
    return true;
  }

  res.status(404).end();
  return true;
}

/** API: `/api/journal-media/...` and legacy alias. */
router.get(/^\/journal-media\/(.+)$/, (req, res) => {
  void serveUpload((req.params[0] ?? "").replace(/^\/+/, ""), res);
});

export default router;
