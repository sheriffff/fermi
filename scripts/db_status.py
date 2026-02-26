#!/usr/bin/env python3
"""Show row count and latest created_at for key Supabase tables."""

import requests
from utils import BASE, HEADERS, get_tables


def main():
    tables = get_tables()
    if not tables:
        print("No tables found in schema.sql")
        return

    rows = []
    for table in tables:
        count_resp = requests.get(
            f"{BASE}/{table}",
            params={"select": "id", "limit": "0"},
            headers={**HEADERS, "Prefer": "count=exact"},
        )
        count_resp.raise_for_status()
        cr = count_resp.headers.get("content-range", "")
        count = cr.split("/")[-1] if "/" in cr else "?"

        latest_resp = requests.get(
            f"{BASE}/{table}",
            params={"select": "created_at", "order": "created_at.desc", "limit": "1"},
            headers=HEADERS,
        )
        latest_resp.raise_for_status()
        data = latest_resp.json()
        latest = data[0]["created_at"][:19].replace("T", " ") if data else "—"

        rows.append((table, count, latest))

    col_w = [max(len(r[i]) for r in rows) for i in range(3)]
    col_w[0] = max(col_w[0], len("Table"))
    col_w[1] = max(col_w[1], len("Rows"))
    col_w[2] = max(col_w[2], len("Latest"))

    hdr = f"  {'Table':<{col_w[0]}}  {'Rows':>{col_w[1]}}  {'Latest':<{col_w[2]}}"
    sep = f"  {'─' * col_w[0]}  {'─' * col_w[1]}  {'─' * col_w[2]}"
    print(hdr)
    print(sep)
    for table, count, latest in rows:
        print(f"  {table:<{col_w[0]}}  {count:>{col_w[1]}}  {latest:<{col_w[2]}}")


if __name__ == "__main__":
    main()
