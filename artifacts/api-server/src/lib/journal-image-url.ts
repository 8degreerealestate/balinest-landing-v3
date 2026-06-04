/** Journal images use `/wp-content/uploads/...` (see `artifacts/8degree/public/wp-content/uploads/`). */

export const WP_UPLOADS_PREFIX = "/wp-content/uploads";

export const JOURNAL_MEDIA_PREFIX = WP_UPLOADS_PREFIX;

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
