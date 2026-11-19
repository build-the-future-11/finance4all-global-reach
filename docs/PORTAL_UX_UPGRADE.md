# Portal and discovery upgrade — 16 October 2026

## Routes and shared navigation

The canonical source remains `finance4all-global-reach`; the outer workspace is not its Git root. Public navigation now joins Home, Learn, Research, Finance Debriefed, Programs, Events, Global Chapters, About and Member Portal through one responsive header and footer. `PublicLayout` provides a skip link, theme-aware colors, mobile disclosure with Escape/focus return, page title/description, canonical URL and social metadata. Metadata is client-rendered in this existing SPA; a crawler without JavaScript still receives the common HTML shell. The sitemap contains all 16 research details, 22 program details and four approved guide addresses. It excludes member and unpublished content.

New public routes: `/research`, `/research/projects/:slug`, `/programs`, `/programs/:slug`, `/events`, `/events/:slug`, `/chapters`, `/about`, `/debriefed`, `/debriefed/:slug`. Existing `/learn/debriefs` aliases continue to work. Learn now provides a foundations-to-reading-to-research path. Research and program source inventories document status and publication boundaries.

The member sidebar adds Programs & Opportunities, Events & Calendar and Global Chapters alongside My Learning, My Research, Research & Labs, Community & Networking, Saved Content and Profile & Settings. Member program and event details and `/portal/chapters` share the underlying catalogs. The sidebar supports collapse, accessible icon labels, mobile focus containment, Escape dismissal and focus return. Account and public-site links are accessible in the shell. Existing authenticated routes and role guards remain authoritative.

## Useful private journeys

The dashboard shows saved reading, explicit reading positions, recent intake receipts, confirmed future sessions and existing application/project/learning activity. Unknown query data is not reported as a zero count. Failed event loading has a retry action. Program links show a useful next step without manufacturing an application result.

Debriefed saves use the existing account-scoped Auth metadata implementation. New explicit reading positions/completion use bounded, checked Auth metadata, not scroll telemetry. A write pins the verified account JWT and validates its response; data and cache keys are account-scoped. Concurrent same-account browser edits are last-write-wins. Existing database learning notes and records remain private under their existing RLS. The article inventory explains authorship, rights, source review and editorial restrictions.

Search combines approved public research, program, city and full guide text with published member content. Server publication and directory-consent filters precede bounded limits. Results use safe destinations; private draft content is not imported into the public search bundle. Backend failure remains visible even when static public matches can still be shown. Only the visible search trigger responds to the keyboard shortcut, avoiding duplicate dialogs from desktop/mobile shells.

## Explicit member-directory consent

Membership no longer implies directory consent. Migration `20261016094000_member_directory_consent.sql` adds `directory_visible=false` for existing and new profiles, with a deliberate Settings opt-in. Other ordinary members can read only opted-in profiles; owners and admins retain their permitted read scope. Existing safe column grants still exclude email, and Auth metadata is never a directory source. Consent can be revoked. Search applies visibility, collaboration and text filters before its 60-row result bound. This is a bounded search window, not a total membership count.

This schema change must be applied and certified before the frontend is promoted. The migration grants the new safe column while retaining role/email restrictions and existing write ownership. `supabase/tests/member_directory_consent.sql` verifies own hidden access, cross-member denial, opt-in visibility, revocation, email exclusion and anonymous denial in a rollback-only fixture. QueryClient clearing on sign-out/account switch remains in AuthContext.

## Editorial and operational maintenance

Existing publication review retains approval/revision fences. The admin event pane adds draft event/chapter editors. Public event listing requires explicit opt-in plus published event and chapter approval; an event metadata edit invalidates prior approval. Chapter status needs separate operating evidence. The safe anonymous RPC projects only approved event fields; it does not grant anonymous table reads. The restricted Issue 001 import is a local admin workflow and has not been submitted to a live database.

## Verification and release

See `RELEASE_EVIDENCE.md` for exact commands, result counts, screenshots and deployment state. Browser tests use synthetic fixtures for authenticated rendering and intercept their requests; they do not certify live production accounts. No product metric, chapter activation, event schedule, editorial approval or scientific result was created by the interface work. Official logo verification remains blocked as recorded in `BRAND_ASSET_VERIFICATION.md`.
