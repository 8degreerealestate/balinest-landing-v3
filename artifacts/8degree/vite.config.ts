import fs from "node:fs";
import path from "path";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const SEO_SITEMAP_PATHS = [
  "/",
  "/sell",
  "/about-us",
  "/buyer-agents",
  "/buyer-agent",
  "/journal",
  "/favorite-properties",
  "/buy-land",
  "/frequently-asked-questions",
  "/company-overview",
  "/testimony",
  "/legal-services",
  "/legal-and-due-diligence",
  "/data-driven",
  "/bali-property-guide",
  "/bali-location-guide",
  "/location-guide",
  "/projects",
  "/projects/completed",
  "/about",
  "/contact",
  "/invest",
  "/investment-guide",
  "/pricing",
  "/blog",
];

function seoStaticPlugin(base: string): Plugin {
  return {
    name: "8degree-seo-static",
    closeBundle() {
      const outDir = path.resolve(import.meta.dirname, "dist/public");
      if (!fs.existsSync(outDir)) return;
      const site = (process.env.VITE_PUBLIC_SITE_URL || "").trim().replace(/\/$/, "");
      const baseNorm = base === "/" ? "" : base.replace(/\/$/, "");
      const absolute = (pathname: string) => {
        const p = pathname.startsWith("/") ? pathname : `/${pathname}`;
        return `${site}${baseNorm}${p}`;
      };
      if (site) {
        const body = SEO_SITEMAP_PATHS.map(
          (loc) => `  <url>\n    <loc>${absolute(loc)}</loc>\n    <changefreq>weekly</changefreq>\n  </url>`,
        ).join("\n");
        fs.writeFileSync(
          path.join(outDir, "sitemap.xml"),
          `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`,
        );
        fs.writeFileSync(
          path.join(outDir, "robots.txt"),
          `User-agent: *\nAllow: /\nDisallow: /admin/\n\nSitemap: ${absolute("/sitemap.xml")}\n`,
        );
      } else {
        fs.writeFileSync(
          path.join(outDir, "robots.txt"),
          `User-agent: *\nAllow: /\nDisallow: /admin/\n\n# Set VITE_PUBLIC_SITE_URL to emit sitemap.xml on production build.\n`,
        );
      }
    },
  };
}

const rawPort = process.env.PORT ?? "5173";
const parsedPort = Number(rawPort);
const port = Number.isFinite(parsedPort) && parsedPort > 0 ? parsedPort : 5173;
const basePath = process.env.BASE_PATH ?? "/";

// Live preview (Cursor / VS Code), tunnels, and IPv6 often need a non-loopback
// bind plus permissive Host checks. Set VITE_STRICT_LOCAL=1 for 127.0.0.1 only.
const strictLocal = process.env.VITE_STRICT_LOCAL === "1";

const apiDevProxy = {
  "/api": {
    target: process.env.API_URL ?? "http://localhost:8080",
    changeOrigin: true,
  },
};

export default defineConfig({
  base: basePath,
  /** Monorepo root `.env` / `.env.local` (DATABASE_URL, VITE_*, API_URL, etc.) */
  envDir: path.resolve(import.meta.dirname, "..", ".."),
  plugins: [react(), tailwindcss(), seoStaticPlugin(basePath)],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@assets": path.resolve(import.meta.dirname, "..", "..", "attached_assets"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    target: "es2022",
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (id.includes("framer-motion")) return "motion";
          if (id.includes("@tanstack/react-query")) return "rq";
          if (id.includes("recharts")) return "charts";
          if (id.includes("@radix-ui")) return "radix";
          if (id.includes("lucide-react")) return "icons";
        },
      },
    },
  },
  server: {
    port,
    host: strictLocal ? "127.0.0.1" : true,
    ...(strictLocal ? {} : { allowedHosts: true as const }),
    proxy: apiDevProxy,
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
  preview: {
    port,
    host: strictLocal ? "127.0.0.1" : true,
    ...(strictLocal ? {} : { allowedHosts: true as const }),
    proxy: apiDevProxy,
  },
});
