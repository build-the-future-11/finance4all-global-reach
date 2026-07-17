# FinanceMeta Database Setup

Status: complete setup source is present in this repository.

## Files

- `supabase/FINAL_SETUP.sql`: consolidated copy-paste SQL generated from
  migrations `001` through `012`.
- `supabase/VERIFY_SETUP.sql`: production verification script. Every row should
  return `ok = true`.
- `supabase/migrations/*.sql`: ordered migration source files.
- `supabase/seed.sql`: development/internal demo seed only. Do not use for public
  launch unless every record is approved as real.

## New Supabase Project Setup

1. Create a Supabase project.
2. Open SQL Editor.
3. Paste and run `supabase/FINAL_SETUP.sql`.
4. Paste and run `supabase/VERIFY_SETUP.sql`.
5. Resolve any row with `ok = false`.
6. Configure Auth redirect URLs and Storage policies as documented in
   `supabase/README.md`.
7. Deploy Edge Functions and set secrets.

## CLI Setup Alternative

```bash
supabase link --project-ref <project-ref>
supabase db push
supabase functions deploy weekly-digest --no-verify-jwt
supabase functions deploy delete-account
```

Then run `supabase/VERIFY_SETUP.sql` in SQL Editor.

## Required Frontend Variables

```env
VITE_SUPABASE_URL=<supabase-project-url>
VITE_SUPABASE_ANON_KEY=<supabase-anon-jwt>
VITE_APP_URL=<canonical-production-url>
```

## Required Function Secrets

```env
SUPABASE_URL=<supabase-project-url>
SUPABASE_ANON_KEY=<supabase-anon-jwt>
SUPABASE_SERVICE_ROLE_KEY=<supabase-service-role-key>
SITE_URL=<canonical-production-url>
DIGEST_CRON_SECRET=<long-random-secret>
RESEND_API_KEY=<email-provider-key>
DIGEST_FROM_EMAIL=<approved-sender-email>
```

Never expose `SUPABASE_SERVICE_ROLE_KEY` through a `VITE_` variable.
