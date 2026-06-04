# Legacy WordPress subdomain (private migration source)

Use this when **8degree.co** is on Vercel (production) and the old WordPress install still lives on **Hostinger**.

| URL | Role |
|-----|------|
| `https://8degree.co` | **Public** — new React site (Vercel). Unchanged. |
| `https://legacy.8degree.co` | **Private** — old WordPress + `wp-content/uploads` for migration only. |

Do **not** add `legacy.8degree.co` to Vercel. Do **not** link it from the new site navigation.

---

## 1. GoDaddy DNS (subdomain only)

1. [GoDaddy](https://dcc.godaddy.com) → **8degree.co** → **DNS**.
2. Leave `@` and `www` pointing at **Vercel** (do not edit).
3. Add:

   | Type | Name | Value |
   |------|------|--------|
   | A | `legacy` | `145.223.108.51` |

4. Wait until `dig +short legacy.8degree.co` returns `145.223.108.51`.

---

## 2. Hostinger subdomain (same WordPress files)

1. [hPanel](https://hpanel.hostinger.com) → **Websites** → **8degree.co** → **Manage**.
2. **Domains** → **Subdomains** → create **`legacy`**.
3. Set **document root** to **`public_html`** (same folder as the main WordPress site — not `public_html/legacy`).
4. **SSL** → enable free certificate for `legacy.8degree.co`.

---

## 3. WordPress URLs on the legacy host only

Backup the database first (hPanel → **Backups**).

**Recommended** — search-replace in DB (WP-CLI or **Better Search Replace** plugin):

```
https://8degree.co  →  https://legacy.8degree.co
http://8degree.co   →  https://legacy.8degree.co
```

Confirm `wp_options`: `siteurl` and `home` = `https://legacy.8degree.co`.

**Settings → Permalinks** → Save.

**Keep private:** Settings → Reading → discourage search engines (optional). Add to `robots.txt` on legacy:

```
User-agent: *
Disallow: /
```

---

## 4. Wire the new site to pull images

The public site never shows WordPress. It loads images as:

`https://8degree.co/wp-content/uploads/...` → Vercel → API → fetches from legacy.

### Production (Vercel)

**Project → Settings → Environment Variables → Production:**

| Name | Value |
|------|--------|
| `JOURNAL_MEDIA_SOURCE_BASE` | `https://legacy.8degree.co` |

(No trailing slash. Redeploy after saving.)

### Local API

In repo root `.env` (not committed):

```bash
JOURNAL_MEDIA_SOURCE_BASE=https://legacy.8degree.co
```

---

## 5. Verify

```bash
# Legacy WordPress responds
curl -I https://legacy.8degree.co/wp-login.php

# Sample image on legacy (pick a path from journal-import.json)
curl -I "https://legacy.8degree.co/wp-content/uploads/2025/03/Cover-Blog-2.webp"

# After Vercel env + redeploy — image via new site proxy
curl -I "https://8degree.co/wp-content/uploads/2025/03/Cover-Blog-2.webp"

# Repo helper
LEGACY_WP_ORIGIN=https://legacy.8degree.co pnpm journal:verify-media
```

Public homepage must stay the React app:

```bash
curl -I https://8degree.co/   # should NOT show x-powered-by: PHP
```

---

## 6. Optional: copy images into the repo (faster, no runtime dependency)

```bash
JOURNAL_MEDIA_SOURCE_BASE=https://legacy.8degree.co pnpm journal:sync-media
```

Commit `artifacts/8degree/public/wp-content/uploads/` and deploy. You can remove `JOURNAL_MEDIA_SOURCE_BASE` from Vercel later if everything is local.

---

## 7. Revert after migration

1. Reverse DB search-replace on Hostinger (or restore backup).
2. Delete GoDaddy **A** record for `legacy`.
3. Remove Hostinger subdomain.
4. Remove `JOURNAL_MEDIA_SOURCE_BASE` from Vercel.

`https://8degree.co` is unaffected throughout.
