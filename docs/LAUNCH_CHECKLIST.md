# External Launch Checklist

These are the tasks that still require production accounts, credentials, legal authority, or real organizational content outside this repository.

- Apply migrations `001` through `012` to production Supabase, then run `supabase/verify_migration_status.sql`.
- Deploy `weekly-digest` with `--no-verify-jwt`, deploy `delete-account` with default JWT verification, and set every function secret listed in `supabase/SUPABASE_SETUP.md`.
- Configure a weekly scheduler for `weekly-digest` using `POST` and `Authorization: Bearer DIGEST_CRON_SECRET`.
- Set production `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `VITE_APP_URL` in hosting.
- Set the production Supabase Site URL and OAuth redirect URLs listed in `DEPLOYMENT.md`; configure Google Cloud's Supabase callback URI if Google sign-in is enabled.
- Assign at least one real administrator through a controlled database update, keep a second recovery admin, and verify no member account has an elevated role unexpectedly.
- Replace or approve the public privacy and terms pages through an authorized legal representative.
- Publish only verified Finance Debrief content, opportunities, chapter information, course modules, events, and research projects. Remove any seed record that is not real before opening registration.
- Configure an owned canonical domain, update `VITE_APP_URL`, and validate metadata/social previews against that domain.
- Verify Resend sender/domain approval before enabling weekly digest delivery.
- Establish the official support mailbox owner, escalation process, and retention/deletion process for contact submissions and member data.
- Connect production logs/alerts for hosting, Supabase function failures, authentication anomalies, and database backups.
