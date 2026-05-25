/** Max description length accepted by the inventory upsert API. */
const DESCRIPTION_CAP = 100_000;

const CODE_LINE = /^\s*((?:8DV|8D)[A-Za-z0-9]+)\t/;

export type ParsedCrmListing = {
  code: string;
  title: string;
  listingUrl: string | null;
  description: string;
  channel: "silent" | "website";
  sortOrder: number;
};

function splitByWebsiteSection(sheet: string): { silent: string; website: string } {
  const normalized = sheet.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const re = /(?:^|\n)\s*Website Listing\s*\n/i;
  const match = re.exec(normalized);
  if (!match) {
    return { silent: normalized, website: "" };
  }
  const cut = match.index + match[0].length;
  return {
    silent: normalized.slice(0, match.index).trimEnd(),
    website: normalized.slice(cut).trim(),
  };
}

function isRecordStartLine(line: string): boolean {
  return CODE_LINE.test(line);
}

function parseBlock(lines: string[], channel: "silent" | "website", sortOrder: number): ParsedCrmListing | null {
  if (lines.length === 0) return null;
  const first = lines[0].replace(/^\s+/, "");
  const m = first.match(CODE_LINE);
  if (!m) return null;
  const code = m[1];
  const parts = first.split("\t");
  if (parts[0].trim() !== code) {
    parts[0] = code;
  }

  let i = 1;
  while (i < parts.length && parts[i] === "") i++;

  let listingUrl: string | null = null;
  if (parts[i]?.trim().match(/^https?:\/\//i)) {
    try {
      listingUrl = new URL(parts[i].trim()).href;
    } catch {
      listingUrl = null;
    }
    i++;
    while (i < parts.length && parts[i] === "") i++;
  }

  let title = "";
  if (parts[i] && !parts[i].trim().startsWith('"')) {
    title = parts[i].trim();
    i++;
    while (i < parts.length && parts[i] === "") i++;
  }

  const tailParts = parts.slice(i);
  const descFromFirst = tailParts.join("\t");
  const descRest = lines.length > 1 ? lines.slice(1).join("\n") : "";
  let description = [descFromFirst, descRest].filter((s) => s.length > 0).join("\n");

  description = description.trim();
  if (description.startsWith('"')) {
    description = description.slice(1);
  }
  if (description.endsWith('"')) {
    description = description.slice(0, -1).trimEnd();
  }

  if (!title) {
    title = `${code} | 8 Degree`;
  }

  if (description.length > DESCRIPTION_CAP) {
    description = description.slice(0, DESCRIPTION_CAP);
  }

  return {
    code,
    title: title.slice(0, 500),
    listingUrl,
    description,
    channel,
    sortOrder,
  };
}

function parseSection(sectionText: string, channel: "silent" | "website", sortBase: number): ParsedCrmListing[] {
  const lines = sectionText.split("\n");
  const out: ParsedCrmListing[] = [];
  let i = 0;
  let order = sortBase;
  while (i < lines.length) {
    if (!isRecordStartLine(lines[i])) {
      i++;
      continue;
    }
    const start = i;
    i++;
    while (i < lines.length && !isRecordStartLine(lines[i])) {
      i++;
    }
    const block = lines.slice(start, i);
    const row = parseBlock(block, channel, order);
    if (row) {
      out.push(row);
      order += 1;
    }
  }
  return out;
}

/** Parse a tab-separated CRM export: rows before "Website Listing" → silent; after → website. */
export function parseCrmSheetToListings(sheet: string): ParsedCrmListing[] {
  const { silent, website } = splitByWebsiteSection(sheet);
  const silentRows = parseSection(silent, "silent", 0);
  const websiteRows = parseSection(website, "website", silentRows.length);
  return [...silentRows, ...websiteRows];
}
