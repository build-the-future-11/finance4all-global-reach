# External Launch Checklist

These are the remaining tasks that require access outside this repository.

- Apply migrations `001` through `011` to the production Supabase project, then run `supabase/verify_migration_status.sql`.
- Set production `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `VITE_APP_URL`; optionally set `VITE_ERROR_REPORTING_ENDPOINT` to an approved monitoring collector.
- Set the production Supabase Site URL and OAuth redirect URLs listed in `DEPLOYMENT.md`; configure Google Cloud's Supabase callback URI if Google sign-in is enabled.
- Assign at least one real administrator through a controlled database update, and verify no member account has elevated roles unexpectedly.
- Review the public privacy and terms pages with an authorized legal representative and replace them if organization-specific legal requirements apply.
- Publish only verified Finance Debrief content, opportunities, chapter information, and event details. Remove seed or demo records that are not real before opening registration.
- Configure an owned canonical domain and update `VITE_APP_URL` before public promotion; validate social previews against that domain.
- Establish a support owner for the official contact mailbox and a retention/deletion process for contact submissions and member data.
