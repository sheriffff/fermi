#!/usr/bin/env python3
"""Export all Supabase tables to CSV files in a backups/ directory."""

import requests
from datetime import datetime
from utils import BASE, HEADERS, ROOT, get_tables


def main():
    tables = get_tables()
    if not tables:
        print("No tables found in schema.sql")
        return

    timestamp = datetime.now().strftime("%Y-%m-%d_%H%M%S")
    backup_dir = ROOT / "backups" / timestamp
    backup_dir.mkdir(parents=True, exist_ok=True)

    for table in tables:
        resp = requests.get(
            f"{BASE}/{table}",
            headers={**HEADERS, "Accept": "text/csv"},
        )
        resp.raise_for_status()
        csv_text = resp.text

        row_count = max(0, len(csv_text.strip().splitlines()) - 1)
        path = backup_dir / f"{table}.csv"
        path.write_text(csv_text)
        print(f"  {table}: {row_count} rows -> {path.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
