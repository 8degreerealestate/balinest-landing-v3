import https from "node:https";
import { URL } from "node:url";

const IPV4_RE = /^\d{1,3}(\.\d{1,3}){3}$/;

function legacyWpSniHostname(): string {
  return (
    process.env.JOURNAL_MEDIA_SNI?.trim() ||
    process.env.JOURNAL_MEDIA_HOST?.trim() ||
    ""
  );
}

function needsLegacyWpTls(urlString: string, upstreamBase: string): boolean {
  const sni = legacyWpSniHostname();
  if (!sni) return false;
  try {
    const target = new URL(urlString);
    const base = new URL(upstreamBase);
    if (IPV4_RE.test(target.hostname) || IPV4_RE.test(base.hostname)) return true;
    if (target.hostname !== sni) return true;
  } catch {
    return false;
  }
  return false;
}

function legacyWpGet(
  urlString: string,
  upstreamBase: string,
): Promise<{ ok: boolean; contentType: string; buffer: Buffer }> {
  const sni = legacyWpSniHostname();
  const target = new URL(urlString);
  const base = new URL(upstreamBase);
  const host = IPV4_RE.test(base.hostname) ? base.hostname : target.hostname;

  return new Promise((resolve, reject) => {
    const req = https.get(
      {
        host,
        port: base.port || 443,
        servername: sni,
        path: `${target.pathname}${target.search}`,
        headers: {
          Host: sni,
          Accept: "image/*,*/*;q=0.8",
          "User-Agent": "8degree-journal-media/1.0",
        },
        rejectUnauthorized: false,
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => {
          const buffer = Buffer.concat(chunks);
          const status = res.statusCode ?? 0;
          resolve({
            ok: status >= 200 && status < 300,
            contentType: String(res.headers["content-type"] ?? ""),
            buffer,
          });
        });
      },
    );
    req.on("error", reject);
  });
}

/**
 * Fetch journal uploads from a legacy WordPress host (e.g. https://legacy.8degree.co).
 * Tries scaled/original filename variants like WordPress generates.
 */
export function journalUploadCandidateUrls(origin: string, rel: string): string[] {
  const cleanRel = rel.replace(/^\/+/, "");
  if (!cleanRel || cleanRel.includes("..")) return [];

  const base = origin.replace(/\/$/, "");
  const urls = [`${base}/wp-content/uploads/${cleanRel}`];

  const alt = cleanRel.replace(/-scaled\.(jpe?g|png|webp)$/i, ".$1");
  if (alt !== cleanRel) urls.push(`${base}/wp-content/uploads/${alt}`);

  const sized = cleanRel.replace(/\.(jpe?g|png|webp)$/i, "-1024x683.$1");
  if (sized !== cleanRel) urls.push(`${base}/wp-content/uploads/${sized}`);

  return urls;
}

export function journalMediaUpstreamBase(): string | null {
  const raw =
    process.env.JOURNAL_MEDIA_SOURCE_BASE?.trim() ||
    process.env.LEGACY_WP_ORIGIN?.trim() ||
    process.env.JOURNAL_WP_MEDIA_ORIGIN?.trim();
  return raw ? raw.replace(/\/$/, "") : null;
}

export async function fetchJournalUploadFromUpstream(
  rel: string,
): Promise<{ buffer: Buffer; contentType: string; url: string } | null> {
  const upstream = journalMediaUpstreamBase();
  if (!upstream) return null;

  for (const url of journalUploadCandidateUrls(upstream, rel)) {
    try {
      let ok = false;
      let contentType = "";
      let buf = Buffer.alloc(0);

      if (needsLegacyWpTls(url, upstream)) {
        const res = await legacyWpGet(url, upstream);
        ok = res.ok;
        contentType = res.contentType;
        buf = res.buffer;
      } else {
        const res = await fetch(url, {
          headers: { Accept: "image/*,*/*;q=0.8", "User-Agent": "8degree-journal-media/1.0" },
          redirect: "follow",
        });
        if (!res.ok) continue;
        contentType = res.headers.get("content-type") ?? "";
        buf = Buffer.from(await res.arrayBuffer());
        ok = true;
      }

      if (!ok || !/^image\//i.test(contentType)) continue;
      if (buf.length < 200) continue;
      return { buffer: buf, contentType, url };
    } catch {
      /* try next */
    }
  }
  return null;
}
