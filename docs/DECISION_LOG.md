# Decision Log

| ID | Date | Decision | Rationale | Impact |
| --- | --- | --- | --- | --- |
| D-001 | 2026-07-17 | Public legal name deferred (Finance4All in UI; FinanceMeta in pass docs) | Owner must choose legal brand | FM-PUBLIC-002 BLOCKED |
| D-002 | 2026-07-17 | Pass 2 priority = Finance Debrief trustworthy editorial system | Spec forbids unsourced AI auto-publish; largest product gap | Queue Wave 1 frozen |
| D-003 | 2026-07-17 | Preserve existing portal modules; extend rather than rewrite | Valuable auth/RLS/CMS already present | No speculative rewrite in Pass 1 |
| D-004 | 2026-07-17 | Hybrid CMS (DB + static fallback) retained until seeded | Resilience when 008 empty | Admin seed UI enabled |
| D-005 | 2026-07-17 | Labs creation remains lead-researcher portal for now | Working path exists; admin overview deferred | FM-PORTAL-004 DEFERRED |
| D-006 | 2026-07-17 | Pass 1 accepts owner-blocked live schema without failing pass | Pass 1 is audit/memory, not live DB ownership | ACCEPTANCE_CRITERIA P1 |
| D-007 | 2026-07-17 | Pass 2 implements Wave 1 Debrief only; rest of Pass 2 prompt → Pass 3 | Frozen queue; coherent vertical slice before portal expansion | IMPLEMENTATION_QUEUE Wave 1 DONE |
| D-008 | 2026-07-17 | AI Debrief adapter ships unconfigured; queue/logs/admin without live provider keys | Credentials are owner-only; never auto-publish | FM-DEBRIEF-003 |
