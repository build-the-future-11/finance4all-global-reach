# Architecture

Status: source-of-truth architecture summary for production testing.

## Stack

- Frontend: Vite, React, TypeScript, React Router, TanStack Query, Tailwind,
  Radix/shadcn UI primitives.
- Backend/data: Supabase Auth, Postgres, Row Level Security, Storage, RPCs,
  triggers, and Edge Functions.
- Testing: Vitest, Testing Library, Playwright, TypeScript, ESLint, npm audit.
- Deployment: static Vite build on Vercel or equivalent static hosting with
  Supabase as the production backend.

## Application Boundaries

The browser renders public and member UI, but it is not trusted for permission
decisions. All critical ownership, role, publication, deadline, capacity,
duplicate, upload, and lifecycle checks belong in Supabase RLS, triggers, RPCs,
or JWT-protected Edge Functions.

Public pages may render without a session. Portal pages require an authenticated
session. Administrator pages require both route-level guards for experience and
database/server enforcement for security.

## Data Layer

Primary tables and capabilities include:

- `profiles`: member identity, onboarding state, public profile fields, role.
- Content: Debrief/news, explainer cards, courses, lessons, modules, resources.
- Member state: bookmarks, lesson progress, notifications, preferences, RSVP or
  registration records, opportunity interests, applications.
- Operations: contact submissions, analytics events, client error events,
  digest send logs.
- Administration: publishable content records, member management views, project
  review/application workflows.

Migrations `001` through `012` define the production schema baseline. Production
must not skip intermediate migrations.

## Security Model

- Supabase Auth issues sessions.
- `ensure_my_profile` and onboarding functions provide idempotent profile
  lifecycle behavior.
- RLS policies constrain member-owned data.
- Triggers enforce application/registration deadlines, duplicate prevention, and
  status transitions.
- Admin-only content writes and operational reads require admin role checks.
- Edge Functions perform operations that require service-role capabilities,
  including account deletion and digest delivery.
- Client analytics and error reporting are allowlisted and sanitized before
  storage.

## UI Architecture

The product has three main UI shells:

- Public marketing/information shell for discovery and legal routes.
- Auth shell for sign-in, sign-up, password recovery, and callbacks.
- Portal shell for dashboard, content, learning, opportunities, chapters,
  settings, notifications, and admin.

Shared components should remain functional and modest: buttons, forms, dialogs,
tables, badges, layout primitives, loading states, empty states, denied states,
and confirmation patterns.

## Production Dependencies

The codebase is not enough for launch without:

- Production Supabase project with migrations and storage policies applied.
- Supabase Auth redirect URLs and providers configured.
- Hosting environment variables and `VITE_APP_URL`.
- Edge Function deployment and secrets.
- Email/sender verification for digest and account flows.
- Real public content and legal/privacy approval.
- Monitoring and backup ownership.
