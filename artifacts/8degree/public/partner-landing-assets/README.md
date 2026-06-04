# Partner landing shared images

Both co-brand pages (`/8-degree-real-estate-x-balinest-villa/` and `/8-degree-real-estate-x-only-stays/`) use these files when present.

Copy your complete design export from the local **balinest** / **only stays** folders into this directory:

| File | Used for |
|------|----------|
| `hero-villa.jpg` | Hero + footer background |
| `sec3-pool.jpg` | Villa example main photo |
| `sec3-kitchen.jpg` | Photo row 1 |
| `sec3-living.jpg` | Photo row 2 |
| `sec3-bedroom.jpg` | Photo row 3 |
| `section4-living.jpg` | “Already experiencing” section |

If a file is missing, the build uses temporary fallbacks from `/site-media/` until you add the real assets.

**Partner logos** (not shared):

- Balinest: `../8-degree-real-estate-x-balinest-villa/assets/logo-partner.png` (copy from `logo-balinest.png`)
- Only Stays: `../8-degree-real-estate-x-only-stays/assets/logo-onlystays.svg` (already in repo)

**CTAs** (edit `scripts/partner-landings.config.json`, then rebuild):

- Balinest: GHL report form + `wa.link/5ouk5b`
- Only Stays: contact page + `wa.link/paxsz0` (update `formUrl` / `whatsappUrl` when partner-specific links are available)

After adding files, run from repo root:

```bash
pnpm partner-landings:build
```
