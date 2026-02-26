"""Shared Supabase helpers for CLI scripts."""

import os
import re
from dotenv import load_dotenv
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
load_dotenv(ROOT / ".env")

BASE = os.environ["VITE_SUPABASE_URL"].rstrip("/") + "/rest/v1"
KEY = os.environ["VITE_SUPABASE_PUBLISHABLE_KEY"]
HEADERS = {"apikey": KEY, "Authorization": f"Bearer {KEY}"}
SCHEMA_PATH = ROOT / "supabase" / "schema.sql"


def get_tables():
    sql = SCHEMA_PATH.read_text()
    return re.findall(r"CREATE TABLE IF NOT EXISTS (\w+)", sql, re.IGNORECASE)


def get_fk_deps():
    """Return dict: child_table -> set of parent tables it references."""
    sql = SCHEMA_PATH.read_text()
    deps = {}
    current_table = None
    for line in sql.splitlines():
        m = re.match(r"CREATE TABLE IF NOT EXISTS (\w+)", line, re.IGNORECASE)
        if m:
            current_table = m.group(1)
        if current_table:
            ref = re.search(r"REFERENCES\s+(\w+)", line, re.IGNORECASE)
            if ref:
                deps.setdefault(current_table, set()).add(ref.group(1))
    return deps


def get_tables_delete_order():
    """Tables ordered so children (FK dependents) come before parents."""
    tables = get_tables()
    deps = get_fk_deps()
    ordered = []
    remaining = list(tables)
    placed = set()
    while remaining:
        for t in remaining:
            parents = deps.get(t, set())
            if not (parents - placed - {t}):
                ordered.append(t)
                placed.add(t)
                remaining.remove(t)
                break
        else:
            ordered.extend(remaining)
            break
    return list(reversed(ordered))
