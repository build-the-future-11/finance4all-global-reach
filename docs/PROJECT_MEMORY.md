# Project Memory (Canonical)

**Product names:** Public/codebase brand today = **Finance4All**. Product-line / Pass branding = **FinanceMeta**. Legal public name must be unified before launch (see DECISION_LOG D-001).  
**Repo:** `~/Downloads/finance4all-global-reach-main`  
**Branch:** `cursor/membership-security-supabase-fix`  
**Last updated:** 2026-07-17 (Pass 3 Wave 2)  
**Status:** Source Wave 2 portal completeness done; production blocked on owner schema/auth (OA-1 includes 013–014)

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
| Chapter leader | Appointed via admin; chapter visibility |
| Administrator | Publish, moderate, roles, inbox, ops |

## Architecture (summary)

- **Frontend:** Vite 5, React 18, TypeScript, React Router 6, TanStack Query, Tailwind, shadcn/Radix
- **Backend:** Supabase Auth, Postgres + RLS, Storage (avatars), RPCs, Edge Functions (`weekly-digest`, `delete-account`)
- **Host:** Vercel static SPA (`vercel.json` rewrites + CSP/HSTS)
- Trust boundary: browser is untrusted; RLS/RPC/Edge Functions enforce authz
- Debrief: source-bound publish; AI adapter queues only
- Pathways: submissions start `pending`; public feed shows `approved` (+ own/admin)

## Routes

### Public
`/`, `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/auth/callback`, `/privacy`, `/terms`  
SEO: `public/sitemap.xml`, `robots.txt` Sitemap directive

### Protected
`/onboarding`, `/portal/*`

### Portal nav (Pass 3 labels)
Dashboard, Debriefed, Meta Labs, **Opportunities**, **Events & Chapters**, Network, **Learn**, Resources, Saved, Activity, **Profile**, Admin

## Database

Migrations **001–014** (+ `FINAL_SETUP.sql` / `VERIFY_SETUP.sql`).  
013 Debrief editorial; **014** moderation, certificates, chapter leaders, competitions.

## Authentication / authorization

- Email/password + Google OAuth; callback `/auth/callback`
- Profile via `ensure_my_profile` / onboarding RPCs
- `ProtectedRoute`, `RoleGuard`
- Admin-only: Debrief publish, submission moderate, appoint leaders, manage competitions

## Integrations

- Supabase (required)
- Optional: Resend, Google OAuth, Substack
- Debrief AI adapter unconfigured until owner secrets (D-008)

## Environment variables

| Name | Where | Notes |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | Client / Vercel | `https://*.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Client / Vercel | Anon JWT only |
| `VITE_APP_URL` | Client / Vercel | Canonical HTTPS origin |
| `SUPABASE_SERVICE_ROLE_KEY` | Edge only | Never Vercel client |
| `DIGEST_CRON_SECRET`, `RESEND_API_KEY`, `SITE_URL` | Edge only | Digest |

## Working systems (source)

- Auth, portal shells, hybrid CMS education/resources
- Finance Debrief trustworthy editorial (013)
- **Pass 3:** studio/essay moderation, certificates, chapter leaders, competitions, map filters, nav alignment, sitemap
- Bookmarks, notifications, contact inbox, analytics/error RPCs
- typecheck / 92 unit / 7 e2e / release:static / build green

## Broken / incomplete systems

- **Live Supabase schema** until OA-1 (FINAL_SETUP with 013–014)
- Brand split Finance4All vs FinanceMeta (D-001)
- Labs not centralized in Admin (FM-PORTAL-004 DEFERRED)
- E2E lacks authenticated journeys (Pass 4)
- Live Debrief AI provider unconfigured
- Certificate “download PDF” not built — verification code + account record only

## Missing / remaining gaps (honest)

| Area | State |
| --- | --- |
| Authenticated e2e / live RLS proof | Pass 4 |
| Legal brand unify | Owner D-001 |
| Labs admin overview | DEFERRED |
| Chapter-leader self-serve dashboard / activity reports | Thin (leaders table + counts; no full analytics suite) |
| Event reminders / newsletter archives / Debrief collections | Not first-class beyond digest + news CMS |
| Youth-safety dedicated workflow | Partial via moderation + rate limits; no separate youth module |
| Impact metrics storytelling | Honest qualitative only (no fake counts) |

## Design constraints

- Preserve valuable portal UX; no shallow rewrites
- Honest copy; no fake metrics
- Educational-not-financial-advice framing on Debrief
- Accessible forms, skip link, focus states

## Security constraints

- No service role in browser
- Least privilege RLS
- Unsourced / AI-without-log cannot publish
- Pending submissions not publicly listed

## Frozen priorities

1. Owner completes Supabase schema + auth URLs (OA-1 includes 014)
2. ~~Pass 2 Debrief~~ DONE · ~~Pass 3 portal depth~~ DONE
3. Pass 4: authenticated e2e, RLS proof, launch checklist
4. Brand unify when D-001 decided

## Acceptance criteria

Pass 1–3 ACCEPTED in source (see `ACCEPTANCE_CRITERIA.md`). Live schema owner-blocked.

## Exact current status

Pass 3 **COMPLETE** for Wave 2. Ownership released. Next: Pass 4 queue 3.1.

## Next task (Pass 4)

**Authenticated Playwright journeys** (IMPLEMENTATION_QUEUE 3.1 / FM-BASE-004).
