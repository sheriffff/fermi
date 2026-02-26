#!/usr/bin/env python3
"""Delete all database entries from the last N minutes."""

import sys
from datetime import datetime, timedelta, timezone

import requests
from utils import BASE, HEADERS, get_tables_delete_order

MAX_MINUTES = 60


def main():
    if len(sys.argv) != 2:
        print(f"Usage: {sys.argv[0]} <minutes>")
        sys.exit(1)

    minutes = int(sys.argv[1])
    if minutes > MAX_MINUTES:
        print(f"Refusing: {minutes} > {MAX_MINUTES} min. Do it manually to avoid accidents.")
        sys.exit(1)
    if minutes <= 0:
        print("Minutes must be positive.")
        sys.exit(1)

    cutoff = (datetime.now(timezone.utc) - timedelta(minutes=minutes)).strftime("%Y-%m-%dT%H:%M:%SZ")
    tables = get_tables_delete_order()

    print(f"Deleting rows created after {cutoff} (last {minutes} min)\n")

    for table in tables:
        resp = requests.delete(
            f"{BASE}/{table}",
            params={"created_at": f"gte.{cutoff}"},
            headers={**HEADERS, "Prefer": "return=representation"},
        )
        resp.raise_for_status()
        deleted = len(resp.json())
        status = f"{deleted} deleted" if deleted else "—"
        print(f"  {table:25s} {status}")

    print("\nDone.")


if __name__ == "__main__":
    main()
