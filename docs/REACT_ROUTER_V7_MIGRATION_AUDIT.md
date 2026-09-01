# React Router v7 migration audit

Date: 2026-09-01
Baseline: `4ad4bcdb551b4e6ec2e4c129b58ec640296508e1`
Tracking issue: #11

## Purpose

Bound the remaining React Router v6 → v7 security/compatibility migration before changing the direct dependency. This audit is repository inventory and migration planning only; it changes no routing, authentication, authorization, RLS, or dependency behavior.

## Current runtime and compatibility floor

- App dependency: `react-router-dom@^6.30.1`.
- React / React DOM: 18.3.1.
- Canonical CI runs Node 22.
- Router mode is declarative `<BrowserRouter><Routes><Route ... /></Routes></BrowserRouter>`; this repository does not use React Router framework adapters, loaders/actions, `RouterProvider`, or server route modules.
- The existing Node/React versions satisfy the documented v7 minimums (Node 20+, React 18+).

## Repository usage inventory

The default-branch code search found React Router usage in the following source surfaces.

### Router composition and route guards

- `src/components/AppRouter.tsx` — `BrowserRouter`, `Routes`, `Route`, `useLocation`; central public/auth/portal route composition.
- `src/components/portal/ProtectedRoute.tsx` — `Navigate`, `useLocation`; unauthenticated and onboarding redirects.
- `src/components/portal/RoleGuard.tsx` — `Navigate`; role-denial fallback.
- `src/layouts/PortalLayout.tsx` — portal-level navigation/location behavior.

### Authentication navigation

- `src/pages/auth/AuthCallback.tsx` — `useNavigate`.
- `src/pages/auth/Login.tsx` — `Link`, `Navigate`, `useLocation`, `useNavigate`.
- `src/pages/auth/Signup.tsx` — `Link`, `Navigate`, `useNavigate`.
- `src/pages/auth/Onboarding.tsx` — router navigation.
- `src/components/portal/AuthLayout.tsx` — `Link`.

### Shared navigation and public links

- `src/components/NavLink.tsx` — wrapper around `NavLink` and `NavLinkProps`.
- `src/components/Navbar.tsx` — `Link`.
- `src/components/Footer.tsx` — `Link`.
- `src/components/HeroSection.tsx` — router link/navigation.
- `src/components/ProjectsSection.tsx` — router link/navigation.
- `src/pages/NotFound.tsx` — `Link`, `useLocation`.

### Portal navigation surfaces

- `src/components/portal/MobileBottomNav.tsx` — `NavLink`.
- `src/components/portal/PortalSearch.tsx` — route navigation.
- `src/components/portal/NotificationsCenter.tsx` — route navigation.
- `src/pages/portal/Dashboard.tsx` — route navigation.
- `src/pages/portal/Saved.tsx` — `Link`.
- `src/pages/portal/Settings.tsx` — route navigation.
- `src/pages/portal/network/Networking.tsx` — route navigation.
- `src/pages/portal/network/MemberProfile.tsx` — route navigation.
- `src/pages/portal/debriefed/DebriefedHub.tsx` — route navigation.
- `src/pages/portal/debriefed/DebriefedExplainers.tsx` — route navigation.
- `src/pages/portal/labs/MetaLabs.tsx` — route navigation.

## v7 changes that materially affect this repository

Official React Router v7 release guidance says v7 collapses `react-router-dom` into `react-router`, while continuing to publish `react-router-dom` in v7 as a compatibility re-export. For this declarative application, that means the package-major upgrade does **not** require an immediate import rewrite to land safely; import migration can be a separate cleanup after behavior is verified.

The v7 minimum runtime versions are Node 20 and React/React DOM 18. This repository already uses React 18.3.1 and Node 22 in canonical CI, so no runtime-major prerequisite is required.

The documented v7 removed APIs are `json`, `defer`, `unstable_composeUploadHandlers`, `unstable_createMemoryUploadHandler`, and `unstable_parseMultipartFormData`. Repository search shows no application usage of those APIs, so there is no identified removed-API blocker.

React Router's June 2026 v7.18.0 CSRF reverse-proxy behavior applies primarily to framework/server adapters such as `@react-router/serve` or `@react-router/express`. This repository uses client-side declarative routing and does not currently use those adapters, so that adapter-specific change is not treated as an application blocker. Production auth/authorization remains Supabase-driven and must still be regression-tested independently.

## Behavior contracts that must stay green

PR #12 added canonical tests that freeze the security-sensitive navigation contract before any major-version change:

1. unauthenticated protected-route access redirects to `/login` and preserves the attempted path;
2. authenticated users still requiring onboarding redirect to `/onboarding`;
3. authenticated/onboarded users render protected content;
4. unauthorized roles cannot render privileged content and are redirected to the labs fallback;
5. approved admin roles render privileged content.

Any v7 branch must additionally keep the full repository typecheck, test, build, and high/critical production dependency audit green on the same exact SHA.

## Safe migration sequence

1. Create an isolated dependency-migration branch from a green `main`.
2. Upgrade `react-router-dom` to the audited v7 target without `npm audit fix --force` and without changing auth/RLS semantics.
3. Keep existing `react-router-dom` imports for the first compatibility commit; v7 intentionally re-exports from `react-router`.
4. Run `npm ci`, `npm audit --omit=dev --audit-level=high`, `npm run typecheck`, `npm test`, and `npm run build` on one exact head.
5. Exercise login → protected destination restoration, onboarding redirect, role denial, admin access, auth callback, unknown route, and representative portal links.
6. Record the resulting production audit. If moderate findings remain, keep them visible rather than suppressing them.
7. Only after the package upgrade is green should a separate cleanup migrate imports from `react-router-dom` to `react-router` if desired.

## Explicit non-goals

- no `npm audit fix --force`;
- no auth bypass or redirect weakening;
- no conversion to Framework/Data mode as part of the security update;
- no Supabase policy or role-semantic change;
- no claim that repository CI proves production Supabase authorization;
- no suppression/allowlisting of remaining advisories solely to make CI green.

## Exit criteria for issue #11

The inventory portion of #11 is satisfied by this document plus the merged #12 regression suite. The issue itself remains open until the actual v7 dependency migration passes exact-head typecheck/tests/build/audit and the post-migration production audit is recorded truthfully.
