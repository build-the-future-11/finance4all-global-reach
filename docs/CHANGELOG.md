# Changelog

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
