/**
 * Journal images are served from `/wp-content/uploads/...` (same paths WordPress used).
 * Mirror files under `public/wp-content/uploads/` or set `JOURNAL_MEDIA_SOURCE_BASE` on the API.
 */

export const WP_UPLOADS_PREFIX = "/wp-content/uploads";

/** @deprecated Alias kept for older links; resolves to the same relative upload path. */
export const JOURNAL_MEDIA_PREFIX = WP_UPLOADS_PREFIX;

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
 * Map legacy WordPress URLs to same-origin `/wp-content/uploads/...` paths.
 * Never returns `https://8degree.co/wp-content/...` (Vercel serves HTML for those).
 */
export function resolveJournalImageUrl(url: string | null | undefined): string | null {
  if (!url?.trim()) return null;
  const rel = journalUploadRelativePath(url);
  if (rel) return `${WP_UPLOADS_PREFIX}/${rel}`;
  const trimmed = url.trim();
  if (/^https?:\/\/(?:www\.)?8degree\.co\/wp-content\/uploads\//i.test(trimmed)) {
    const rel2 = journalUploadRelativePath(trimmed);
    if (rel2) return `${WP_UPLOADS_PREFIX}/${rel2}`;
  }
  return trimmed;
}

/** Rewrite inline `<img src>` in imported post HTML. */
export function rewriteJournalContentHtml(html: string): string {
  if (!html) return html;
  return html
    .replace(
      /https?:\/\/(?:www\.)?8degree\.co\/wp-content\/uploads\//gi,
      `${WP_UPLOADS_PREFIX}/`,
    )
    .replace(/\/journal-media\//gi, `${WP_UPLOADS_PREFIX}/`)
    .replace(/\/wp-content\/uploads\//gi, `${WP_UPLOADS_PREFIX}/`);
}

/** Use on `<img onError={onJournalImageError} />` — avoids broken icon + alt when uploads 404. */
export function onJournalImageError(e: { currentTarget: HTMLImageElement }): void {
  const img = e.currentTarget;
  if (img.dataset.journalFallback === "1") return;
  img.dataset.journalFallback = "1";
  img.src = JOURNAL_IMAGE_FALLBACK;
}
