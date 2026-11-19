# Event catalog source reconciliation

Checked 16 October 2026. This records repository/source evidence, not production event certification.

## Sources and counts

Read the connected Drive [Fall 2026 Event Launch Pack](https://docs.google.com/document/d/1brPGcFiZf96cGTCtnB0YYXf59aYARXid7bQ6zv2JWs4/edit), dated 2 September, and the [October 15 Master Opportunities Launch Kit](https://docs.google.com/document/d/1K1q9R0KbJL2vXAtpRIUbTzD_zpxGvF0scoTBVGJsz6E/edit), prepared 14 October. The later launch kit governs challenge holds. Sibling FinanceMeta-Global evidence reviewed: `operations/september-2026/EVIDENCE_LEDGER.md`, `operations/fintech-studio-buildathon/fmp_contract.json`, `OPERATING_SYSTEM_2026.md`, `records/F4A-29-36_contributor_partner_readiness.md` and chapter readiness records. No sibling repository was edited.

**Seven named program launch notices** are supported, comprising **five on hold** and **two awaiting schedule**. **Zero scheduled event records were verified from these source documents.** Live Supabase event inventory was not accessed/certified, so its actual public/member event count remains unknown. Seed/demo events are not evidence and were not imported. Historical planning windows were not converted to completed events. No new event records were seeded anywhere.

The notices are explicitly marked as program plans and shared by public and member discovery; they are not publication-approved event rows. They contain no speculative timestamp, host partner, prize, judge, capacity or registration CTA. Publicly reviewed Supabase events replace the corresponding notice only through an explicit related-program slug, never a fuzzy title match.

| Requested inventory | Reconciliation | Website behavior |
| --- | --- | --- |
| Finance4All financial literacy workshops/pilots | Format described; actual host, delivery date, attendance and outcome evidence not established | One Finance4 Impact pilot notice, awaiting schedule |
| Open Markets Challenge 001 | Published registration `xXOMYo` exists, but the later kit retains evaluator/data-provisioning control hold | On hold; no registration CTA |
| Global Investment Model Challenge 2026 | Rules, eligibility, deadline/timezone and judging not frozen; `GxN8Vz` draft | On hold; related program |
| Backtest Falsification Challenge | Dataset/licensing, reviewer staffing and rules outstanding; `Ek4aR4` draft | On hold; related program |
| IYERN Global Research Challenge | Early-interest proposal; no confirmed dates, judges, prizes or partner | Awaiting schedule; related program |
| IYERN/IYERJ research information sessions | No individual session record or schedule verified | No fabricated event; journal/program details remain available |
| FinanceMeta Quant Arena 2026 | Fall plan contains proposed rounds/rubric; no frozen calendar or authorized signup verified | On hold |
| FinTech Studio Buildathon | November is recommended planning window; exact dates null; management approval/rules pending | On hold; no sponsor/logo claim |
| Financial Foundations workshops | Education resources are not a delivered/scheduled workshop | Covered by learning pathway; no synthetic event |
| Finance Debriefed live sessions | Supporting podcast/content intent only; no session schedule or authorized recording | No fabricated session |
| Finance4 Impact school/community sessions | Same pilot lane as financial literacy workshops | Deduplicated to one pilot notice |
| Local chapter events | Starter Kit menu is a list of permissible activities, not actual event records | Reviewed DB records only |
| FinanceMeta Labs seminars | No verified dated seminar record | Program discovery only |
| Industry/research collaboration sessions | Warm offers/planning packets do not certify co-hosting or delivery | No unsupported external event/partner listing |

The old Moneyplotter × Empiric September 15–October 15 working window and November 1 stock-pitch partner-position proposal are not completion or co-hosting receipts. The Financial Initiative, Bu1LD, LaunchX and unrelated partner events were not presented as FinanceMeta-hosted.

## Single authoritative event source and permissions

Canonical scheduled records remain in `public.events`; no duplicate event table was introduced. Member queries retain existing publication and chapter RLS. A new `public_event_catalog(target_id, page_offset)` RPC returns at most 100 approved, explicitly public rows with a published chapter. `public_listing` defaults false for all existing/new rows. Anonymous users gain only execute access to the fixed safe projection, no table/profile/registration access. Metadata and public visibility edits invalidate prior approval through the existing review trigger.

The projection contains only reviewed event display fields, selected metadata keys and chapter city/country. It excludes unknown JSON metadata, publication audit/revision fields, member counts, private profiles and registrations. Public and member UI use the same mapper and lifecycle/calendar logic. Anonymous query failures do not trigger a broad authenticated-table fallback. Pagination supports loading further public records, and detail lookups fetch by exact ID.

The admin event editor supports creating and revising scheduled drafts, revision-fenced edits, explicit UTC start/end inputs, organizer IANA timezone, host, type, modality, location, eligibility, approved URLs, linked program, recording rights, registration windows and public-listing opt-in. Public-listing requests require a host, official source and an end time in the UI. Saving never publishes; the separate publication queue approves the current revision. Existing chapter publication checks, activity budgets and admin role policies remain authoritative.

The same migration adds chapter operating-status/evidence fields and a constraint preventing active status without owner, permission and activity evidence; an admin chapter editor saves revision-fenced drafts. Member display checks the trailing 45-day evidence window.

Migration `20261016093000_public_event_catalog.sql` is additive and **not applied to production**. Public discovery will show a clear unavailable state until the reviewed migration is deployed under the existing release gates. Existing member queries tolerate absent optional metadata on older schema.

## Date, calendar and registration behavior

- Upcoming/live/completed derive from verified timestamps; missing/invalid timing never becomes live. A past start without an end does not prove completion unless the reviewed record explicitly says completed.
- Explicit holds/cancellation override date-derived status. Scheduled calendar view excludes unscheduled/held/cancelled items; list view retains launch notices.
- Search and type/status/region/date filters, display-timezone selection and previous/next month controls are shared.
- ICS requires a published event with valid start/end and an eligible lifecycle. Exports preserve UTC instants, escape calendar text and fold lines by UTF-8 octet count; planning windows never produce calendar invitations.
- New member interest is permitted only for a reviewed upcoming future event inside its registration window. The database adds a restrictive hold/deadline rule alongside the existing publication, future-start, chapter, owner and activity limits. Malformed registration timestamps fail closed.
- Read errors are not interpreted as absence of registration; retries, same-render duplicate locks, account snapshot/session checks and confirmed-write receipts are retained. Cancellation remains available for an existing registration after a hold or closure. An external signup and a member interest record are distinct actions.

## Validation and remaining gates

`src/test/chapter-event-catalog.test.tsx` tests status boundaries, DST/month offsets, missing dates, held notices, registration windows, ICS injection/UTF-8 folding, search/filter/calendar navigation and explicit deduplication. Existing registration account-isolation and read-failure/double-click suites remain in scope. `supabase/tests/public_event_catalog_certification.sql` verifies anonymous projection fields, public opt-in, draft/chapter exclusion, approval invalidation, role ownership, malformed deadlines, hold denial and withdrawal in a rollback-only fixture.

Final targeted run: **55 tests passed** across the new catalog suite, the two existing registration suites, experience interactions and content-depth tests (`npx vitest run ... --maxWorkers=1`). An earlier concurrent run hit one 5-second timeout; rerun passed without increasing test timeouts. Full typecheck and scoped lint passed. Final integrated UI/SQL/build results belong in `RELEASE_EVIDENCE.md`.

Unresolved: live event/source reconciliation, actual organizer schedules, authorized historical recaps/recordings, production schema migration, publication decisions, two-account live registration journeys, deployment provenance and production onboarding certification. No deployment, publication or registration submission was performed by this work.
