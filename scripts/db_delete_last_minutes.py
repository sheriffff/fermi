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

    warn = False
    for table in tables:
        count_resp = requests.get(
            f"{BASE}/{table}",
            params={"created_at": f"gte.{cutoff}", "select": "id", "limit": "0"},
            headers={**HEADERS, "Prefer": "count=exact"},
        )
        count_resp.raise_for_status()
        cr = count_resp.headers.get("content-range", "")
        expected = int(cr.split("/")[-1]) if "/" in cr and cr.split("/")[-1].isdigit() else 0

        resp = requests.delete(
            f"{BASE}/{table}",
            params={"created_at": f"gte.{cutoff}"},
            headers={**HEADERS, "Prefer": "return=representation"},
        )
        resp.raise_for_status()
        deleted = len(resp.json())

        if deleted:
            status = f"{deleted} deleted"
        elif expected:
            status = f"⚠ {expected} found but 0 deleted (RLS blocked)"
            warn = True
        else:
            status = "—"
        print(f"  {table:25s} {status}")

    if warn:
        print("\n  ⚠ Some deletes were blocked by RLS. Set SUPABASE_SERVICE_ROLE_KEY in .env to bypass.")

    print("\nDone.")


if __name__ == "__main__":
    main()
