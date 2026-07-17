# Project Memory (Canonical)

**Product names:** Public/codebase brand today = **Finance4All**. Product-line / Pass branding = **FinanceMeta**. Legal public name must be unified before launch (see DECISION_LOG D-001).  
**Repo:** `~/Downloads/finance4all-global-reach-main`  
**Branch:** `cursor/membership-security-supabase-fix`  
**Last updated:** 2026-07-17 (Pass 1)  
**Status:** Source-ready; production blocked on owner credential/schema steps

---

## Mission

A global financial-literacy nonprofit platform: public institution site + authenticated member portal for learning, Finance Debrief / Debriefed reading, research (Meta Labs), opportunities (Pathways), chapters/events, resources, member discovery, notifications, bookmarks, and administration.

Not investment advice. Not a placement guarantee. Claims require admin-published evidence.

## Users

| Persona | Needs |
| --- | --- |
| Visitor | Understand mission; join; contact; legal |
| Member | Learn, read, apply, RSVP, save, connect |
| Lead researcher | Own lab projects; review applications |
| Administrator | Publish, moderate, roles, inbox, ops |

## Architecture (summary)

- **Frontend:** Vite 5, React 18, TypeScript, React Router 6, TanStack Query, Tailwind, shadcn/Radix
- **Backend:** Supabase Auth, Postgres + RLS, Storage (avatars), RPCs, Edge Functions (`weekly-digest`, `delete-account`)
- **Host:** Vercel static SPA (`vercel.json` rewrites + CSP/HSTS)
- Trust boundary: browser is untrusted; RLS/RPC/Edge Functions enforce authz

## Routes

### Public
`/`, `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/auth/callback`, `/privacy`, `/terms`

### Protected
`/onboarding`, `/portal/*`

### Portal (key)
Dashboard, Debriefed (+ explainers), Meta Labs (+ review), Pathways (opportunities/studios/essays), Events, Network (+ profile), Education, Resources, Saved, Activity, Settings, Admin

## Database

Migrations **001–012** (+ `FINAL_SETUP.sql` / `VERIFY_SETUP.sql`).  
Roles: `member` | `lead_researcher` | `admin`.  
CMS tables from 008; privacy/write boundaries 009–011; ops 012.  
Types: `src/types/database.ts` (Pass 1 aligned with 008 CMS tables).

## Authentication / authorization

- Email/password + Google OAuth; callback `/auth/callback`
- Profile via `ensure_my_profile` / onboarding RPCs
- `ProtectedRoute` (session + profile + onboarding), `RoleGuard` (admin / lab review)
- Members cannot self-escalate role/email (RPC write boundary)

## Integrations

- Supabase (required)
- Optional: Resend (digest), Google OAuth, Substack embed
- NewsAPI optional (prefer curated DB headlines)

## Environment variables

| Name | Where | Notes |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | Client / Vercel | `https://*.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Client / Vercel | Anon JWT only |
| `VITE_APP_URL` | Client / Vercel | Canonical HTTPS origin |
| `SUPABASE_SERVICE_ROLE_KEY` | Edge only | Never Vercel client |
| `DIGEST_CRON_SECRET`, `RESEND_API_KEY`, `SITE_URL` | Edge only | Digest |

## Working systems (source)

- Auth UI lifecycle, portal shells, Debriefed CRUD (admin news), labs/pathways/events/network/education/resources hybrid CMS
- Bookmarks, notifications, contact inbox, analytics/error RPCs
- Lint/typecheck/unit/e2e/release:static/build all green on Pass 1 baseline
- Production deploy path exists (Vercel); env can be set via CLI

## Broken / incomplete systems

- **Live Supabase schema** for current project may be incomplete (owner must run `FINAL_SETUP.sql`) — see OWNER_ACTIONS
- Finance Debrief **trustworthy editorial** model not implemented (no approved-source registry, AI logs, version history, scheduling) — AUDIT FM-DEBRIEF-*
- Admin lacks studio/essay moderation UI; labs not centralized in Admin
- E2E lacks authenticated journeys
- Brand split Finance4All vs FinanceMeta
- Certificates / competitions / global map / chapter leadership as first-class products: largely **missing or thin** vs Pass product brief

## Missing systems (product brief vs code)

| Area | State |
| --- | --- |
| Approved-source registry + AI-assisted Debrief pipeline | Missing |
| Article version history / corrections / editorial assignment | Missing |
| Certificates | Missing / not first-class |
| Global chapter map (rich) | Partial (chapters + coords exist; map UX thin) |
| Competitions as distinct module | Thin / folded into events-opportunities |
| Newsletter editorial inclusion workflow | Partial (digest prefs + edge cron; no article inclusion flags beyond digest) |

## Design constraints

- Preserve valuable existing portal UX; no shallow rewrites
- Honest copy; no fake metrics
- Educational-not-financial-advice framing on Debrief
- Accessible forms, skip link, focus states

## Security constraints

- No service role in browser
- Least privilege RLS
- Sanitized redirects, rate limits, honeypot
- Production build fails without valid VITE_* 

## Frozen priorities (Pass 1 freeze)

1. Owner completes Supabase schema + auth URLs on live project
2. Pass 2: Finance Debrief trustworthy editorial schema + admin workflows
3. Pass 3: Portal completeness (moderation, certificates, map polish, nav alignment)
4. Pass 4: Hardening, authenticated e2e, launch checklist closeout

## Acceptance criteria (Pass 1)

See `docs/ACCEPTANCE_CRITERIA.md` § Pass 1. Met when memory set exists, audit IDs frozen, baseline green, queue ordered, owner actions listed, next Pass 2 task explicit.

## Exact current status

Pass 1 **COMPLETE** for documentation + baseline validation. Uncommitted code improvements from prior session absorbed into memory. Live production schema application remains **OWNER-BLOCKED**.

## Next task (Pass 2)

**Implement Finance Debrief trustworthy editorial foundation:** migration for approved sources, article editorial metadata (source URL/date, topic, region, importance, status draft→review→scheduled→published→corrected/archived), AI generation logs, admin UI for draft/review/publish with hard block on unsourced auto-publish; extend types + RLS; unit tests for publish guards.
