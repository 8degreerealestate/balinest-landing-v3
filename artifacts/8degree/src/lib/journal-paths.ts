/** Public journal URLs (matches live site https://8degree.co/journal/). */
export const JOURNAL_PATH = "/journal";

export function journalPostPath(slug: string): string {
  return `${JOURNAL_PATH}/${encodeURIComponent(slug)}`;
}
