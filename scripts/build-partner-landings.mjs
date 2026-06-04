#!/usr/bin/env node
/**
 * Generates static partner co-brand landing pages under artifacts/8degree/public/.
 * Run: pnpm partner-landings:build
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = path.join(root, "artifacts/8degree/public");
const configPath = path.join(root, "scripts/partner-landings.config.json");
const templatePath = path.join(publicDir, "balinest/index.html");

const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
let template = fs.readFileSync(templatePath, "utf8");

function resolveAsset(filename) {
  const local = path.join(publicDir, "partner-landing-assets", filename);
  if (fs.existsSync(local)) {
    return `${config.sharedAssetsPrefix}/${filename}`;
  }
  return config.assetFallbacks[filename] ?? `${config.sharedAssetsPrefix}/${filename}`;
}

function assetUrl(filename) {
  return resolveAsset(filename).replace(/'/g, "%27");
}

function buildPage(partner) {
  let html = template;

  html = html.replace(
    /<title>[^<]*<\/title>/,
    `<title>${partner.title}</title>`,
  );

  html = html.replace(
    /<img class="logo-8d"[^>]*>/,
    `<img class="logo-8d" src="${config.logo8Degree}" alt="8 Degree Real Estate" />`,
  );

  const partnerLogoClass =
    partner.partnerLogoInvert === false ? "logo-bv logo-bv--native" : "logo-bv";
  html = html.replace(
    /<img class="logo-bv[^"]*"[^>]*>/,
    `<img class="${partnerLogoClass}" src="${partner.partnerLogo}" alt="${partner.partnerLogoAlt}" />`,
  );

  html = html.replace(
    /<p>The villa you're in is professionally managed by <strong>Balinest<\/strong>, operating <strong>400\+ properties<\/strong> across Bali\.<\/p>/,
    `<p>${partner.partnerBlurb}</p>`,
  );

  html = html.replace(
    /https:\/\/api\.leadconnectorhq\.com\/widget\/form\/ZGch73tA3ARy81tNy2P8/g,
    partner.formUrl,
  );

  html = html.replace(/https:\/\/wa\.link\/5ouk5b/g, partner.whatsappUrl);

  if (partner.formOpensInModal === false) {
    html = html.replace(
      /<a\s+href="[^"]*"\s+class="btn btn-primary"\s+data-open-form="report"\s*>/,
      `<a href="${partner.formUrl}" class="btn btn-primary" target="_blank" rel="noopener noreferrer">`,
    );
    html = html.replace(
      /<div class="form-modal" id="reportFormModal"[\s\S]*?<\/div>\s*\n\n/,
      "",
    );
  }

  const assetFiles = [
    "hero-villa.jpg",
    "sec3-pool.jpg",
    "sec3-kitchen.jpg",
    "sec3-living.jpg",
    "sec3-bedroom.jpg",
    "section4-living.jpg",
  ];

  for (const file of assetFiles) {
    const url = assetUrl(file);
    html = html.replaceAll(`assets/${file}`, url);
  }

  const modalScript =
    partner.formOpensInModal === false
      ? ""
      : `<script>
  const reportFormModal = document.getElementById('reportFormModal');
  const reportFormClose = document.getElementById('reportFormClose');

  document.querySelectorAll('[data-open-form="report"]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      reportFormModal?.classList.add('open');
      reportFormModal?.setAttribute('aria-hidden', 'false');
    });
  });
  reportFormClose?.addEventListener('click', () => {
    reportFormModal?.classList.remove('open');
    reportFormModal?.setAttribute('aria-hidden', 'true');
  });
  reportFormModal?.addEventListener('click', (e) => {
    if (e.target === reportFormModal) {
      reportFormModal.classList.remove('open');
      reportFormModal.setAttribute('aria-hidden', 'true');
    }
  });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && reportFormModal?.classList.contains('open')) {
      reportFormModal.classList.remove('open');
      reportFormModal.setAttribute('aria-hidden', 'true');
    }
  });
</script>`;

  if (html.includes("<!-- ============== TWEAKS ============== -->")) {
    html = html.replace(
      /<!-- ============== TWEAKS ============== -->[\s\S]*?<script>\s*const TWEAK_DEFAULTS[\s\S]*?<\/script>/,
      modalScript,
    );
  } else if (modalScript) {
    html = html.replace(/<\/body>\s*<\/html>\s*$/i, `${modalScript}\n\n</body>\n</html>`);
  } else {
    html = html.replace(
      /<script>[\s\S]*?reportFormModal[\s\S]*?<\/script>\s*(?=<\/body>)/,
      "",
    );
  }

  return html;
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

ensureDir(path.join(publicDir, "partner-landing-assets"));

const onlyStaysSrc = path.join(publicDir, "balinest/assets/logo-onlystays.svg");
const onlyStaysDestDir = path.join(
  publicDir,
  "8-degree-real-estate-x-only-stays/assets",
);
if (fs.existsSync(onlyStaysSrc)) {
  ensureDir(onlyStaysDestDir);
  fs.copyFileSync(
    onlyStaysSrc,
    path.join(onlyStaysDestDir, "logo-onlystays.svg"),
  );
}

const balinestLogoSrc = path.join(publicDir, "balinest/assets/logo-balinest.png");
const balinestDestDir = path.join(
  publicDir,
  "8-degree-real-estate-x-balinest-villa/assets",
);
if (fs.existsSync(balinestLogoSrc)) {
  ensureDir(balinestDestDir);
  fs.copyFileSync(balinestLogoSrc, path.join(balinestDestDir, "logo-partner.png"));
}

for (const partner of config.partners) {
  const outDir = path.join(publicDir, partner.slug);
  ensureDir(outDir);
  const html = buildPage(partner);
  fs.writeFileSync(path.join(outDir, "index.html"), html);
  console.log(`Wrote ${partner.slug}/index.html`);
}

console.log("Partner landings built. Add photos to artifacts/8degree/public/partner-landing-assets/ (see README).");
