# Finance4All Local Supabase Setup

This repository uses the Supabase CLI migration ledger. The SQL files in `supabase/migrations/` are ordered, timestamped migrations; do not paste them individually into a hosted SQL Editor.

## Local database

Prerequisites: Docker and the Supabase CLI.

```bash
supabase start
supabase db reset
```

`supabase db reset` rebuilds the local database from every tracked migration and then applies `supabase/seed.sql`. Treat the seed as development data, not production content.

Copy the local values reported by `supabase status` into `.env`:

```text
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_PUBLISHABLE_KEY=<local publishable or anon key>
VITE_AUTH_REDIRECT_ORIGIN=http://localhost:8080
```

Then start the portal:

```bash
npm ci
npm run dev -- --host 127.0.0.1 --port 8080
```

## Hosted project

Follow [DEPLOYMENT.md](../DEPLOYMENT.md). Before any remote schema change:

```bash
supabase link --project-ref <project-ref>
supabase migration list --linked
supabase db push --dry-run
```

Only run `supabase db push` after the dry run and environment identity are reviewed. If SQL was applied manually in the past, reconcile the actual schema first and use `supabase migration repair <version> --status applied`; never re-run a non-idempotent migration merely to populate history.

## OAuth

For local Google OAuth, add `http://localhost:8080/auth/callback` to the project's allowed redirect URLs. The provider callback remains `https://<project-ref>.supabase.co/auth/v1/callback` in Google Cloud.

Do not commit API secrets, database passwords, OAuth client secrets, or member credentials.
