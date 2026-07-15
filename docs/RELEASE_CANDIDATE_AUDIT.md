# Release Candidate Audit

Status: **Production code baseline**

## Passed evidence

- Public landing page describes the portal through implemented member capabilities and contains no hard-coded reach, partner, mentor, placement, or outcome claims.
- Public navigation has working anchors, a keyboard-accessible mobile menu, a skip link, privacy and terms routes, and no horizontal overflow at a 390px viewport.
- Unauthenticated requests to `/portal` redirect to `/login`.
- Authentication and profile lifecycle use `ensure_my_profile` and `complete_profile_onboarding` server functions. Onboarding completion is stored once by the database function.
- Draft Finance Debrief articles are restricted to administrators; published articles are available to members through RLS.
- Research applications are validated for ownership, project status, deadline, motivation length, and reviewer authorization by database policy and trigger.
- Event registration is validated by the database for ownership, timing, status, and capacity. The member UI reflects known registration windows, and the administrator editor exposes those fields.
- Contact form submission is validated and rate limited through the server-side `submit_contact_submission` function.
- Avatar uploads enforce supported image signatures and a 2 MB limit before storage upload; storage policy constrains writes to the signed-in member's folder.
- Administrator routes are guarded in the client and write access is enforced by RLS.
- Member-directory reads use a fixed-column database view. Members cannot query another member's account email or onboarding state; administrators retain their controlled management view.
- Members update profiles and avatar references only through authenticated, server-validated functions. Direct member profile updates are removed, preserving role, email, and onboarding lifecycle fields from browser writes.
- Auth redirects preserve the requested path, query string, and hash so deep links resume after sign-in.
- Production configuration rejects builds without `VITE_APP_URL`; Vercel config supplies security headers, SPA rewrites, CSP, HSTS, and frame protection.
- Client analytics records only allowlisted product event names and bounded non-identifying scalar properties through the authenticated `track_product_event` RPC.
- Client error reporting stores sanitized authenticated reports through the `report_client_error` RPC; stack traces and free-form user content are not transmitted.
- Account export is available from member settings, and account deletion is implemented through a JWT-protected Edge Function with sole-admin protection.
- Weekly digest delivery sends only published current-week Finance Debrief articles, reserves one member/week log row before email delivery, and exposes delivery status in the Admin System tab.
- The Admin System tab now surfaces product event counts, recent client error reports, and weekly digest delivery logs for production operations.

## Automated verification

- `npm run test`: 19 test files and 78 tests passed.
- `npm run lint`: passed with 11 existing Fast Refresh advisory warnings and no errors.
- `npx tsc --noEmit`: passed.
- `VITE_APP_URL=https://finance4all.example.org npm run build`: passed.
- `npm run test:e2e`: 7 Playwright tests passed after the local browser sandbox permission was granted.
- `npm audit --omit=dev --audit-level=high`: passed with 0 vulnerabilities.

## Browser verification

- Desktop landing view checked at 1440 x 900.
- Mobile landing view checked at 390 x 844, including the menu interaction.
- Public routes, signup honeypot visibility, and protected-route redirect checked locally with no browser console errors.

## External release gate

Complete every item in `docs/LAUNCH_CHECKLIST.md` before public launch. These items require production Supabase, hosting, mail, domain, content, and legal authority; they cannot be safely completed from this repository alone.
