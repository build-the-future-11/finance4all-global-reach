# Implementation Log — Pass One (current run increment)

This run continued Pass One by closing the highest-leverage gap in the FinanceMeta
golden journey: **"View progress and contribution history"** and **"analytics capture
activation, submission, completion, and return usage."**

## Changes

### Product / member journey
- **`src/components/portal/ContributionHistory.tsx` (new):** Member-facing contribution
  history derived exclusively from real persisted records — accepted lab applications,
  issued curriculum certificates, and completed Catalyst lessons. Honest empty state with
  CTAs into Education and Meta Labs. No fabricated data.
- **`src/pages/portal/Dashboard.tsx`:** Mounted `ContributionHistory` in the dashboard
  between participation summary and lab applications, so the golden-journey "see progress"
  step is now real and visible.

### Analytics (journey instrumentation)
- **`supabase/migrations/021_analytics_journey_events.sql` (new):** Expanded the
  `track_product_event` server-side allowlist with `education.certificate_issued`,
  `opportunity.interest_saved`, and `research.application_decided`. Retains auth check,
  property-shape validation, key regex, 2KB cap, and 200/day per-user rate limit.
  `REVOKE ... FROM PUBLIC, anon; GRANT EXECUTE TO authenticated`.
- **`src/lib/analytics.ts`:** Mirrored the three new event names into the typed client
  allowlist `PRODUCT_EVENT_NAMES`.
- **Instrumentation at real mutation sites (only fire on success):**
  - `src/hooks/portal/useCertificates.ts` → `education.certificate_issued` on issuance
    (`lesson_count` property, non-PII).
  - `src/hooks/portal/useLabs.ts` → `research.application_decided` on reviewer decision
    (`decision` property).
  - `src/hooks/portal/usePathways.ts` → `opportunity.interest_saved` when interest saved.

### Tests
- **`src/lib/analytics.test.ts`:** Added a drift-guard test asserting the client
  `PRODUCT_EVENT_NAMES` allowlist and the DB `track_product_event` allowlist (migration
  021) are exactly equal in both directions. Prevents silent client/DB analytics drift.

### Consistency / release artifacts
- **`supabase/FINAL_SETUP.sql`:** Regenerated from all 21 migrations in filename order to
  match the `final-readiness.mjs` synchronization check exactly.

## Deliberate non-changes
- Did not touch other repos in `~/Downloads` (separate git repos, out of scope).
- Did not weaken the production env validator (it correctly blocks builds without config).
- Did not add `projectTitle` to `LabApplication` mapper (would require an extra join); the
  contribution card uses a generic, honest label instead of a fabricated title.
