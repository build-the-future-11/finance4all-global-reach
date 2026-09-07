# Production Readiness

Last reviewed: 2026-09-07

This is the active evidence ledger for the canonical member portal. A repository check proves only
the layer it exercises. Source tests, deployment health, authenticated behavior, database policy,
and program outcomes are separate claims.

## Canonical boundary

| Concern | Canonical owner |
| --- | --- |
| Member portal source | `build-the-future-11/finance4all-global-reach` on protected `main` |
| Portal deployment | `https://finance4all-global-reach.vercel.app` |
| Member database and auth | Supabase project `pnemeegkwyaicsbnbnmg` |
| Public landing | `build-the-future-11/FinanceMeta-Landing` |
| Program and research registry | `build-the-future-11/FinanceMeta-Global` |

VertexED and Supabase project `xwlrzgfuhfbckgvcmyoq` are outside this boundary and must never be
used as a FinanceMeta authentication, database, callback, or certification substitute.

## Priority ledger

| Priority | Finding | Root cause | Action and verification | Status |
| --- | --- | --- | --- | --- |
| P0 | Production migration history is not certified | The live schema was created outside the canonical ledger and current management access does not expose the FinanceMeta project | Follow issue #48: capture live schema and ledger, prove ten-migration equivalence, repair only with supported Supabase CLI commands, reconstruct staging, test restoration, then run exact ledger certification | Blocked on authorized FinanceMeta Supabase access |
| P0 | Email, Google, recovery, and two-member isolation are not production-certified | Controlled accounts and repository secrets have not been provisioned | Configure the four `E2E_MEMBER_*` secrets plus a controlled Google identity; run Production Auth Certification and retain redacted exact-revision evidence | Blocked on controlled identities and secrets |
| P1 | Production RLS behavior lacked an exhaustive runnable gate | The earlier SQL covered only profile fields and role escalation | The rollback-only SQL now inventories all 20 canonical public tables, denies anonymous grants and internal function execution, and exercises owner/cross-member mutations; run Production RLS Certification against the canonical database | Implemented in source; live run blocked on database access |
| P1 | Settings persistence was not behavior-tested | Previous tests did not submit the full profile payload | Component test verifies accessible controls, trimmed payload, and success feedback; credentialed E2E now verifies reload and logout/login persistence and restores its marker | Source verified; production run blocked on credentials |
| P1 | Public accessibility checks were source-level only | No accessibility engine ran in a browser | Chromium/Axe now covers landing, evidence, login, signup, recovery, and reset routes with zero violations in local certification | Verified locally; CI pending branch publication |
| P2 | Build tooling contained ten known advisories | Vite 5 and stale transitive development packages | Upgrade to Vite 8, Vitest 5, React plugin 6, current Lovable Tagger, Browserslist, and jsdom; require Node 22.12+ | Verified locally with zero full and production audit findings |
| P2 | Member and admin forms had incomplete semantics and duplicate-submit exposure | Several visual labels were not associated with controls and mutation buttons stayed enabled | Associate labels and descriptions, use native form submission, use URL input types, and disable pending mutations | Verified by typecheck, lint, component tests, build, and public browser suite |
| P2 | Four Fast Refresh warnings weakened the lint signal | Hooks and reusable constants were exported from component modules | Split auth context/hook ownership and stop exporting unused UI variants | Verified locally with zero lint warnings |
| P1 | Current main is not exact-source deployed | Vercel reported a provider build-rate limit | Remove the account quota/capacity boundary, deploy current protected main, and require `/release-revision.json` to equal the merge SHA | External Vercel action required |
| P1 | Landing-to-member golden journey remains open | Landing health and portal health do not prove an authenticated handoff | After auth and deployment gates pass, run the landing CTA through login, onboarding, persisted activity, logout/login, and cleanup; close landing issue #16 only with retained evidence | Blocked by upstream production gates |
| P1 | Member privacy/legal operations are incomplete | No qualified policy approval or certified deletion/export workflow exists | Obtain qualified review, publish accurate policies, implement account export/deletion, and test retention promises before broad onboarding | External legal and product decisions required |

## Source verification completed in this wave

- clean npm lockfile installation;
- zero-error TypeScript and ESLint;
- 70 Vitest unit/component/contract tests;
- 20 Node release, security-header, migration, RLS, and production-verifier tests;
- production-mode Vite build with route-level chunks;
- 11 Chromium interaction and Axe tests, repeated without retry;
- zero vulnerabilities in both complete and production-only npm audits;
- rollback-only RLS certification source contract covering the canonical public schema inventory;
- expanded credentialed two-member persistence scenario, ready for secret-backed execution.

These results are local source evidence until the branch is reviewed, merged, and CI succeeds on the
exact merge SHA. The RLS SQL has not run against production in this wave.

## Release exit gate

Do not label the portal production-verified until all of the following have exact-SHA evidence:

1. Protected-main CI succeeds.
2. Vercel serves the exact merge SHA in `/release-revision.json`.
3. Production migration ledger equals the ten canonical migration files.
4. Production RLS certification ends in `result=PASS`.
5. Email, confirmation, onboarding, recovery, Google OAuth, persistence, logout/login, and two-member isolation pass with controlled accounts.
6. Landing CTA completes the same member journey without a VertexED origin.
7. Privacy, support, account deletion, and retention promises are approved and operational.
