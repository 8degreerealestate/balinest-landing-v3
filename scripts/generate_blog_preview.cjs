const fs = require("fs");
const path = require("path");

const escapeHtml = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const row = process.argv[2] || "1";

const titleByRow = {
  "1": "New Tourism Laws Enforcement in 2026: What Bali Property Investors Must Know",
  "2": "Bali Tourism Market 2026: Why More Tourists Don't Mean Fuller Hotels",
};

const slugByRow = {
  "1": "new-tourism-laws-enforcement-in-2026-what-bali-property-investors-must-know",
  "2": "bali-tourism-market-2026-why-more-tourists-dont-mean-fuller-hotels",
};

const featuredByRow = {
  "1": "https://drive.google.com/uc?export=view&id=1oId8SYgkRCvF-zhJJ1U9GL3IO6lyjle8",
  "2": "https://drive.google.com/uc?export=view&id=1MKOTYY5u7NXt-PTVGxQ901DN_smJZv5l",
};

const excerptByRow = {
  "1": "Bali flooding headlines in 2026 raised investor concerns. Here is what really happened, which areas carry risk, and how to evaluate flood resilience before buying property.",
  "2": "Tourism is rising, but occupancy isn't evenly distributed. Here's why more arrivals don't automatically mean fuller hotels—and what that means for Bali property and villa investors in 2026.",
};

const docTextByRow = {
  "1": ".tmp_article1.txt",
};

const title = titleByRow[row];
const slug = slugByRow[row];
const featured = featuredByRow[row] || "";
const excerpt = excerptByRow[row] || "";
if (!title || !slug) {
  throw new Error(`Unknown row: ${row}`);
}

let body = "";
const docPath = docTextByRow[row];
if (docPath) {
  const input = path.resolve(process.cwd(), docPath);
  if (!fs.existsSync(input)) throw new Error(`Missing ${docPath}`);
  const raw = fs.readFileSync(input, "utf8");
  const lines = raw.split(/\r?\n/).map((s) => s.trim());

  const blocks = [];
  let current = [];
  for (const line of lines) {
    if (!line || /^_{5,}$/.test(line)) {
      if (current.length) {
        blocks.push(current.join(" "));
        current = [];
      }
      continue;
    }
    if (/^Image\s+\d+/i.test(line)) continue;
    current.push(line);
  }
  if (current.length) blocks.push(current.join(" "));

  body = blocks
    .map((b) => {
      if (/^FAQ SECTION$/i.test(b)) return "<h2>FAQ</h2>";
      if (/^Q:\s*/.test(b)) return `<h3>${escapeHtml(b.replace(/^Q:\s*/, ""))}</h3>`;
      return `<p>${escapeHtml(b)}</p>`;
    })
    .join("\n\n");
} else {
  // Title-only draft placeholder (until a doc link exists)
  body = [
    "<p><em>Draft placeholder: this article was generated from the sheet title only because no content document link is provided yet.</em></p>",
    "<h2>What the headline numbers hide</h2>",
    "<p>Bali tourism can grow year over year while certain hotels and areas still see softer occupancy. That’s because demand is uneven across price points, neighborhoods, seasons, and property types.</p>",
    "<h2>Why “more tourists” doesn’t always equal “fuller hotels”</h2>",
    "<ul>",
    "<li><b>Supply growth:</b> new keys (hotels + villas) can outpace arrivals in specific zones.</li>",
    "<li><b>Channel shift:</b> travelers increasingly choose villas and short-stay apartments over traditional hotels.</li>",
    "<li><b>Seasonality:</b> peak periods mask slower shoulder months that impact annual averages.</li>",
    "<li><b>Location sensitivity:</b> high-performing micro-locations capture disproportionate demand.</li>",
    "</ul>",
    "<h2>What this means for villa/property investors</h2>",
    "<p>Focus less on island-wide arrival headlines and more on: micro-location, product quality, management performance, and the exact guest segment you want to attract.</p>",
    "<h2>Investor checklist for 2026</h2>",
    "<ul>",
    "<li>Validate comps for your exact radius (not “Canggu” or “Ubud” broadly).</li>",
    "<li>Stress-test pricing for wet-season and shoulder-month occupancy.</li>",
    "<li>Confirm a management plan that can drive direct bookings and optimize ADR.</li>",
    "<li>Prioritize design and experience—these are pricing levers, not aesthetics.</li>",
    "</ul>",
  ].join("\n");
}

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(title)} (Preview)</title>
<style>
body { font-family: Arial, sans-serif; background: #f8fafc; color: #0f172a; margin: 0; }
main { max-width: 860px; margin: 40px auto; background: #fff; padding: 32px; border-radius: 12px; box-shadow: 0 10px 30px rgba(2,6,23,.08); }
img { width: 100%; max-height: 420px; object-fit: cover; border-radius: 10px; }
h1 { font-size: 34px; line-height: 1.2; margin: 0 0 14px; }
h2 { margin-top: 34px; font-size: 26px; }
h3 { margin-top: 24px; font-size: 21px; }
p { line-height: 1.8; color: #334155; }
.meta { font-size: 12px; letter-spacing: .08em; text-transform: uppercase; color: #64748b; margin-bottom: 10px; }
.excerpt { font-size: 18px; color: #1e293b; margin: 0 0 20px; }
.badge { display: inline-block; background: #e2e8f0; color: #334155; border-radius: 999px; padding: 6px 10px; font-size: 12px; margin-bottom: 16px; }
</style>
</head>
<body>
<main>
  <div class="meta">Blog Preview</div>
  <h1>${escapeHtml(title)}</h1>
  <p class="excerpt">${escapeHtml(excerpt)}</p>
  <div class="badge">Slug: ${escapeHtml(slug)}</div>
  <img src="${featured}" alt="Featured image" />
  ${body}
</main>
</body>
</html>`;

const outDir = path.resolve(process.cwd(), "artifacts/8degree/public/blog-previews");
fs.mkdirSync(outDir, { recursive: true });
const out = path.join(outDir, `${slug}.html`);
fs.writeFileSync(out, html);
console.log(out);
