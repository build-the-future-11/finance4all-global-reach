# Audit Master

Stable issue register for FinanceMeta / Finance4All.  
Statuses: `UNRESOLVED` | `PARTIAL` | `RESOLVED` | `INVALIDATED` | `DEFERRED` | `BLOCKED`

**Last updated:** 2026-07-17 (Pass 1)

---

## FM-BASE — Build / QA

### FM-BASE-001 — Fast Refresh lint warnings
- **Severity:** Low
- **Files:** `src/contexts/AuthContext.tsx`, `src/components/ui/*`, portal shared exports
- **Impact:** Noise in CI lint; does not fail build
- **Root cause:** Files export hooks/constants alongside components
- **Fix:** Split exports or suppress intentionally for shadcn patterns
- **Validation:** `npm run lint` → 0 errors (warnings OK)
- **Status:** DEFERRED

### FM-BASE-002 — ProtectedRoute tests missing profile
- **Severity:** Medium
- **Files:** `src/components/portal/ProtectedRoute.test.tsx`, `ProtectedRoute.tsx`
- **Impact:** Unit test failures
- **Root cause:** Component requires `profile` after auth; mocks omitted it
- **Fix:** Mock `profile` in onboarding/authenticated cases
- **Validation:** `npm test`
- **Status:** RESOLVED (Pass 1 / prior session)

### FM-BASE-003 — Incomplete TypeScript types for CMS tables
- **Severity:** Medium
- **Files:** `src/types/database.ts`, migration `008_platform_cms.sql`
- **Impact:** Weak typing for education/resources/testimonials
- **Root cause:** Types lagged migrations
- **Fix:** Add table definitions
- **Validation:** `npm run typecheck`
- **Status:** RESOLVED

### FM-BASE-004 — Authenticated E2E coverage missing
- **Severity:** Medium
- **Files:** `e2e/*`
- **Impact:** Regressions in auth/portal CRUD uncaught in CI
- **Root cause:** Suite limited to smoke/security
- **Fix:** Staging credentials + Playwright auth fixtures (Pass 4)
- **Validation:** New e2e green in CI with secrets
- **Status:** DEFERRED

---

## FM-PUBLIC — Public site

### FM-PUBLIC-001 — Landing sections orphaned
- **Severity:** Medium
- **Files:** `src/pages/Index.tsx`, `src/components/landing/*`
- **Impact:** Built sections unused; weak public story
- **Root cause:** Simplified Index omitted wired sections
- **Fix:** Compose Origin/Ecosystem/Impact/Resources/Testimonials/CTA
- **Validation:** Visual + e2e landing load
- **Status:** RESOLVED

### FM-PUBLIC-002 — Brand split Finance4All vs FinanceMeta
- **Severity:** Medium
- **Files:** UI copy, `index.html`, docs
- **Impact:** Inconsistent product identity
- **Root cause:** Product rename requested; codebase brand retained
- **Fix:** Owner legal decision then systematic rename (Pass 3+)
- **Validation:** Copy audit
- **Status:** BLOCKED (owner naming decision)

### FM-PUBLIC-003 — Social OG image may be relative
- **Severity:** Low
- **Files:** `index.html`
- **Impact:** Weak social previews if absolute URL required
- **Root cause:** `og:image` used relative `/og-image.svg`
- **Fix:** Absolute production URLs for `og:url` / `og:image` / Twitter image (Pass 1)
- **Validation:** View page source; Open Graph debugger
- **Status:** RESOLVED

---

## FM-AUTH — Auth / identity

### FM-AUTH-001 — Live Auth redirect URLs
- **Severity:** High
- **Files:** Supabase dashboard (not repo)
- **Impact:** OAuth/password reset fail on production
- **Root cause:** External configuration
- **Fix:** Site URL + redirect allowlist
- **Validation:** Google + email reset on prod URL
- **Status:** BLOCKED

