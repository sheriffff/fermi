Delete all database entries from the last $ARGUMENTS minutes.
If argument is bigger than 60, oblige user to do it manually to avoid deleting too much by accident.

Run curl DELETE requests against all 7 tables in this order (responses before users to respect FK constraints):

1. responses_online (where created_at > now() - N minutes)
2. users_online (where created_at > now() - N minutes)
3. responses_paper (where created_at > now() - N minutes)
4. users_paper (where created_at > now() - N minutes)
5. responses_play_random (where created_at > now() - N minutes)
6. feedback (where created_at > now() - N minutes)
7. logs_download (where created_at > now() - N minutes)

Use the Supabase REST API with these details:
- Base URL: read VITE_SUPABASE_URL from /home/sheriff/Documents/coding/fermi/.env
- API key: read VITE_SUPABASE_PUBLISHABLE_KEY from /home/sheriff/Documents/coding/fermi/.env
- Send both `apikey` and `Authorization: Bearer` headers with the key
- Use PostgREST filter: `created_at=gte.{ISO timestamp for now minus N minutes}`
- Method: DELETE

Calculate the cutoff timestamp using: `date -u -d "$ARGUMENTS minutes ago" +%Y-%m-%dT%H:%M:%S%z`

After running, report how many tables were cleaned and the cutoff time used.
