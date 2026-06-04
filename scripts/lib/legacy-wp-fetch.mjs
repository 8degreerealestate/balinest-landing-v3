/**
 * Fetch assets from WordPress still on Hostinger when the public domain points at Vercel.
 * Use JOURNAL_MEDIA_SOURCE_BASE=https://145.223.108.51 and JOURNAL_MEDIA_SNI=8degree.co
 * (or JOURNAL_MEDIA_HOST — same value) so TLS SNI + Host match the vhost.
 */
import https from "node:https";
import { URL } from "node:url";

const IPV4_RE = /^\d{1,3}(\.\d{1,3}){3}$/;

export function legacyWpSniHostname() {
  return (
    process.env.JOURNAL_MEDIA_SNI?.trim() ||
    process.env.JOURNAL_MEDIA_HOST?.trim() ||
    ""
  );
}

export function needsLegacyWpTls(urlString, upstreamBase) {
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

/**
 * @returns {Promise<{ ok: boolean; status: number; contentType: string; buffer: Buffer }>}
 */
export function legacyWpGet(urlString, upstreamBase) {
  const sni = legacyWpSniHostname();
  if (!sni || !needsLegacyWpTls(urlString, upstreamBase)) {
    return Promise.reject(new Error("legacy_wp_get_not_applicable"));
  }

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
          "User-Agent": "8degree-journal-sync/1.0",
        },
        rejectUnauthorized: false,
      },
      (res) => {
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => {
          const buffer = Buffer.concat(chunks);
          resolve({
            ok: (res.statusCode ?? 0) >= 200 && (res.statusCode ?? 0) < 300,
            status: res.statusCode ?? 0,
            contentType: String(res.headers["content-type"] ?? ""),
            buffer,
          });
        });
      },
    );
    req.on("error", reject);
  });
}

export async function fetchLegacyWpAsset(urlString, upstreamBase) {
  if (needsLegacyWpTls(urlString, upstreamBase)) {
    return legacyWpGet(urlString, upstreamBase);
  }
  const res = await fetch(urlString, {
    headers: { Accept: "image/*,*/*;q=0.8", "User-Agent": "8degree-journal-sync/1.0" },
    redirect: "follow",
  });
  const buffer = Buffer.from(await res.arrayBuffer());
  return {
    ok: res.ok,
    status: res.status,
    contentType: res.headers.get("content-type") ?? "",
    buffer,
  };
}
