import fs from "node:fs";
import path from "node:path";
import type { Plugin } from "vite";
import { RESERVED_ROOT_SLUGS } from "./site-paths";

/** Folders under `public/` that may ship a standalone `index.html` (partner landings, previews). */
const STATIC_HTML_ALLOWLIST = new Set([
  "8-degree-real-estate-x-balinest-villa",
  "8-degree-real-estate-x-only-stays",
  "balinest",
  "blog-previews",
]);

/**
 * Vercel (and Vite preview) serve `public/<route>/index.html` before SPA rewrites.
 * A leftover design stub at `public/invest/index.html` breaks direct links to `/invest`.
 */
export function spaStaticConflictGuard(publicDir: string): Plugin {
  return {
    name: "8degree-spa-static-conflict-guard",
    buildStart() {
      const conflicts: string[] = [];
      for (const slug of RESERVED_ROOT_SLUGS) {
        if (STATIC_HTML_ALLOWLIST.has(slug)) continue;
        const indexPath = path.join(publicDir, slug, "index.html");
        if (fs.existsSync(indexPath)) {
          conflicts.push(`public/${slug}/index.html`);
        }
      }
      if (conflicts.length === 0) return;
      throw new Error(
        [
          "Static HTML files shadow React routes (direct URLs will not load the app):",
          ...conflicts.map((p) => `  - ${p}`),
          "Remove these files or move them outside reserved route folders.",
        ].join("\n"),
      );
    },
  };
}
