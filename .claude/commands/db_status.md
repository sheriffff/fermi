Show row count and latest created_at for key tables.

Query the Supabase REST API for all tables

API details:
- Base URL: read VITE_SUPABASE_URL from /home/sheriff/Documents/coding/fermi/.env
- API key: read VITE_SUPABASE_PUBLISHABLE_KEY from /home/sheriff/Documents/coding/fermi/.env
- Send both `apikey` and `Authorization: Bearer` headers

For each table:
1. Get count: `GET /{table}?select=id&limit=0` with header `Prefer: count=exact` — the count comes in the `content-range` response header
2. Get latest: `GET /{table}?select=created_at&order=created_at.desc&limit=1`

Present results in a clean table format.