### FM-AUTH-002 — Profile RPC migrations on live DB
- **Severity:** High
- **Files:** migrations 009–011, live project
- **Impact:** “Profile unavailable” / incomplete onboarding
- **Root cause:** Target Supabase project may lack full schema
- **Fix:** Run `FINAL_SETUP.sql` + `VERIFY_SETUP.sql`
- **Validation:** VERIFY all `ok=true`; signup→onboarding→portal
- **Status:** BLOCKED

---

## FM-PORTAL — Member portal

### FM-PORTAL-001 — CMS seed unwired in Admin
- **Severity:** Medium
- **Files:** `src/pages/portal/Admin.tsx`, `useAdmin.ts`
- **Impact:** Education/resources stuck on static fallbacks
- **Root cause:** Hooks existed without UI
- **Fix:** System tab Seed CMS button
- **Validation:** Admin seed → modules readable from DB
- **Status:** RESOLVED

### FM-PORTAL-002 — SetupBanner incomplete health checks
- **Severity:** Low
- **Files:** `SetupBanner.tsx`
- **Impact:** Admins miss CMS migration gaps
- **Root cause:** Only checked 4 tables
- **Fix:** Include `education_modules`
- **Validation:** Missing 008 → banner for admin
- **Status:** RESOLVED

### FM-PORTAL-003 — Admin studio/essay moderation missing
- **Severity:** Medium
- **Files:** `Admin.tsx`, pathways pages, `014_portal_completeness.sql`
- **Impact:** Member submissions lack admin workflow
- **Root cause:** Scope never built
- **Fix:** Status columns + moderate RPCs + Admin Moderation tab
- **Validation:** Admin can list/moderate submissions; pending hidden from public feed
- **Status:** RESOLVED (source); live pending OA-1

### FM-PORTAL-004 — Labs not in Admin console
- **Severity:** Low
- **Files:** `MetaLabs.tsx`, `Admin.tsx`
- **Impact:** Split ownership UX
- **Root cause:** Intentional lead-researcher portal create
- **Fix:** Optional admin overview (Pass 3)
- **Validation:** Admin can list all projects
- **Status:** DEFERRED (D-005)

### FM-PORTAL-005 — Certificates missing
- **Severity:** Medium
- **Files:** education completion UX, `member_certificates`
- **Impact:** Spec asks certificates; only local celebration
- **Root cause:** Not implemented
- **Fix:** `issue_my_curriculum_certificate` + Education hub issue UI
- **Validation:** Complete curriculum → certificate row with verification code
- **Status:** RESOLVED (source); live pending OA-1

### FM-PORTAL-006 — Competitions / chapter leadership thin
- **Severity:** Medium
- **Files:** events, chapters schema, Admin competitions/leaders
- **Impact:** Spec modules incomplete
- **Root cause:** Folded into chapters/events without leadership roles
- **Fix:** `chapter_leaders` + `competitions` tables + Admin/member UI
- **Validation:** Appoint leader; open competition visible on Events
- **Status:** RESOLVED (source); live pending OA-1

### FM-PORTAL-007 — Global map experience thin
- **Severity:** Low
- **Files:** `ChapterMap.tsx`, `EventsChapters.tsx`
- **Impact:** Lat/long exist; map visualization weak/absent
- **Fix:** Country/city filters, legend, selected chapter panel, a11y labels
- **Validation:** Chapters render on map with filters
- **Status:** RESOLVED

---

## FM-DEBRIEF — Finance Debrief trustworthiness

### FM-DEBRIEF-001 — No approved-source registry
- **Severity:** High
- **Files:** `013_finance_debrief_editorial.sql`, Admin sources UI
- **Impact:** Cannot enforce source-bound publishing
- **Root cause:** `news_articles` only had optional `source_url`
- **Fix:** `approved_sources` table + publish trigger/RPC require `source_id`
- **Validation:** Unit tests + VERIFY_SETUP; live after OA-1
- **Status:** RESOLVED (source); live pending OA-1

### FM-DEBRIEF-002 — No editorial workflow states
- **Severity:** High
- **Files:** `news_articles`, Admin news tab, `transition_news_article_status`
- **Impact:** Only `is_published` boolean — no draft/review/schedule/correct
- **Fix:** Status enum + admin transitions; create/update stay draft
- **Validation:** Drafts excluded from member feed queries
- **Status:** RESOLVED (source); live pending OA-1

