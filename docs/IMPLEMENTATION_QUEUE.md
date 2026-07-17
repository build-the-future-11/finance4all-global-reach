# Implementation Queue (Frozen — Pass 1)

Dependency order. Do not reorder without DECISION_LOG entry.

## Wave 0 — Owner blockers (parallel to engineering)

| Order | Item | Audit IDs | Depends on |
| --- | --- | --- | --- |
| 0.1 | Apply `FINAL_SETUP.sql` + `VERIFY_SETUP.sql` on live project | FM-DATA-001, FM-AUTH-002 | Owner |
| 0.2 | Configure Auth Site URL + redirects | FM-AUTH-001 | 0.1 |
| 0.3 | Confirm Vercel `VITE_*` match live project; redeploy | FM-OPS-001 | 0.1 |
| 0.4 | Deploy Edge Functions + secrets | FM-SEC-002, FM-OPS-002 | 0.1 |
| 0.5 | Promote first admin; content review seed | FM-DATA-002 | 0.1 |
| 0.6 | Legal public name decision | FM-PUBLIC-002 | Owner |

## Wave 1 — Pass 2 (DONE 2026-07-17)

| Order | Item | Audit IDs | Depends on | Status |
| --- | --- | --- | --- | --- |
| 1.1 | Migration: `approved_sources` + article editorial columns + RLS | FM-DEBRIEF-001/002/005 | Schema baseline | DONE |
| 1.2 | Migration: `news_article_versions`, `debrief_ai_generation_logs` | FM-DEBRIEF-003/004 | 1.1 | DONE |
| 1.3 | Publish/transition RPC with hard guards | FM-DEBRIEF-003 | 1.1–1.2 | DONE |
| 1.4 | Types + mappers + Vitest publish-guard tests | — | 1.3 | DONE |
| 1.5 | Admin Debrief editorial UI (replace simple news toggle) | FM-DEBRIEF-* | 1.3 | DONE |
| 1.6 | Member Debrief UI: disclaimer, source attribution, draft hidden | FM-DEBRIEF-006 | 1.5 | DONE |
| 1.7 | Newsletter inclusion flag wiring to digest query | FM-DEBRIEF-005 | 1.5 | DONE |

## Wave 2 — Pass 3 (DONE 2026-07-17)

| Order | Item | Audit IDs | Status |
| --- | --- | --- | --- |
| 2.1 | Admin moderation for studios/essays | FM-PORTAL-003 | DONE |
| 2.2 | Certificates on curriculum completion | FM-PORTAL-005 | DONE |
| 2.3 | Chapter leadership + competitions model | FM-PORTAL-006 | DONE |
| 2.4 | Chapter global map UX | FM-PORTAL-007 | DONE |
| 2.5 | Nav alignment to PRODUCT_SPEC | — | DONE |
| 2.6 | Brand unify post D-001 (OG already absolute) | FM-PUBLIC-002 | BLOCKED (sitemap shipped) |

## Wave 3 — Pass 4 (DONE 2026-07-17)

| Order | Item | Audit IDs | Status |
| --- | --- | --- | --- |
| 3.1 | Authenticated Playwright journeys | FM-BASE-004 | DONE (PARTIAL live) |
| 3.2 | Live RLS role matrix documentation + scripts | FM-SEC-001 | DONE (PARTIAL live) |
| 3.3 | Fast Refresh lint cleanup (optional) | FM-BASE-001 | DONE (PARTIAL shadcn) |
| 3.4 | Launch checklist closeout | OWNER | DONE (docs); owner OA-* open |

---

## Exact next task

**Owner:** OA-1 apply FINAL_SETUP + VERIFY_SETUP + VERIFY_RLS_MATRIX; configure Auth/Vercel/Edge; optional staging `E2E_EMAIL`/`E2E_PASSWORD`. Engineering queue Waves 1–3 complete in source.
