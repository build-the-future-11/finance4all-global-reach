# Acceptance Criteria

## Pass 1 — Audit, memory, light reworks

| # | Criterion | Met? |
| --- | --- | --- |
| P1-1 | All required permanent memory files exist under `docs/` | YES |
| P1-2 | `PROJECT_MEMORY.md` is canonical and current | YES |
| P1-3 | Audit issues have stable IDs + allowed statuses | YES (`AUDIT_MASTER.md`) |
| P1-4 | Baseline lint, typecheck, unit, build, release:static, e2e recorded | YES |
| P1-5 | Dependency-ordered implementation queue frozen | YES |
| P1-6 | Owner-only blockers listed with actions | YES (`OWNER_ACTIONS.md`) |
| P1-7 | Exact Pass 2 next task stated | YES |
| P1-8 | Work ownership claimed; no overlapping silent edits | YES |
| P1-9 | Low-risk blockers fixed or deferred with ID | YES |
| P1-10 | No broad speculative rewrite performed | YES |

**Pass 1 result:** ACCEPTED (documentation + baseline). Live schema remains owner-blocked and does not fail Pass 1 acceptance.

## Pass 2 — Finance Debrief trustworthy foundation

| # | Criterion | Met? |
| --- | --- | --- |
| P2-1 | `approved_sources` migrated + RLS | YES (013; live OA-1) |
| P2-2 | Article editorial status machine + metadata columns | YES |
| P2-3 | AI generation log table; publish path cannot skip human+source | YES |
| P2-4 | Version history on post-publish edits | YES |
| P2-5 | Admin UI for draft/review/publish/correct | YES |
| P2-6 | Types + unit tests for publish guards | YES (+10 tests; 88 total) |
| P2-7 | Educational disclaimer on published views | YES |
| P2-8 | Memory docs updated; queue items marked | YES |

**Pass 2 result:** ACCEPTED (Wave 1 source). Live schema application remains owner-blocked (OA-1) and does not fail Pass 2 acceptance. Broader Pass 2 product brief items outside Wave 1 remain deferred to Pass 3 per D-002 / IMPLEMENTATION_QUEUE.

## Global launch acceptance (later)

Critical journeys work end-to-end on production URL with real Supabase: signup/onboarding/login/OAuth/reset; read/publish Debrief; apply to lab; RSVP; bookmark; admin role change; VERIFY_SETUP all ok; security matrix sampled.
