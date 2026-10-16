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


## Exact-digest Supabase registry mirror — 16 October 2026

Hosted run `38850007437` failed before migrations because public ECR returned `toomanyrequests: Data limit exceeded`. This is registry transport failure, not a SQL certification result.

The CI service and its expected-image reference now use `ghcr.io/supabase/postgres@sha256:28f0e16a019e648089fc1a6d333549a55548f6019c15ae4bd7cd58b989027518`. **Only the registry changed; the complete immutable index digest and image contents are unchanged.**

Read-only registry verification fetched the exact pinned OCI index from public ECR, Docker Hub (`registry-1.docker.io`) and GHCR. All returned HTTP 200 and the same 1,609-byte body; locally computed SHA-256 for every body was `28f0e16a019e648089fc1a6d333549a55548f6019c15ae4bd7cd58b989027518`. Docker Hub and GHCR also returned that value in `Docker-Content-Digest`; ECR omitted that header, so its body was independently hashed. Index media type: `application/vnd.oci.image.index.v1+json`.

The Linux/amd64 child manifest from Docker Hub and GHCR was also identical: `sha256:fc542c31f334749adbbd3c9e16b6be90f17d0fe6460d5196066d73f2723c9ecf` (5,775 bytes). GHCR's config blob hash matched `sha256:81c6dd7dfc77117c0932097c0c1aef887991035c963ee9b5cb4d08a51caf566a`, identifying Linux/amd64. All 29 referenced GHCR layer HEAD requests returned HTTP 200 with lengths matching the manifest. No image layers were downloaded locally; no database or Docker daemon was started. These checks verify mirror identity and availability, not runtime or migration success.

Official provenance: [Supabase's mirror workflow at commit 4f3798200476a30ce833310b5ed175064d6a605a](https://github.com/supabase/postgres/blob/4f3798200476a30ce833310b5ed175064d6a605a/.github/workflows/mirror.yml) explicitly mirrors `docker.io/supabase/postgres` to both `public.ecr.aws/supabase/postgres` and `ghcr.io/supabase/postgres`. The fetched workflow file's SHA-256 was `cf070b801ffa92daf5ef1f42bd45b7b6f197588bff401c3222ddc20205c97dd0`.

The supply-chain contract retains the immutable digest check and resolved image provenance assertion; its registry-specific regex was updated to GHCR. Targeted validation: `node --test tests/workflow-supply-chain.test.mjs` **passed 9/9** using Node 22.23.2. No mutable version substitution, dependency change, credential change or certification bypass was introduced. The corrected candidate still requires a fresh hosted database-authorization run.

## External landing public-QA revision pin — 16 October 2026

The public read-only QA job checks the separate `https://finance-meta-landing.vercel.app` service. Its prior pin `03d2b58a8c030ab2ffe0b869d27b9ff9f6508c2b` no longer matched that service. Only `public-qa/routes.json`'s revision was refreshed to `4ffeb89a216ffb649ff0d7dc8172128c6398713d`; its 166 paths and the browser suite's exact before/after revision assertions are unchanged. This is an external-service baseline update, not portal deployment evidence.

The sibling checkout was inspected read-only and clean at that exact HEAD, tree `6ac46026d4ca1e89011f9f332ced679caa10e40a`. The authenticated GitHub API returned the same SHA/tree and a valid verified signature for [merge commit 4ffeb89](https://github.com/build-the-future-11/FinanceMeta-Landing/commit/4ffeb89a216ffb649ff0d7dc8172128c6398713d). Exact-SHA [Release Check 38844722689](https://github.com/build-the-future-11/FinanceMeta-Landing/actions/runs/38844722689) and [Production Health 38844722725](https://github.com/build-the-future-11/FinanceMeta-Landing/actions/runs/38844722725) succeeded; the latter's source-binding and canonical-production probe steps both executed successfully. GitHub's Vercel status linked successful [deployment FbWhp6XeseCSdGpyQoE7GC5EmbMt](https://vercel.com/build-the-future-11s-projects/finance-meta-landing/FbWhp6XeseCSdGpyQoE7GC5EmbMt). Three separated read-only manifest probes returned service `finance-meta-landing` and the exact new SHA, with the final check at **2026-10-16 04:34:55 UTC**.

All 166 pinned paths remain in the sibling's current 172-route source inventory. The live sitemap contains 171 matching source routes; `/search` is intentionally excluded and marked noindex by its prerender script, and a direct live GET returned HTTP 200. Six additional external article paths are outside this retained 166-route audit: `lower-inflation-does-not-mean-lower-prices`, `why-bond-prices-fall-when-yields-rise`, `how-a-profitable-company-runs-short-of-cash`, `what-a-weaker-currency-changes`, `a-stock-split-does-not-make-a-company-cheaper`, and `a-rising-stock-index-is-not-the-whole-economy`, all under `/publications/financedebriefed/`. This observation neither imports those articles into the portal nor grants editorial approval. No sibling files changed. The updated pin still requires a fresh hosted public-QA receipt; the provenance and inventory checks are not a substitute for that browser run.
