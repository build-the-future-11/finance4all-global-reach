# Product Portfolio

Status: workspace inventory as of 2026-07-15.

## Portfolio Classification

| Project | Path | Classification | Launch Potential | Notes |
| --- | --- | --- | --- | --- |
| Finance4All / FinanceMeta | `/Users/ryan/Downloads/finance4all-global-reach-main` | Production-critical, near launch | High | Financial-literacy nonprofit portal with Supabase membership backend. This is the primary launch candidate. |
| The Bu1ld Nexus | `/Users/ryan/Downloads/the-bu1ld-nexus-main` | Active development, near launch | High | Separate ML research/building member platform with its own TanStack/Supabase architecture and existing uncommitted work. Do not merge into Finance4All. |
| ObscuredRecordsAgent | `/Users/ryan/Downloads/ObscuredRecordsAgent` | Prototype utility, archive candidate | Low as a website | Python/media workflow utility, not a website or membership portal. Keep separate. |
| Visualization workspace | `/Users/ryan/.codex/visualizations/2026/07/12/019f5589-f3e5-7ae2-af61-5dd907c4cb0f` | Generated artifact workspace | Low as a product repo | Treat as visualization output unless a product manifest appears. |
| VertexED path | `/Users/ryan/Downloads/vertexED.ai-codex-fix-cutoff-first-letter-in-response-p1cafa` | Blocked/missing | Unknown | Listed by workspace roots but not present on disk during discovery. |

## Portfolio Priorities

1. Finance4All / FinanceMeta: complete production configuration and launch
   smoke testing first.
2. The Bu1ld Nexus: preserve its separate architecture, run its release gate,
   and resolve its existing uncommitted work deliberately.
3. ObscuredRecordsAgent: document as a local tool; do not spend launch effort
   unless it becomes part of a real product.
4. Missing VertexED path: restore or remove the workspace reference.

## Shared Reuse Opportunities

- Supabase auth patterns: idempotent profile creation, role checks, RLS-first
  authorization, and server-only service-role operations.
- UI patterns: accessible auth shells, production-safe unavailable states,
  member layouts, loading/empty/error/denied states, and admin audit surfaces.
- Testing: typecheck, lint, unit tests, e2e smoke, dependency audit, build gate,
  and browser viewport checks.
- Deployment: explicit environment validation, canonical URL, redirect URL
  checklist, Edge Function secret checklist, and release smoke test template.

## Non-Reuse Boundaries

- Do not merge Finance4All and Bu1ld data models; their missions, audiences,
  content taxonomies, and brand claims differ.
- Do not share production Supabase projects, service-role keys, user tables, or
  content records across unrelated organizations.
- Do not import demo content from one product into another.
