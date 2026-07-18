# External Blockers

| Blocker | Why it remains | Exact next action | Access required | Risk if delayed |
|---|---|---|---|---|
| Migration 021 not applied to live DB | Only owner has Supabase project access | Run `supabase/migrations/021_analytics_journey_events.sql` (or full `FINAL_SETUP.sql` on a fresh project) in Supabase SQL editor | Supabase project owner | New journey analytics events will be rejected as "Unsupported analytics event" until applied; app degrades gracefully (event silently dropped in prod) |
| Production env values | Public-but-project-specific; not in repo (by design) | Set `VITE_APP_URL`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` in the deploy environment | Deploy platform access | Build intentionally fails without them |
