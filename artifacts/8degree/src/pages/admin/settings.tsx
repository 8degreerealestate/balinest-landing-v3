export default function AdminSettings() {
  return (
    <div className="p-8 max-w-2xl">
      <h1 className="font-serif text-3xl mb-1">Settings</h1>
      <p className="text-muted-foreground text-sm mb-6">
        Optional site and integration settings. This section is a placeholder until configuration is wired up.
      </p>
      <div className="border border-border bg-card p-6 text-sm text-muted-foreground space-y-3">
        <p>No UI toggles yet. Inventory listing source is controlled on the API process:</p>
        <p className="text-foreground/80 text-[13px] font-sans">
          <strong>Frontend → API host:</strong> Inventory loads from the Node API (Google Sheet + Postgres), not
          WordPress. On Vercel with DNS on this project, leave <code>VITE_API_BASE_URL</code> unset so{" "}
          <code>/api</code> is same-origin. If the SPA is on another host, set <code>VITE_API_BASE_URL</code> to your API
          origin (no trailing slash). Local dev: unset (Vite proxies to <code>API_URL</code> / localhost:8080).
        </p>
        <ul className="list-disc pl-5 space-y-1 text-xs font-sans text-foreground/90">
          <li>
            PROPERTY_INVENTORY_SOURCE: <strong>Google Sheets only</strong> for inventory when unset or <code>sheet</code>{" "}
            (or any value other than <code>database</code> / <code>db</code> / <code>postgres</code>). Use{" "}
            <code>database</code> for Postgres-only CRM rows (no sheet fetch).
          </li>
          <li>
            PROPERTY_INVENTORY_SHEET_EXPORT_URL / SPREADSHEET_ID / SHEET_GID: optional sheet overrides (see API server).
          </li>
          <li className="text-foreground/80 list-none -ml-5 mt-2 font-sans text-[13px]">
            <strong>Featured on the public site:</strong> rows come from the sheet; <strong>featured / draft / sold</strong>{" "}
            overrides are stored in Postgres (<code>inventory_listing_meta</code>) when you use Admin → Inventory actions.
            Apply the SQL migration in <code className="text-xs">scripts/sql/inventory_listing_meta.sql</code> if PATCH
            returns 503.
          </li>
          <li className="text-foreground/80 list-none -ml-5 mt-2 font-sans text-[13px]">
            <code>PROPERTY_INVENTORY_DEBUG=1</code> on the API logs sheet vs Postgres selection. When debug is on, listing
            responses may include <code>X-8degree-Inventory-Source: google_sheet</code> or <code>postgres</code>.
          </li>
          <li className="text-foreground/80 list-none -ml-5 mt-2 font-sans text-[13px]">
            <strong>CRM (Go High Level):</strong> set <code>GOHIGHLEVEL_API_TOKEN</code> and preferably{" "}
            <code>GOHIGHLEVEL_LOCATION_ID</code> on the API process. Every <code>POST /api/enquiries</code> saves to
            Postgres then upserts the contact in GHL (non-blocking). Disable with <code>GOHIGHLEVEL_SYNC_ENABLED=0</code>.
            WhatsApp / email on the public site use <code>VITE_WHATSAPP_NUMBER_E164</code>, <code>VITE_CONTACT_EMAIL</code>{" "}
            at build time (see root <code>.env.example</code>).
          </li>
          <li className="text-foreground/80 list-none -ml-5 mt-2">
            Sheet sharing must be <strong>Viewer</strong> for &ldquo;Anyone with the link&rdquo;, not Commenter, so the API
            can fetch CSV without a Google login.
          </li>
        </ul>

        <div className="border-t border-border pt-4 mt-4 space-y-3 text-[13px] font-sans text-foreground/85">
          <p className="font-medium text-foreground">Production deploy (Express + Google Sheet inventory)</p>
          <ol className="list-decimal pl-5 space-y-2">
            <li>
              <strong>API server env</strong> (runtime): <code className="text-xs">DATABASE_URL</code>,{" "}
              <code className="text-xs">PORT</code>, sheet URL or ID/GID vars as needed. Leave{" "}
              <code className="text-xs">PROPERTY_INVENTORY_SOURCE</code> unset (or <code className="text-xs">sheet</code>) so
              listings load from the shared Google Sheet. Deploy/restart the api-server process.
            </li>
            <li>
              <strong>Smoke-test API</strong> (replace origin):{" "}
              <code className="text-xs break-all">curl -sS &quot;https://YOUR_API_ORIGIN/api/healthz&quot;</code> → JSON{" "}
              <code className="text-xs">status: ok</code>. Then{" "}
              <code className="text-xs break-all">
                curl -sS &quot;https://YOUR_API_ORIGIN/api/inventory/listings?limit=2&quot;
              </code>{" "}
              → JSON with <code className="text-xs">listings</code> and <code className="text-xs">total</code> matching your
              sheet (after the sheet is shared as Viewer for anyone with the link).
            </li>
            <li>
              <strong>Frontend build env</strong> (build-time only):{" "}
              <code className="text-xs">VITE_API_BASE_URL=https://YOUR_API_ORIGIN</code> (same host as step 2),{" "}
              <strong>no</strong> trailing slash, <strong>no</strong> <code className="text-xs">/api</code> suffix. Run{" "}
              <code className="text-xs">pnpm --filter @workspace/8degree run build</code> (the build runs a guard that
              rejects raw <code className="text-xs">fetch(&quot;/api/…&quot;)</code> in <code className="text-xs">src/</code>
              ).
            </li>
            <li>
              <strong>Vercel</strong>: connect this Git repo, leave root directory at repo root (uses <code className="text-xs">vercel.json</code>
              ). Under <strong>Settings → Environment Variables</strong>, add for <strong>Production</strong> and{" "}
              <strong>Preview</strong>: <code className="text-xs">VITE_API_BASE_URL</code> (your deployed API origin), and{" "}
              <code className="text-xs">VITE_PUBLIC_SITE_URL</code> (your site URL, no trailing slash, for SEO/sitemap). Redeploy
              after changing env vars (Vite bakes them in at build time).
            </li>
            <li>
              <strong>Upload static assets</strong> from <code className="text-xs">artifacts/8degree/dist/public</code> to
              WordPress / your CDN so the live admin loads the new bundle.
            </li>
            <li>
              <strong>CORS</strong>: if the SPA origin (e.g. <code className="text-xs">https://8degree.co</code>) differs from
              the API origin, ensure the Express app allows that browser origin (this repo uses permissive{" "}
              <code className="text-xs">cors()</code> by default).
            </li>
          </ol>

          <p className="font-medium text-foreground pt-2">Post-deploy checklist</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              Browser → <strong>Network</strong> on <code className="text-xs">/admin/inventory</code>:{" "}
              <code className="text-xs">GET …/api/inventory/listings</code> must show your <strong>Express API origin</strong>{" "}
              in the full URL (not only <code className="text-xs">8degree.co</code> unless Express is reverse-proxied there).
            </li>
            <li>Status <strong>200</strong>, response body is JSON (not HTML).</li>
            <li>
              <code className="text-xs">total</code> and rows match expectations; optional: set{" "}
              <code className="text-xs">PROPERTY_INVENTORY_DEBUG=1</code> on the API and confirm header{" "}
              <code className="text-xs">X-8degree-Inventory-Source: google_sheet</code> when the sheet is the source.
            </li>
            <li>
              <strong>Refresh sources</strong> still works (POST to the same API origin via <code className="text-xs">apiUrl()</code>
              ).
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
