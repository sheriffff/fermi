Export all Supabase tables to CSV files in a `backups/` directory.

1. Create directory `backups/` in the project root if it doesn't exist
2. For each table (users_online, responses_online, users_paper, responses_paper, responses_play_random, logs_download), fetch all rows via the Supabase REST API and save to `backups/{table}_{YYYY-MM-DD_HHmmss}.csv`
3. Use the same timestamp for all files in a single backup run

API details:
- Base URL: read VITE_SUPABASE_URL from /home/sheriff/Documents/coding/fermi/.env
- API key: read VITE_SUPABASE_PUBLISHABLE_KEY from /home/sheriff/Documents/coding/fermi/.env
- Send both `apikey` and `Authorization: Bearer` headers
- Request CSV format with header: `Accept: text/csv`

After running, report how many rows were exported per table and the file paths.
