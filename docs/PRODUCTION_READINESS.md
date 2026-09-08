# Production Readiness

Last reviewed: 2026-09-08

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
| P0 | Production migration history is not certified | The live schema was created outside the canonical ledger and current management access does not expose the FinanceMeta project | Follow issue #48: prove the ten historical migrations, repair them only with supported Supabase CLI commands, execute the new eligibility migration normally, then require exact eleven-version equality | Blocked on authorized FinanceMeta Supabase access |
| P0 | Email, Google, recovery, and two-member isolation are not production-certified | Controlled accounts and repository secrets have not been provisioned | Configure the four `E2E_MEMBER_*` secrets plus a controlled Google identity; run Production Auth Certification and retain redacted exact-revision evidence | Blocked on controlled identities and secrets |
| P1 | Production RLS behavior lacked an exhaustive runnable gate | The earlier SQL covered only profile fields and role escalation | The rollback-only SQL now inventories all 20 canonical public tables, denies anonymous grants and internal function execution, and exercises owner/cross-member mutations; run Production RLS Certification against the canonical database | Implemented in source; live run blocked on database access |
| P1 | Members could act on closed or expired records through direct API writes | UI state was treated as the eligibility boundary | The eleventh migration enforces open project, active opportunity, and upcoming event rules in RLS while preserving owner removal; the rollback-only production matrix includes adversarial attempts | Implemented and locally verified; migration not applied to production |
| P1 | Settings persistence was not behavior-tested | Previous tests did not submit the full profile payload | Component test verifies accessible controls, trimmed payload, and success feedback; credentialed E2E now verifies reload and logout/login persistence and restores its marker | Source verified; production run blocked on credentials |
| P1 | Public accessibility checks were source-level only | No accessibility engine ran in a browser | Chromium/Axe now covers landing, evidence, login, signup, recovery, and reset routes with zero violations | Verified on protected main CI run `34126395335` |
| P2 | Build tooling contained ten known advisories | Vite 5 and stale transitive development packages | Upgrade to Vite 8, Vitest 5, React plugin 6, current Lovable Tagger, Browserslist, and jsdom; require Node 22.12+ | Verified on main with zero full and production audit findings |
| P2 | Member and admin forms had incomplete semantics and duplicate-submit exposure | Several visual labels were not associated with controls and mutation buttons stayed enabled | Associate labels and descriptions, use native form submission, use URL input types, and disable pending mutations | Verified by typecheck, lint, component tests, build, and public browser suite |
| P2 | Four Fast Refresh warnings weakened the lint signal | Hooks and reusable constants were exported from component modules | Split auth context/hook ownership and stop exporting unused UI variants | Verified on main with zero lint warnings |
| P1 | The implementation release was not exact-source deployed | Vercel had previously reported a provider build-rate limit | Deploy protected main and require `/release-revision.json` to equal the implementation merge SHA | Resolved for `ce6fe4c781d17d02f3c8f5547b39d55b964e7069`; health checks enforce successor revisions |
| P1 | Landing-to-member golden journey remains open | Landing health and portal health do not prove an authenticated handoff | After auth and deployment gates pass, run the landing CTA through login, onboarding, persisted activity, logout/login, and cleanup; close landing issue #16 only with retained evidence | Blocked by upstream production gates |
| P1 | Member privacy/legal operations are incomplete | No qualified policy approval or certified deletion/export workflow exists | Obtain qualified review, publish accurate policies, implement account export/deletion, and test retention promises before broad onboarding | External legal and product decisions required |

## Source verification completed in this wave

- clean npm lockfile installation;
- zero-error TypeScript and ESLint;
- 84 Vitest unit/component/contract tests;
- 20 Node release, security-header, migration, RLS, and production-verifier tests;
- production-mode Vite build with route-level chunks;
- 11 Chromium interaction and Axe tests, repeated without retry;
- zero vulnerabilities in both complete and production-only npm audits;
- rollback-only RLS certification source contract covering the canonical public schema inventory;
- expanded credentialed two-member persistence scenario, ready for secret-backed execution.

## Production receipts

- protected portal `main`: `3ecb70d417795179b91e614d0e179a76ddae6379`;
- exact-main source CI run `34144099541`: success;
- live Vercel revision: `a528d9d2f3f0b8e2512fd5063a2349b226029123`;
- Production Health runs `34144099521` and `34163769771`: failed only because
  the live revision remained stale after repeated checks;
- Vercel reported a provider build-rate limit for the successor deployment;
- the live route and security-header contract passes independently of revision identity.

The direct application cards on current `main`, this branch's error boundary, eligibility
migration, recovery deadlines, and claim corrections are not production-deployed. The RLS SQL and
credentialed auth workflow have not run against production.

## Release exit gate

Do not label the portal production-verified until all of the following have exact-SHA evidence:

1. Protected-main CI succeeds.
2. Vercel serves the exact merge SHA in `/release-revision.json`.
3. Production migration ledger equals all eleven canonical migration files.
4. Production RLS certification ends in `result=PASS`.
5. Email, confirmation, onboarding, recovery, Google OAuth, persistence, logout/login, and two-member isolation pass with controlled accounts.
6. Landing CTA completes the same member journey without a VertexED origin.
7. Privacy, support, account deletion, and retention promises are approved and operational.
