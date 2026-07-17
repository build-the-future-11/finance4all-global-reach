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

## Pass 2 — Finance Debrief trustworthy foundation (preview)

| # | Criterion |
| --- | --- |
| P2-1 | `approved_sources` migrated + RLS |
| P2-2 | Article editorial status machine + metadata columns |
| P2-3 | AI generation log table; publish path cannot skip human+source |
| P2-4 | Version history on post-publish edits |
| P2-5 | Admin UI for draft/review/publish/correct |
| P2-6 | Types + unit tests for publish guards |
| P2-7 | Educational disclaimer on published views |
| P2-8 | Memory docs updated; queue items marked |

## Global launch acceptance (later)

Critical journeys work end-to-end on production URL with real Supabase: signup/onboarding/login/OAuth/reset; read/publish Debrief; apply to lab; RSVP; bookmark; admin role change; VERIFY_SETUP all ok; security matrix sampled.
