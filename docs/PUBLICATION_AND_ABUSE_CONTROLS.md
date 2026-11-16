# Publication and abuse controls

Candidate migrations `20261011090000` and `20261011091000` are **not applied to the live database**. Production access and controlled-account acceptance remain blocked at the owner's request. The portal remains a draft release.

## Publication

The database gates chapters, news, explainers, events, opportunities, research projects, intake calls, studio submissions, essays and introductions. Every existing and new row starts as `draft`; no historic seed, title match or creation timestamp constitutes approval. Existing content is preserved. Anonymous clients retain no member-content read access. Signed-in readers can see published content; authors/leads retain their own drafts and administrators can review all records, subject to existing role policies.

Administrators use **Admin → Publication review** to inspect the full record, supply a 10–2000 character evidence/decision note and choose draft, published or archived. The server derives the reviewer from the session, restricts the target table, locks the row and requires the displayed revision. Clients cannot write publication metadata directly. Changing reviewed content returns it to draft and increments its revision. Timestamp and derived chapter member-count maintenance do not invalidate copy. Events require a published chapter before approval.

Review actions and content changes append an audit record in `private.publication_reviews`; client roles cannot read, edit or delete it. It stores record identity, revision, transition, actor, time and decision note, not copies of submitted content. An account deletion nulls reviewer identity, preserving the decision. An operator still needs to approve retention and editorial staffing before opening enrollment. Publishing a record does not certify a scientific claim, activate an event, or override deadlines, RLS or intake closure.

Applications, registrations, bookmarks, interests and essay votes require a published target on creation. Existing private receipts and cancellation remain available. The essay aggregate view and count RPC cannot reveal another author's draft. Static learning guides remain source-reviewed assets governed by repository review; directory profiles remain member-authored under their existing privacy rules.

## Member activity budgets

PostgreSQL enforces the following per-account hourly committed-write budgets. The hour begins with the first committed operation in that action's current window. These are engineering defaults, adjustable only through reviewed server changes.

| Action | Per hour |
| --- | ---: |
| All metered writes/exports/reviews combined | 600 |
| Introductions; account exports | 5 each |
| Studio and essay submissions/edits | 10 each |
| Connection requests/responses; lab applications/reviews; intake submissions/reviews; deletion requests/reviews | 20 each |
| Profile and digest edits; memberships; opportunity interests; registrations; publication reviews | 60 each |
| Learning/progress; saved application drafts; bookmarks; essay votes; project tasks | 120 each |

The existing five-intake-submissions-per-24-hours rule remains independently enforced. Member records over 64 KiB are rejected in addition to existing field constraints. Notifications are server-owned and excluded; metered source actions bound notification creation. Deletes/cancellations are not charged so a limit cannot prevent withdrawal or cleanup. Recreating a deleted record consumes a new insertion.

Counters live in `private.member_write_budgets`, keyed by account and a finite server-chosen action. Atomic `INSERT … ON CONFLICT … WHERE … RETURNING` serializes concurrent increments; aggregate locks precede action locks. A failed statement/transaction consumes no quota and persists no partial content. The table stores at most one row per account/action, without request bodies or IP addresses, and account deletion cascades to counters. `PT429` is returned when exhausted; clients receive a retry-later message. The export implementation is private behind its metered RPC.

These limits bound **committed member activity**, not rejected HTTP attempts, anonymous traffic, signup, login, recovery email, or aggregate multi-account attacks. Provider Auth rate limits/CAPTCHA and edge request/body limits require canonical provider access and remain unverified. Do not interpret these migrations as live abuse certification.

## Validation and rollout

CI replays all migrations in the pinned disposable Supabase PostgreSQL image, runs existing RLS suites, rollback-only publication/budget tests, then a multi-session concurrency test. The latter requires the CI Docker service ID; it accepts no database URL and removes its unique accounts/content/counters in `finally`.

Before a future live rollout: capture schema/grants/ledger and backup evidence; review the two additive migrations; rehearse with a restored isolated copy; record the exact candidate/source pair; apply only missing reviewed migrations; then perform real controlled-account and editorial checks. The migration deliberately hides unreviewed historic content. Do not bulk-publish rows to restore a full-looking portal. Prepare legitimate reviewed records before enabling their journeys.

Recovery uses a reviewed forward fix. Do not drop the private audit/counters or relax publication RLS to roll back the UI. Keep publication-gated source deployed while resolving a schema or content problem. Live restore, provider protections and operating ownership remain separate gates.

Implementation references: [PostgreSQL atomic upserts](https://www.postgresql.org/docs/current/sql-insert.html#SQL-ON-CONFLICT), [restrictive row policies](https://www.postgresql.org/docs/current/sql-createpolicy.html).
