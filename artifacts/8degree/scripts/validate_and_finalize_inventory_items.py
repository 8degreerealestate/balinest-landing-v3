#!/usr/bin/env python3
"""Validate inventory_items_supabase_import.csv and write inventory_items_final.csv."""

from __future__ import annotations

import csv
import re
from collections import Counter
from pathlib import Path

EXPECTED_COLS = [
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

DATA_DIR = Path(__file__).resolve().parents[1] / "data"
SRC = DATA_DIR / "inventory_items_supabase_import.csv"
DST = DATA_DIR / "inventory_items_final.csv"

SKU_PATTERN = re.compile(r"^[A-Za-z0-9_-]+$")
NUM_PATTERN = re.compile(r"^-?\d+(\.\d+)?$")
IMPORT_SKU = re.compile(r"^IMPORT_ROW_\d{4}$")
WEAK_FIRST_LINE = re.compile(r"^[A-Za-z0-9]{1,12}$")


def title_from_description(desc: str, max_len: int = 200) -> str | None:
    lines = [ln.strip() for ln in (desc or "").splitlines() if ln.strip()]
    if not lines:
        return None
    idx = 0
    if WEAK_FIRST_LINE.match(lines[0]) and len(lines) > 1:
        idx = 1
    title = lines[idx]
    if len(title) < 8:
        return None
    if len(title) > max_len:
        title = title[: max_len - 3].rstrip() + "..."
    return title


def strip_row(r: dict) -> dict:
    return {k: (v if v is not None else "").strip() for k, v in r.items()}


def final_display_name(row: dict) -> str:
    """Improve weak names using description; disambiguate duplicate-slot SKUs."""
    sku = row["sku"]
    name = row["name"]
    desc = row["description"]

    m = re.match(r"^(.+)__(\d+)$", sku)
    new_name = name
    if m and not desc.strip() and name == m.group(1):
        new_name = f"{name} (duplicate slot {m.group(2)})"

    if IMPORT_SKU.match(sku) and not desc.strip():
        return f"Empty import row ({sku})"

    if new_name == sku or (sku.startswith("IMPORT_ROW") and new_name == sku):
        t = title_from_description(desc)
        if t:
            return t
        if not desc.strip():
            if sku.startswith("IMPORT_ROW"):
                return f"Empty import row ({sku})"
            return f"Listing {sku}"
    return new_name


def main() -> None:
    if not SRC.is_file():
        raise SystemExit(f"Missing source: {SRC}")

    with SRC.open(newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        got = list(reader.fieldnames or [])
        if got != EXPECTED_COLS:
            raise SystemExit(
                f"Column mismatch.\n  got:  {got}\n  want: {EXPECTED_COLS}"
            )

    with SRC.open(newline="", encoding="utf-8") as f:
        rows = [strip_row(r) for r in csv.DictReader(f)]

    issues: list[str] = []

    skus = [r["sku"] for r in rows]
    sku_counts = Counter(skus)
    dups = sorted([s for s, c in sku_counts.items() if c > 1])
    if dups:
        issues.append(
            f"Duplicate SKU values ({len(dups)}): {dups[:30]}{'...' if len(dups) > 30 else ''}"
        )
    else:
        issues.append("Duplicate SKUs: none.")

    malformed: list[tuple[int, str, str]] = []
    for i, r in enumerate(rows):
        s = r["sku"]
        if not s:
            malformed.append((i, s, "empty_sku"))
        elif not SKU_PATTERN.match(s):
            malformed.append((i, s, "invalid_sku_chars"))
    if malformed:
        issues.append(f"Malformed SKUs: {len(malformed)} — samples: {malformed[:10]}")
    else:
        issues.append("Malformed SKUs: none.")

    price_zero_idx = [
        i for i, r in enumerate(rows) if str(r.get("price", "")).strip() in ("0", "0.0", "")
    ]
    zero_skus = [rows[i]["sku"] for i in price_zero_idx]
    issues.append(
        f"Rows with price 0 or empty: {len(price_zero_idx)}. "
        f"0-based indices (first 40): {price_zero_idx[:40]}{'...' if len(price_zero_idx) > 40 else ''}"
    )
    issues.append(
        f"SKUs with zero/empty price (first 40): {zero_skus[:40]}{'...' if len(zero_skus) > 40 else ''}"
    )

    import_idx = [i for i, r in enumerate(rows) if IMPORT_SKU.match(r["sku"])]
    import_skus = [rows[i]["sku"] for i in import_idx]
    issues.append(
        f"Placeholder IMPORT_ROW_* SKUs: {len(import_idx)} — {import_skus}"
    )

    poor: list[tuple[int, str, str, list[str]]] = []
    for i, r in enumerate(rows):
        sku, name, desc = r["sku"], r["name"], r["description"]
        rs: list[str] = []
        if IMPORT_SKU.match(sku):
            rs.append("placeholder_sku")
        if name == sku:
            rs.append("name_equals_sku")
        if name == sku and len(desc) > 80:
            rs.append("long_description_but_name_is_sku")
        if sku.startswith("IMPORT_ROW") and name == sku:
            rs.append("import_row_name_not_enriched")
        if len(name) < 8 and len(desc) > 100:
            rs.append("very_short_name_vs_long_description")
        if rs:
            poor.append((i, sku, name[:70], rs))
    issues.append(
        f"Potentially poor name derivation (heuristic, pre-fix): {len(poor)} rows. "
        f"Samples (index, sku, reasons): {[(i, s, rs) for i, s, _, rs in poor[:15]]}"
    )

    bad_nums: list[tuple[int, str, str]] = []
    for i, r in enumerate(rows):
        if set(r.keys()) != set(EXPECTED_COLS):
            issues.append(f"ERROR: row {i} has keys {sorted(r.keys())}")
        for fld in ("quantity", "price", "cost"):
            v = r.get(fld, "").strip()
            if v and not NUM_PATTERN.match(v):
                bad_nums.append((i, fld, v))
    if bad_nums:
        issues.append(f"Non-numeric quantity/price/cost: {bad_nums}")
    else:
        issues.append("quantity, price, cost: all numeric where present.")

    issues.append(
        f"Header columns match required order and names: {EXPECTED_COLS}"
    )

    finalized: list[dict] = []
    for r in rows:
        nr = {k: r[k] for k in EXPECTED_COLS}
        nr["name"] = final_display_name(nr)
        finalized.append(nr)

    still_name_eq_sku = sum(1 for r in finalized if r["name"] == r["sku"])
    issues.append(
        f"After correction: rows with name still equal to sku: {still_name_eq_sku} "
        "(typically empty description)."
    )

    with DST.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(
            f,
            fieldnames=EXPECTED_COLS,
            quoting=csv.QUOTE_MINIMAL,
            lineterminator="\n",
        )
        w.writeheader()
        w.writerows(finalized)

    assert len(finalized) == len(rows)

    print("=== Validation summary ===\n")
    for line in issues:
        print(line)
    print(f"\nWrote {DST} ({len(finalized)} rows).")


if __name__ == "__main__":
    main()
