# Platform intake

## Data and routes

`/portal/apply?call=<id>` requires the existing authenticated/onboarded member session. It loads `intake_calls` and writes private `intake_submissions`. `/portal/intake-review` is admin-only in both routing and database authorization. Existing project applications, event registration, account workflows and external Tally forms remain available.

Eight seeded calls record **expressions of interest**, including quantitative, financial ML, economic, investment, engineering, chapter, research-submission and partnership tracks. These records are not scheduled cohorts. An administrator can close a call or change its availability from the review page. Create additional reviewed calls through Supabase's table editor with an ID, title, kind, description, status and optional UTC deadline. Database grants require an admin account for API writes. Do not mark a program open until its operational requirements are confirmed.

## Security and privacy

- Authenticated applicants can read only their own records. Only trusted database-admin profiles can review all records.
- The insert column grant prevents spoofing applicant, review state, timestamps and review notes. Ownership comes from `auth.uid()`.
- A private trigger enforces open/deadline state, serializes submissions per account and caps accepted inserts at five in a rolling 24-hour window. Withdrawals retain quota consumption. A unique applicant/call constraint prevents duplicate intake.
- A browser-generated UUID is reused after uncertain network responses. Only an existing receipt for that same UUID and applicant can convert a retry into success. If an applicant edits their answers before that retry recovers an earlier receipt, the form identifies the unsent edits and preserves them for download. The receipt download contains the stored submission; the current-answers download contains the form's current values.
- Server constraints enforce answer lengths, consent/version and HTTPS work links. The browser additionally rejects credential-bearing links. Submitted answers are immutable. Applicants can withdraw; they cannot self-accept or edit review notes. Withdrawn records cannot be reopened through review.
- Database export includes intake records scoped to the requesting account. Account deletion cascades to submissions. Withdrawal retains data; there is no automatic retention deadline. Operators must approve a retention/deletion process before broad onboarding.
- No private application answers enter analytics, URLs, public directories, localStorage or logs. When draft storage is available, a new draft or an explicitly resumed draft autosaves to the account's private `application_drafts` record after a one-second pause. Existing drafts are offered for restoration before autosaving starts. Drafts are not submitted applications and do not carry submission consent. Changes awaiting confirmation remain in component memory; downloaded JSON contains private answers.
- Draft updates and deletions require the saved revision and a confirmed returned row. Clearing every answer in an existing draft is persisted. Saving and deletion cannot overlap. A confirmed deletion removes the cached draft, keeps the current form answers available, and pauses autosaving until reload. A failed or conflicting deletion never reports success.

## Deployment contract

1. Review `supabase/migrations/20260921141333_platform_intake.sql` against the canonical project. Back up before applying through the normal reviewed migration procedure. Do not rewrite an existing migration ledger or use the local bootstrap on production.
2. Apply all pending migrations in order; verify the ledger and local/production authorization scripts against the intended database. This work has **not** applied changes to production.
3. Preserve the existing portal environment: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_AUTH_REDIRECT_ORIGIN`. Use the canonical project and verified HTTPS origin. No secret or service-role key belongs in browser variables.
4. Deploy a clean committed portal revision. Verify signed-in application, receipt, reload, withdrawal, export, two-account isolation and administrator review on that exact deployment. An absent table produces an explicit unavailable state with the existing external form.
5. Only then set the public root's `VITE_MEMBER_APP_URL` to that verified origin and `VITE_NATIVE_INTAKE_ENABLED=true`, and rebuild it. The default is false; the public application page retains working external intake when the native path is not certified.
6. Configure and verify Supabase Auth rate limits, signup/CAPTCHA/email delivery and role assignment as operational controls. The database submission cap does not replace account-creation abuse controls.

The contact mailbox and existing Tally forms are preserved; no transactional email integration or automatic response promise is added. No extra vendor credential is needed for database persistence beyond the existing Supabase deployment. Legal identity, terms, safeguarding/age/guardian process, retention owner and program staffing require human decisions.

## Verification

`npm run typecheck` now checks the actual application and Vite config; the former empty-wrapper check did not do so. `npm test` covers input normalization, failure states, confirmations, duplicate clicks, retry identity, draft persistence and existing functionality. Browser fixtures verify that recovered receipts and unsent current answers remain distinguishable in the interface and in their downloaded files. They do not certify live authentication or production authorization. CI replays all migrations and runs the intake and collaboration authorization suites alongside the two existing RLS suites. All SQL fixtures roll back.

Authorization implementation follows the [Supabase RLS documentation](https://supabase.com/docs/guides/database/postgres/row-level-security) and [function security guidance](https://supabase.com/docs/guides/database/functions). Browser role guards are navigation aids; database rules enforce access.
