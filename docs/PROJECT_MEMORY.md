# Project Memory (Canonical)

**Product names:** Public/codebase brand today = **Finance4All**. Product-line / Pass branding = **FinanceMeta**. Legal public name must be unified before launch (see DECISION_LOG D-001).  
**Repo:** `~/Downloads/finance4all-global-reach-main`  
**Branch:** `cursor/membership-security-supabase-fix`  
**Last updated:** 2026-07-17 (Pass 2 Wave 1)  
**Status:** Source Wave 1 Debrief complete; production blocked on owner credential/schema steps (OA-1 includes migration 013)

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
- Debrief: source-bound publish via RPC/trigger; AI adapter queues drafts only (never auto-publish)

## Routes

### Public
`/`, `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/auth/callback`, `/privacy`, `/terms`

### Protected
`/onboarding`, `/portal/*`

### Portal (key)
Dashboard, Debriefed (+ explainers), Meta Labs (+ review), Pathways (opportunities/studios/essays), Events, Network (+ profile), Education, Resources, Saved, Activity, Settings, Admin

## Database

Migrations **001–013** (+ `FINAL_SETUP.sql` / `VERIFY_SETUP.sql`).  
Roles: `member` | `lead_researcher` | `admin`.  
CMS tables from 008; privacy/write boundaries 009–011; ops 012; **Debrief editorial 013**.  
Types: `src/types/database.ts` aligned through 013.

## Authentication / authorization

- Email/password + Google OAuth; callback `/auth/callback`
- Profile via `ensure_my_profile` / onboarding RPCs
- `ProtectedRoute` (session + profile + onboarding), `RoleGuard` (admin / lab review)
- Members cannot self-escalate role/email (RPC write boundary)
- Debrief publish/transition: admin-only RPCs + DB trigger

## Integrations

- Supabase (required)
- Optional: Resend (digest), Google OAuth, Substack embed
- NewsAPI optional (prefer curated DB headlines)
- Debrief AI: adapter + queue/logs; **live provider unconfigured** until owner secrets (D-008)

## Environment variables

| Name | Where | Notes |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | Client / Vercel | `https://*.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Client / Vercel | Anon JWT only |
| `VITE_APP_URL` | Client / Vercel | Canonical HTTPS origin |
| `SUPABASE_SERVICE_ROLE_KEY` | Edge only | Never Vercel client |
| `DIGEST_CRON_SECRET`, `RESEND_API_KEY`, `SITE_URL` | Edge only | Digest |

## Working systems (source)

- Auth UI lifecycle, portal shells, labs/pathways/events/network/education/resources hybrid CMS
- **Finance Debrief trustworthy editorial:** approved sources, status machine, versions, AI logs, publish guards, admin UI, member disclaimer, digest `newsletter_include`
- Bookmarks, notifications, contact inbox, analytics/error RPCs
- typecheck / 88 unit / e2e / release:static / build green on Pass 2 baseline
- Production deploy path exists (Vercel); env can be set via CLI

## Broken / incomplete systems

- **Live Supabase schema** for current project may be incomplete (owner must run `FINAL_SETUP.sql` including 013) — see OWNER_ACTIONS
- Admin lacks studio/essay moderation UI; labs not centralized in Admin
- E2E lacks authenticated journeys
- Brand split Finance4All vs FinanceMeta
- Certificates / competitions / global map / chapter leadership as first-class products: largely **missing or thin** vs Pass product brief
- Live Debrief AI provider credentials not configured (adapter + queue ready)

## Missing systems (product brief vs code)

| Area | State |
| --- | --- |
| Approved-source registry + AI-assisted Debrief pipeline | **Source done (013)**; live OA-1; AI provider unconfigured |
| Article version history / corrections / editorial assignment | **Source done (013)** |
| Certificates | Missing / not first-class |
| Global chapter map (rich) | Partial (chapters + coords exist; map UX thin) |
| Competitions as distinct module | Thin / folded into events-opportunities |
| Newsletter editorial inclusion workflow | **Source done** (`newsletter_include` + digest filter) |

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
- Unsourced / AI-without-log content cannot publish (server trigger + RPC)

## Frozen priorities

1. Owner completes Supabase schema + auth URLs on live project (OA-1 includes 013)
2. ~~Pass 2: Finance Debrief trustworthy editorial~~ **DONE (source)**
3. Pass 3: Portal completeness (moderation, certificates, map polish, nav alignment)
4. Pass 4: Hardening, authenticated e2e, launch checklist closeout

## Acceptance criteria

Pass 1 ACCEPTED. Pass 2 Wave 1 ACCEPTED (see `ACCEPTANCE_CRITERIA.md`). Live schema remains owner-blocked.

## Exact current status

Pass 2 **COMPLETE** for Wave 1 Finance Debrief vertical slice in source. Ownership released. Next: Pass 3 queue 2.1 (studio/essay moderation). Live production schema application remains **OWNER-BLOCKED**.

## Next task (Pass 3)

**Admin moderation for studios/essays** (IMPLEMENTATION_QUEUE 2.1 / FM-PORTAL-003).
