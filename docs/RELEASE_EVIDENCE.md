# Platform expansion release evidence — 16 October 2026

## Candidate and scope

Repository: `build-the-future-11/finance4all-global-reach`; canonical workspace: `Finance4all-Web/finance4all-global-reach`. Branch: `codex/platform-expansion-20261016`. Baseline: `43508cc2f78a0820a66314b07d801977c0c5ff44` (PR 170 on main). The outer workspace is a different Git root and was not used for source control.

The candidate joins public research, programs, articles, chapters and events with the member shell. Inventories: 16 research records, zero authorized manuscripts; four existing public Debriefed guides, six complete manuscripts held, one restricted draft; 79 expansion locations (49 added), zero certified active claims; seven event launch notices (five held, two awaiting schedule), zero verified scheduled events from available sources; 22 programs (2 Active, 9 Interest open, 3 initial-screening Applications open, 6 On hold, 2 Planned). Live database totals were not certified.

## Source preservation and publication

Preexisting untracked `src/content/editorial-series.ts`, `evidence/financedebriefed-2026-10-11/` and `evidence/iyern-2026-10-14/` are preserved and excluded from this change. The full restricted Issue 001 import package resides outside the Vite/Git root in a mode-0700 directory with a mode-0600 JSON file; it is not in the public bundle or PR. No import, review, event publication, profile-consent change or registration was submitted to production.

The build now verifies editorial isolation after Vite. A release requires a clean committed checkout; do not bypass that guard to accommodate preserved unrelated files. Build the committed candidate from an isolated clean clone instead.

## Verification in progress

Runtime: Node 22.23.2 and npm 10.9.8 from `/opt/homebrew/opt/node@22/bin`.

- `npm ci`: 442 packages installed; audit reported zero vulnerabilities.
- `npm run typecheck`: passed during integration; final candidate run pending.
- `npm run lint`: passed during integration; final candidate run pending.
- Focused article/progress/import suites: 31 passed; focused research/IYERN/content suites: 24 passed; focused event/registration/map suites: 55 passed.
- Initial full tests found stale UI assertions and CPU-contention timeouts. Assertions were updated to the intended behavior; no timeout ceiling was increased. Final consolidated run pending.
- Browser tests were initially blocked because Playwright 1.63.0's pinned browsers were absent. Installation is in progress after network timeouts; no browser pass is inferred.
- Local PostgreSQL certification cannot run yet: Docker CLI exists, but the Colima socket/daemon is absent and no local psql was found. The existing hosted disposable PostgreSQL job is extended to run both new rollback-only SQL suites.

Browser, build, hosted CI and PR evidence will be appended after execution. This file is not a production acceptance receipt.

## Additive migrations and rollout order

New migrations: `20261016093000_public_event_catalog.sql` and `20261016094000_member_directory_consent.sql`. The repository migration ledger now contains 19 versions. Both default to no new public exposure: event listing is opt-in; member directory consent is false. Chapter operating status defaults to unverified. Existing records are not seeded, approved or retrospectively declared active.

Before frontend promotion, verify the canonical live database target and ledger, back up under the existing procedure, apply the reviewed migrations, and certify anonymous/member/admin publication boundaries plus controlled two-account journeys against the exact candidate. Older clients safely see fewer directory profiles after consent is introduced; the new frontend requires the new schema. Existing authentication, publication, abuse-budget, registration ownership and role gates remain authoritative. Revert the frontend to its prior immutable deployment if necessary; preserve additive schema and data while investigating, rather than dropping consent/evidence columns.

## Remaining production gates

Unrestricted onboarding remains **NO-GO** until the existing production readiness controls are satisfied: canonical target/ledger, live controlled-account and admin/RLS certification, email/OAuth/session paths, consent/safeguarding review, publication approval, verified environment, exact-SHA hosted evidence, accessibility/performance and backup/rollback. Public health and fixture browser tests do not satisfy those controls. No production database migration or promotion is authorized by this receipt.

Content gates remain independent: authentic official logo source; Substack archive access and editorial approval for held manuscripts; EigenFinance current source availability; research reproduction and author permissions; confirmed event dates/owners; operating evidence for chapters; program staffing/rules and the conflicting December 1 milestone. Their absence does not prevent reviewing this implementation.
