# 8degree.co production cutover (WordPress → Vercel)

**Architecture after launch:** GoDaddy (DNS only) → Vercel (hosting) → custom React site. WordPress on Hostinger is deprecated after validation.

**Status (last run):** SEO crawl completed (281 WordPress URLs), `seo:build` generated 250 redirects / 72 sitemap paths, staging compare **0 errors** (514 warnings — mostly client-rendered H1/title; expected for SPA).

---

## 1. Vercel production domain

In [Vercel → balinest-landing-v3 → Settings → Domains](https://vercel.com/matts-projects-cb3e7451/balinest-landing-v3/settings/domains):

1. Add **`8degree.co`** (apex)
2. Add **`www.8degree.co`**
3. Set **primary domain** to `8degree.co` (non-www)
4. Enable **Redirect www to apex** (or rely on `vercel.json` host redirect already configured)

Wait until Vercel shows **Valid Configuration** and SSL certificate issued for both hostnames.

---

## 2. Production environment variables

In Vercel → Settings → Environment Variables → **Production**:

| Variable | Value |
|----------|--------|
| `VITE_PUBLIC_SITE_URL` | `https://8degree.co` |
| `VITE_WHATSAPP_NUMBER_E164` | `6287787169089` |
| `VITE_CONTACT_PHONE_DISPLAY` | `+62 877 8716 9089` |
| `VITE_CONTACT_EMAIL` | `hello@8degree.com` |
| `DATABASE_URL` | Supabase pooler URL (already set) |

**Critical:** `VITE_PUBLIC_SITE_URL` is baked in at **build time**. After changing it, trigger a **new production deploy**.

---

## 3. Pre-cutover build (run locally or in CI)

```bash
# Crawl live WordPress (while still on 8degree.co)
WP_ORIGIN=https://8degree.co pnpm seo:crawl

# Generate redirects, metadata, seo-data.ts, sync vercel.json
pnpm seo:build

# Staging parity check (0 errors required)
pnpm seo:compare -- --staging=https://balinest-landing-v3.vercel.app

# Production artifact build (sitemap + robots use 8degree.co)
VITE_PUBLIC_SITE_URL=https://8degree.co pnpm --filter @workspace/8degree run build
```

Verify:

- `artifacts/8degree/dist/public/sitemap.xml` → `https://8degree.co/...` URLs
- `artifacts/8degree/dist/public/robots.txt` → `Sitemap: https://8degree.co/sitemap.xml`
- `migration/compare-report.json` → `"errors": []`

Deploy:

```bash
pnpm vercel:deploy
# or push matts-fixes if Git integration triggers production builds
```

---

## 4. Redirects (301)

Configured in `vercel.json` (synced by `pnpm seo:build`):

| Legacy | New |
|--------|-----|
| `/blog` | `/journal` |
| `/blog/:slug` | `/journal/:slug` |
| `/property` | `/projects` |
| `/property/:code` | `/properties/:code` |
| `/:legacy-post-slug` | `/journal/:slug` (44+ articles) |
| `www.8degree.co/*` | `https://8degree.co/*` |

Full list: `migration/redirects.json` (~250 rules).

---

## 5. GoDaddy DNS cutover

**Before changing DNS:** confirm Vercel domain panel shows the DNS records to add.

### Remove (old WordPress / Hostinger)

- A record pointing apex to Hostinger IP
- CNAME `www` → Hostinger / WordPress
- Any parking / forwarding records for `@` or `www`

### Add (Vercel — use values from your Vercel domain panel)

**Option A — Vercel DNS (recommended if you can change nameservers)**

- Point GoDaddy nameservers to Vercel (Vercel provides NS records)

**Option B — Keep GoDaddy DNS**

| Type | Host | Value |
|------|------|--------|
| A | `@` | `76.76.21.21` (Vercel apex — confirm in dashboard) |
| CNAME | `www` | `cname.vercel-dns.com` (confirm in dashboard) |

TTL: 600s (10 min) during cutover; increase after stable.

Propagation: 15 minutes – 48 hours. Test with `dig 8degree.co` / [dnschecker.org](https://dnschecker.org).

---

## 6. Post-cutover verification (within 1 hour)

```bash
BASE=https://8degree.co
# Homepage + SPA routes
curl -sI "$BASE/" | head -1
curl -sI "$BASE/journal" | head -1
curl -sI "$BASE/projects" | head -1
curl -sI "$BASE/contact" | head -1
curl -sI "$BASE/investment-guide" | head -1

# SEO files
curl -sI "$BASE/sitemap.xml" | head -1
curl -s "$BASE/robots.txt"

# Legacy redirects (301)
curl -sI "$BASE/blog" | grep -i location
curl -sI "$BASE/blog/why-bali-is-the-ultimate-investment-destination" | grep -i location
curl -sI "$BASE/property/8d25145" | grep -i location
curl -sI "https://www.8degree.co/journal" | grep -i location

# www canonical
curl -sI "https://www.8degree.co/" | grep -i location
```

**Browser checks**

- [ ] Homepage, projects, journal (44 posts), contact, investment guide
- [ ] Old blog URL redirects to `/journal/:slug`
- [ ] Old `/property/:code` redirects to `/properties/:code`
- [ ] View source / DevTools → canonical = `https://8degree.co/...`
- [ ] No accidental `noindex` on public pages
- [ ] HTTPS padlock valid on apex and www

Re-run compare against production:

```bash
pnpm seo:compare -- --staging=https://8degree.co
```

---

## 7. Google Search Console

1. Property: `https://8degree.co` (domain or URL prefix)
2. Submit sitemap: `https://8degree.co/sitemap.xml`
3. URL inspection → request indexing for: `/`, `/projects`, `/journal`, `/investment-guide`, `/contact`, top 10 journal URLs
4. Monitor **Pages**, **Sitemaps**, **Redirects** (2–6 weeks)

---

## 8. Monitoring (2–6 weeks)

- GSC: impressions, coverage, crawl errors
- Redirect errors (GSC + manual spot checks)
- Core Web Vitals
- Rankings for branded + “Bali property” terms

If rankings drop: check redirects → canonicals → missing metadata → rerun `seo:compare`.

---

## 9. WordPress decommission (after 2–6 weeks stable SEO)

**Do not delete immediately.** Keep:

- Hostinger / WP admin access (read-only)
- Database export (`.sql`)
- `wp-content/uploads` media backup
- `migration/seo-audit.json` + `redirects.json` as reference

Then archive or disable hosting so production traffic cannot hit WordPress.

---

## Quick reference

| Item | Location |
|------|----------|
| Redirect rules | `vercel.json`, `migration/redirects.json` |
| Page meta | `migration/page-metadata.json` |
| Journal meta | `migration/journal-seo.json` |
| WP crawl | `migration/seo-audit.json` |
| Compare report | `migration/compare-report.json` |
| Runtime bundle | `artifacts/8degree/src/generated/seo-data.ts` |
| Staging URL | https://balinest-landing-v3.vercel.app |
