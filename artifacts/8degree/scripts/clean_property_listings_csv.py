#!/usr/bin/env python3
"""Map 8D Website Assets property CSV -> inventory_items + optional inventory_images."""

from __future__ import annotations

import csv
import re
from collections import defaultdict
from pathlib import Path

# Pass path as argv[1], else default to ~/Downloads export name.
DEFAULT_SRC = (
    Path.home() / "Downloads" / "8D Website Assets - Property Listings.csv"
)
OUT_DIR = Path(__file__).resolve().parents[1] / "data"

url_re = re.compile(r"https?://[^\s\"'<>)\],]+", re.I)


def slug_sku(s: str) -> str:
    s = (s or "").strip()
    if not s:
        return ""
    s = re.sub(r"\s+", "_", s)
    s = re.sub(r"[^A-Za-z0-9_-]+", "_", s)
    s = re.sub(r"_+", "_", s).strip("_")
    return s[:120] or "ITEM"


def extract_code_from_url_cell(url_cell: str) -> str:
    m = re.match(r"^\s*([A-Za-z0-9]+)\s*\|", url_cell or "")
    return m.group(1) if m else ""


def extract_code_from_assets(assets: str) -> str:
    m = re.match(r"^\s*([A-Za-z0-9]+)\s*-\s*", assets or "")
    return m.group(1) if m else ""


def normalize_money_token(raw: str) -> float | None:
    """Parse a numeric token that may use US or dot-as-thousands grouping."""
    s = (raw or "").strip().replace(" ", "").replace("$", "")
    if not s or not re.search(r"\d", s):
        return None

    # European-style grouped integers: 1.234.567 or 389.000
    if re.fullmatch(r"\d{1,3}(\.\d{3})+", s):
        return float(s.replace(".", ""))

    # US-style: 1,234,567.89
    if "," in s and "." in s:
        if s.rfind(".") > s.rfind(","):
            return float(s.replace(",", ""))
        return float(s.replace(".", "").replace(",", "."))

    # Commas only: 173,000 or 395,000
    if "," in s and "." not in s:
        parts = s.split(",")
        if len(parts) > 1 and all(p.isdigit() for p in parts):
            if len(parts[-1]) == 3:
                return float("".join(parts))
        return float(s.replace(",", "."))

    # Dots only: decimal vs thousands (389.000 -> 389000)
    if "." in s and "," not in s:
        whole, frac = s.split(".", 1)
        if frac.isdigit() and len(frac) == 3 and whole.isdigit() and len(whole) <= 3:
            if int(frac) == 0 or int(frac) % 1000 == 0:
                return float(whole + frac)
        return float(s)

    return float(s)


SKIP_PRICE_LINE = re.compile(
    r"nightly|per\s*night|monthly|profit|roi\b|rate:\s*~", re.I
)


def parse_price_usd(text: str) -> str:
    """Best-effort USD from description; empty string if unknown."""
    if not text:
        return ""

    candidates: list[tuple[int, float]] = []

    def consider(line: str, weight: int) -> None:
        if SKIP_PRICE_LINE.search(line):
            return
        for m in re.finditer(
            r"(?:USD|US\$)\s*\$?\s*([\d][\d.,]*)", line, re.I
        ):
            token = m.group(1)
            try:
                val = normalize_money_token(token)
            except ValueError:
                continue
            if val is None or val < 500:  # ignore incidental small USD mentions
                continue
            candidates.append((weight, val))

    for line in text.splitlines():
        L = line.strip()
        if re.search(r"price|starting|from\b|~usd|≈\s*usd|approx", L, re.I):
            consider(L, 10)
        else:
            consider(L, 1)

    if not candidates:
        return ""

    candidates.sort(key=lambda t: (-t[0], -t[1]))
    return str(int(candidates[0][1])) if candidates[0][1] == int(candidates[0][1]) else str(candidates[0][1])


def collect_urls(row: dict) -> list[str]:
    seen: set[str] = set()
    out: list[str] = []
    for key in ("Url", "redirect Url", "CTA Link", "Description/Broadcast", "Assets"):
        v = row.get(key) or ""
        for u in url_re.findall(v):
            u = u.rstrip(".,;)")
            if u not in seen:
                seen.add(u)
                out.append(u)
    return out


def main() -> None:
    import sys

    src = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_SRC
    if not src.is_file():
        raise SystemExit(f"Source CSV not found: {src}")

    out_dir = OUT_DIR
    out_dir.mkdir(parents=True, exist_ok=True)
    out_items = out_dir / "inventory_items_supabase_import.csv"
    out_images = out_dir / "inventory_images_supabase_import.csv"

    with src.open(newline="", encoding="utf-8-sig") as f:
        raw_rows = list(csv.DictReader(f))

    sku_counts: dict[str, int] = defaultdict(int)
    assigned_skus: list[str] = []

    for i, row in enumerate(raw_rows):
        name = (row.get("Name") or "").strip()
        url_cell = row.get("Url") or ""
        assets = row.get("Assets") or ""

        base = name
        if not base:
            base = extract_code_from_url_cell(url_cell) or extract_code_from_assets(assets)
        if not base:
            base = f"IMPORT_ROW_{i + 1:04d}"

        base = slug_sku(base)
        sku_counts[base] += 1
        n = sku_counts[base]
        sku = base if n == 1 else f"{base}__{n}"
        assigned_skus.append(sku)

    item_fieldnames = [
        "sku",
        "name",
        "description",
        "category",
        "quantity",
        "price",
        "cost",
        "barcode",
        "supplier",
    ]
    image_fieldnames = [
        "inventory_item_sku",
        "public_url",
        "alt_text",
        "sort_order",
        "is_primary",
    ]

    items: list[dict] = []
    images: list[dict] = []

    for row, sku in zip(raw_rows, assigned_skus):
        desc = (row.get("Description/Broadcast") or "").strip()
        assets = (row.get("Assets") or "").strip()
        name_col = (row.get("Name") or "").strip()

        display_name = assets or name_col or sku
        price = parse_price_usd(desc)

        items.append(
            {
                "sku": sku,
                "name": display_name,
                "description": desc,
                "category": "Property listing",
                "quantity": "1",
                "price": price if price else "0",
                "cost": "0",
                "barcode": "",
                "supplier": "8 Degree",
            }
        )

        urls = collect_urls(row)
        for j, u in enumerate(urls):
            images.append(
                {
                    "inventory_item_sku": sku,
                    "public_url": u,
                    "alt_text": (display_name[:200] if display_name else "") or sku,
                    "sort_order": str(j),
                    "is_primary": "true" if j == 0 else "false",
                }
            )

    with out_items.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=item_fieldnames, quoting=csv.QUOTE_MINIMAL)
        w.writeheader()
        w.writerows(items)

    with out_images.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=image_fieldnames, quoting=csv.QUOTE_MINIMAL)
        w.writeheader()
        w.writerows(images)

    print(f"Wrote {out_items} ({len(items)} rows)")
    print(f"Wrote {out_images} ({len(images)} rows)")


if __name__ == "__main__":
    main()
