/**
 * Journal images ship as static files under `public/journal-media/` (Vercel CDN).
 * Legacy WordPress HTML still references `/wp-content/uploads/...`; we rewrite those to
 * `/journal-media/...` because Vercel blocks direct `/wp-content/` paths in production.
 */

export const WP_UPLOADS_PREFIX = "/wp-content/uploads";

/** Same-origin path used in `<img src>` (mirrors WordPress upload subpaths). */
export const JOURNAL_MEDIA_SERVE_PREFIX = "/journal-media";

/** @deprecated Alias — use {@link JOURNAL_MEDIA_SERVE_PREFIX} for new URLs. */
export const JOURNAL_MEDIA_PREFIX = JOURNAL_MEDIA_SERVE_PREFIX;

/** Exists in `public/site-media/` — used when a mirrored upload is missing. */
export const JOURNAL_IMAGE_FALLBACK = "/site-media/bali-island-outline.svg";

const UPLOADS_RE = /\/wp-content\/uploads\/(.+?)(?:\?[^"'\\s]*)?$/i;

export function journalUploadRelativePath(url: string | null | undefined): string | null {
  if (!url?.trim()) return null;
  const t = url.trim();
  if (t.startsWith(`${WP_UPLOADS_PREFIX}/`)) {
    return t.slice(WP_UPLOADS_PREFIX.length + 1);
  }
  if (t.startsWith("/journal-media/")) {
    return t.slice("/journal-media/".length).replace(/^\/+/, "");
  }
  const m = UPLOADS_RE.exec(t);
  if (m?.[1]) return m[1].replace(/^\/+/, "");
  if (t.startsWith("/wp-content/uploads/")) {
    return t.slice("/wp-content/uploads/".length).replace(/^\/+/, "");
  }
  return null;
}

/**
 * Map legacy WordPress URLs to same-origin `/journal-media/...` static paths.
 * Never returns `https://8degree.co/wp-content/...` (blocked or HTML on production).
 */
export function resolveJournalImageUrl(url: string | null | undefined): string | null {
  if (!url?.trim()) return null;
  const rel = journalUploadRelativePath(url);
  if (rel) return `${JOURNAL_MEDIA_SERVE_PREFIX}/${rel}`;
  const trimmed = url.trim();
  if (/^https?:\/\/(?:www\.)?8degree\.co\/wp-content\/uploads\//i.test(trimmed)) {
    const rel2 = journalUploadRelativePath(trimmed);
    if (rel2) return `${JOURNAL_MEDIA_SERVE_PREFIX}/${rel2}`;
  }
  if (trimmed.startsWith(`${WP_UPLOADS_PREFIX}/`)) {
    return `${JOURNAL_MEDIA_SERVE_PREFIX}/${trimmed.slice(WP_UPLOADS_PREFIX.length + 1)}`;
  }
  return trimmed;
}

/** Rewrite inline `<img src>` in imported post HTML. */
export function rewriteJournalContentHtml(html: string): string {
  if (!html) return html;
  return html
    .replace(
      /https?:\/\/(?:www\.)?8degree\.co\/wp-content\/uploads\//gi,
      `${JOURNAL_MEDIA_SERVE_PREFIX}/`,
    )
    .replace(/\/wp-content\/uploads\//gi, `${JOURNAL_MEDIA_SERVE_PREFIX}/`);
}

/** Use on `<img onError={onJournalImageError} />` — avoids broken icon + alt when uploads 404. */
export function onJournalImageError(e: { currentTarget: HTMLImageElement }): void {
  const img = e.currentTarget;
  if (img.dataset.journalFallback === "1") return;
  img.dataset.journalFallback = "1";
  img.src = JOURNAL_IMAGE_FALLBACK;
}
