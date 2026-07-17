# Changelog

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
