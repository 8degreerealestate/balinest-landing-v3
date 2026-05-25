#!/usr/bin/env sh
# Re-downloads all public site media from Google Drive.
# All files must be shared as "anyone with link".
set -e

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/artifacts/8degree/public/site-media"
mkdir -p "$OUT"

fetch() {
  id="$1"
  dest="$2"
  echo "Fetching $id -> $(basename $dest)"
  python3 -c "
import urllib.request, urllib.parse, http.cookiejar, re, sys
jar = http.cookiejar.CookieJar()
opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(jar))
opener.addheaders = [('User-Agent', 'Mozilla/5.0')]
url = 'https://drive.google.com/uc?export=download&id=$id'
resp = opener.open(url)
data = resp.read()
if b'<html' in data[:200].lower():
    html = data.decode('utf-8', errors='replace')
    token = re.search(r'confirm=([0-9A-Za-z_\-]+)', html)
    if token:
        resp2 = opener.open('https://drive.google.com/uc?export=download&confirm=' + token.group(1) + '&id=$id')
        data = resp2.read()
    else:
        uuid_m = re.search(r'uuid=([0-9A-Za-z_\-]+)', html)
        if uuid_m:
            resp2 = opener.open('https://drive.google.com/uc?export=download&confirm=t&uuid=' + uuid_m.group(1) + '&id=$id')
            data = resp2.read()
open('$dest', 'wb').write(data)
print('  ' + str(len(data)//1024) + 'KB')
"
}

# ── Hero assets ────────────────────────────────────────────────────────────
fetch "10sSFDovjSw_krEVU918oNqNQPrWVFX9z" "$OUT/hero-cinematic.mp4"
fetch "1qaXnGteqT0MRHOCrCILtQmEh3wRI42_x" "$OUT/hero-still.jpg"
fetch "1ub5eDDyyhD6lKjTNd5IfHXgd8G-0jqi-"  "$OUT/hero-poster.jpg"

# ── Team photos (folder: 1y_5qRH398Jexl7ccmWx_63lQ7jSXxePb) ──────────────
fetch "1sQpw6w2elbrAA8riaKDl4bT_GsVUxXox" "$OUT/team-charis.jpg"
fetch "1a9__JNoo-zs4U1P_lnzWPHAThn5HMIYd" "$OUT/team-kinan.jpg"
fetch "1JuSOhL4mO5GTy7U_VkpOLHhYRz8u6_Ue" "$OUT/team-mariam.jpg"
fetch "1AGQPSEGvvfNVlgtxxcmB_Dfm6oDvLYrk"  "$OUT/team-maya.jpg"
fetch "1V7qfGmCwfvjKajcjCC1Dt1AHSSvRbjIN"  "$OUT/team-rangga.jpg"
fetch "1h4fNIxgJNKZmwpIe-Qe4UpSBdKmR36zT"  "$OUT/team-robert.jpg"
fetch "1ERbgI_AfdYzAaNljgMgj6oUuybHgtiBD"   "$OUT/team-ryan.jpg"
fetch "1WwAm-akMFeK07Qgar7cMLWRmzmjLtDEB"   "$OUT/team-stephen.jpg"
fetch "1uAUYVvH-GmualGM-b1VRVs3nOp1aLdbW"  "$OUT/team-yohanes.jpg"

# ── Area images (folder: 1_XsNdvz-ip0KqnLnecHdyxNDQFlE84Dp) ─────────────
fetch "1h-NaRFHEyE1BZuizdlA_7n6OQ8fYQLlp"  "$OUT/area-canggu.jpg"
fetch "1JqZh2xdOAp-VmEODSBCi29WstcsNd7Of"   "$OUT/area-cemagi.jpg"
fetch "1cjzDLEAgGx5iVKLhIs4jLcwC2kIT1kVE"   "$OUT/area-jimbaran.jpg"
fetch "1Dg6FzTFZ6JpPtKRNdovZLIVtlPsytRHA"   "$OUT/area-kuta.jpg"
fetch "1RVkWDEEdRSWJLfVGIjWPS2er2v9OXql7"   "$OUT/area-nusa-dua.jpg"
fetch "1C6YC9_RlI1XPZPcBmK1TYLqO6jov4yEh"   "$OUT/area-seminyak.jpg"
fetch "1OPQ8brC7hIx8hReLCbVdx3tQHJczuI0B"   "$OUT/area-tabanan.jpg"
fetch "1ndniod04w1cxMzjhj6zuO2Rxvy9Ivu_s"   "$OUT/area-ubud.jpg"
fetch "14kUyQM0iN5zeVhFgdQkHZcH59ueJ3f6c"   "$OUT/area-uluwatu.jpg"

echo "All assets downloaded to $OUT"
