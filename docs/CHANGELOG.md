# Changelog

## 2026-07-18 — Ownership + DEFINER harden (018–019)

- Migration `018_security_definer_search_path.sql` pins all public SECURITY DEFINER `search_path`
- Migration `019_ownership_force_assign.sql` force-assigns owners from `auth.uid()`, indexes dashboard queries, deep-links lab received → `/portal/labs/review?project=`
- Lab review UI honors `?project=` filter; VERIFY_SETUP + FINAL_SETUP synced to **001–019**

## 2026-07-18 — Harden polish (mobile + notifications)

- Mobile bottom nav: Pathways + Events primary; Learn/Labs/Network under More
- Migration `017_lab_notification_deep_link.sql`; FINAL_SETUP 001–017
- Debrief Sample badges; Hero primary → `/discover`
- Portal search opportunity `:id` links; admin competitions empty guidance
- Mobile Playwright project; package:source regenerated

## 2026-07-17 — Phase 4 release governor

- `DEMO_GUIDE.md`, `KNOWN_LIMITATIONS.md`, synced release checklists
- Playwright CI `webServer.env` coerces non-https local `VITE_APP_URL` so e2e build succeeds
- Resource library external hrefs sanitized; `openPortalSearch` unit test
- Continuity: `.cursor/project_state.json`, `.cursor/execution_ledger.md`

## 2026-07-17 — Finisher harden (security packaging)

- Migration `016_content_reports_rpc_only.sql` + 015: no direct INSERT on `content_reports`
- `scripts/package-source.mjs` — secret-free source archive (`npm run package:source`)
- `sanitizeUrl` on Events/Opportunities/Studios render hrefs; Dashboard Search via `openPortalSearch`
- Report buttons on news, introductions, profiles; Admin report status honesty
- Docs + FINAL_SETUP synced to **001–016**

## 2026-07-17 — Finisher (source completion package)

- Migration `015_content_reports_chapter_tools.sql`: content reports + `my_chapter_leader_snapshot`
- Debriefed: newsletter archive + topic/region filters
- Report buttons; Admin Reports tab; chapter leadership panel
- `docs/VALIDATION_REPORT.md`; README refresh; `dist-packages/finance4all-finished-source.tgz`
- Validation: typecheck, 94 unit, build, release:static, 11 e2e / 2 skipped

## 2026-07-17 — Pass 4 (Harden / prove)

### QA / security docs
- `e2e/authenticated.spec.ts` — auth-surface tests + env-gated login journeys
- `docs/RLS_ROLE_MATRIX.md`, `supabase/VERIFY_RLS_MATRIX.sql`
- `docs/LAUNCH_CHECKLIST.md`
- Portal tour/setup-health Fast Refresh cleanup; PortalUI D-011

### App depth
- Admin Labs overview tab; Debrief version history when editing
- Certificate print/save view from Learn hub

### Validation
- typecheck, 94 unit, lint 0 errors / 8 warnings, release:static, 11 e2e passed / 2 skipped

## 2026-07-17 — Pass 3 (Portal depth & credibility)

### Schema
- Migration `014_portal_completeness.sql`: submission moderation, `member_certificates`, `chapter_leaders`, `competitions`, moderate/issue/appoint RPCs
- Regenerated `FINAL_SETUP.sql`; extended `VERIFY_SETUP.sql`

### App
- Admin Moderation + Competitions tabs; chapter leader appointment
- Learn hub: issue verified curriculum certificate
- Events: country/city filters, map legend/detail, competitions list
- Nav labels: Learn, Opportunities, Events & Chapters, Profile
- `public/sitemap.xml` + robots Sitemap
- Unit tests for moderation helpers (+4 → 92 total)

### Validation
- typecheck, 92 unit, build, release:static, 7 e2e — pass

### Docs
- FM-PORTAL-003/005/006/007 RESOLVED; Wave 2 DONE; P3 acceptance recorded

## 2026-07-17 — Pass 2 (Finance Debrief trustworthy CMS)

### Schema
- Migration `013_finance_debrief_editorial.sql`: `approved_sources`, editorial columns on `news_articles`, `news_article_versions`, `debrief_ai_generation_logs`
- RPCs: `publish_news_article`, `transition_news_article_status`, `record_news_article_version`, `queue_debrief_ai_generation`
- Trigger `enforce_news_article_publish_rules` (source required; AI requires generation log)
- Regenerated `FINAL_SETUP.sql`; extended `VERIFY_SETUP.sql`

### App
- `debriefPublish.ts` / `debriefAiAdapter.ts` + unit tests
- Admin: sources registry, draft-only create/update, AI queue, Publish/Archive
- Member Debrief: educational disclaimer + source attribution
- Weekly digest: `newsletter_include` + published/corrected filter
- Types/mappers/sanitize aligned; `.env.example` cleaned for release:static

### Validation
- typecheck, 88 unit, build, release:static, 7 e2e — pass

### Docs
- Memory/audit/queue/status updated; FM-DEBRIEF-* → RESOLVED (source); Wave 1 queue complete

## 2026-07-17 — Pass 1 (Audit & memory)

### Docs
- Added permanent memory set: PROJECT_MEMORY, AUDIT_MASTER, PRODUCT_SPEC, DATA_MODEL, SECURITY_REVIEW, ACCEPTANCE_CRITERIA, IMPLEMENTATION_QUEUE, OWNER_ACTIONS, DECISION_LOG, EXECUTION_STATUS, CURRENT_PASS_CONTEXT, LAST_KNOWN_GOOD_STATE, WORK_OWNERSHIP, CHANGELOG
- Refreshed ARCHITECTURE.md
- Root ops docs from prior session retained: DATABASE.md, SECURITY.md, TESTING.md, PROJECT_STATUS.md

### Code (low-risk / prior session absorbed)
- Landing composition + JSON-LD
- `database.ts` CMS/ops types
- Admin CMS seed control
- SetupBanner CMS table check
- ProtectedRoute unit test mocks

### Validation
- lint (0 errors), typecheck, 78 unit, build, release:static, 7 e2e — pass

## Earlier (pre-Pass-1 branch history)

See git log on `cursor/membership-security-supabase-fix` for portal hardening, migrations 001–012, liquid glass, security RPCs.
