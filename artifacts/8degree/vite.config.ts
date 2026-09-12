import fs from "node:fs";
import path from "path";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { spaStaticConflictGuard } from "./src/lib/spa-static-conflict-guard";

const DEFAULT_GTM_ID = "GTM-KW37FZ3F";

function gtmHtmlPlugin(): Plugin {
  const gtmId = (process.env.VITE_GTM_ID ?? DEFAULT_GTM_ID).trim();
  return {
    name: "8degree-gtm-html",
    transformIndexHtml(html) {
      if (!gtmId) return html;
      const headScript = `<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmId}');</script>
<!-- End Google Tag Manager -->`;
      const bodyNoscript = `<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${gtmId}"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->`;
      return html
        .replace("</head>", `    ${headScript}\n  </head>`)
        .replace("<body>", `<body>\n    ${bodyNoscript}`);
    },
  };
}

function loadSitemapPaths(): string[] {
  const generated = path.resolve(import.meta.dirname, "../../migration/sitemap-paths.json");
  if (fs.existsSync(generated)) {
    return JSON.parse(fs.readFileSync(generated, "utf8")) as string[];
  }
  return ["/", "/projects", "/journal", "/about-us", "/contact", "/investment-guide"];
}

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
        const paths = loadSitemapPaths();
        const body = paths.map(
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

const apiTarget = process.env.API_URL ?? "http://localhost:8080";

const apiDevProxy = {
  "/api": {
    target: apiTarget,
    changeOrigin: true,
  },
  "/wp-content/uploads": {
    target: apiTarget,
    changeOrigin: true,
    rewrite: (p: string) => `/api/journal-media${p.replace(/^\/wp-content\/uploads/, "")}`,
  },
};

export default defineConfig({
  base: basePath,
  /** Monorepo root `.env` / `.env.local` (DATABASE_URL, VITE_*, API_URL, etc.) */
  envDir: path.resolve(import.meta.dirname, "..", ".."),
  plugins: [
    react(),
    tailwindcss(),
    gtmHtmlPlugin(),
    spaStaticConflictGuard(path.resolve(import.meta.dirname, "public")),
    seoStaticPlugin(basePath),
  ],
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