### FM-DEBRIEF-003 — No AI generation logs / auto-publish block
- **Severity:** High
- **Files:** `debrief_ai_generation_logs`, publish RPC/trigger, `debriefAiAdapter.ts`
- **Impact:** Spec forbids unsourced AI auto-publish
- **Fix:** Queue/log + trigger requires log when `ai_assisted`; no auto-publish path
- **Validation:** `debriefPublish.test.ts`; adapter marks unconfigured without credentials
- **Status:** RESOLVED (source); live AI provider still unconfigured (owner)

### FM-DEBRIEF-004 — No version history / corrections
- **Severity:** Medium
- **Files:** `news_article_versions`, `record_news_article_version`
- **Impact:** Cannot correct published articles with audit trail
- **Fix:** Version table + RPC on post-publish edits / correct transitions
- **Validation:** VERIFY_SETUP; admin correct/archive flows
- **Status:** RESOLVED (source); live pending OA-1

### FM-DEBRIEF-005 — Metadata gaps (topic/region/importance/schedule)
- **Severity:** Medium
- **Files:** `news_articles`, Admin form, weekly-digest
- **Impact:** Weak editorial ops and newsletter selection
- **Fix:** Columns + admin form; digest uses `newsletter_include`
- **Validation:** Admin form fields; digest query filter
- **Status:** RESOLVED (source); live pending OA-1

### FM-DEBRIEF-006 — Educational disclaimer not structured
- **Severity:** Low
- **Files:** `DebriefedHub.tsx`
- **Impact:** Framing inconsistent
- **Fix:** Structured disclaimer + source attribution on member Debrief views
- **Validation:** Visible on Debrief hub article presentation
- **Status:** RESOLVED

---

## FM-DATA — Database / RLS

### FM-DATA-001 — Live project schema incomplete
- **Severity:** Critical
- **Files:** live Supabase `xwlrzgfuhfbckgvcmyoq` (observed earlier)
- **Impact:** Portal features fail at runtime
- **Root cause:** Migrations not fully applied on current project
- **Fix:** Owner runs `FINAL_SETUP.sql` / `VERIFY_SETUP.sql`
- **Validation:** VERIFY all ok; REST tables exist under RLS
- **Status:** BLOCKED

### FM-DATA-002 — Seed.sql unsafe for public launch
- **Severity:** Medium
- **Files:** `supabase/seed.sql`
- **Impact:** Demo content in production
- **Fix:** Owner content review; do not ship unverified seed
- **Validation:** Production content audit
- **Status:** BLOCKED

---

## FM-SEC — Security

### FM-SEC-001 — Live RLS proof outstanding
- **Severity:** High
- **Files:** live policies
- **Impact:** Source RLS unproven against deployed DB
- **Fix:** Role matrix tests on staging (Pass 4 + owner)
- **Validation:** Anon/member/lead/admin matrix
- **Status:** BLOCKED

### FM-SEC-002 — Edge function secrets
- **Severity:** High
- **Files:** Supabase secrets
- **Impact:** Digest/delete-account non-functional or insecure if mis-set
- **Fix:** Deploy functions + secrets (owner)
- **Validation:** Authenticated delete; cron digest 401 without secret
- **Status:** BLOCKED

---

## FM-OPS — Deploy / ops

### FM-OPS-001 — Vercel VITE_* must match live Supabase
- **Severity:** High
- **Files:** Vercel env
- **Impact:** Wrong backend / build fail
- **Fix:** Keep env synced; redeploy after change
- **Validation:** Prod login not “Supabase not connected”
- **Status:** PARTIAL (configured for project; schema still incomplete)

### FM-OPS-002 — Weekly digest cron
- **Severity:** Low
- **Files:** edge + external cron
- **Impact:** Newsletter not automated
- **Fix:** Owner schedules cron with secret header
- **Validation:** Digest log rows
- **Status:** BLOCKED
