# IYERN controlled-launch review

Implemented locally in `build-the-future-11/finance4all-global-reach`. No deployment, push, public intake activation, database change, or external message was performed.

## Routes

- `/iyern`: complete research and publishing portal.
- `/iyern/journal`, `/iyern/forum`, `/iyern/fellowship`, `/iyern/challenge`: directly addressable initiative sections in the same portal.
- `/iyern/articles/:slug`: authorized article template; unknown/unreleased articles show an unavailable state.
- `/`: existing homepage now links to the integrated portal from its navigation, journal feature, and footer.

## Implementation

The portal reuses Finance4All branding, theme toggle, document-title hook, React Router, fonts, colors, and external-URL validation. Its lazy-loaded page adds no dependencies. Responsive styles cover small phones, tablets, and desktops. Semantic sections, labeled controls, keyboard focus styling, a skip link, URL-backed filters, and live result counts support accessibility. Route-specific client-side metadata and the sitemap cover discoverability; social crawlers that do not execute JavaScript still require the site's future prerendering solution.

The journal displays the planned December 1, 2026 issue, academic scope, preparatory author guidance, proposed review/ethics process, an unannounced editorial board, and an empty archive. The forum offers four category filters and title/author/keyword search. Publication previews and article pages carry authors, abstracts, date, version, status, and optional HTTPS manuscript/code/data links.

The public catalog is intentionally empty and separate from private submissions. Rendering requires consent, rights, confidentiality clearance, moderation, publication authorization, and completed review for journal articles. These source-level checks are defense in depth, not a replacement for server-side access controls. Never copy confidential submissions into a frontend bundle, even with flags set false.

Fellowship applications, challenge interest registration, journal intake, and preprint intake have disabled CTAs with explicit pending explanations. The reusable CTA accepts an approved HTTPS form URL later. YEL collaboration is explicitly proposed, not confirmed.

## Files changed

- `src/pages/IYERN.tsx`
- `src/styles/iyern.css`
- `src/content/iyern.ts`
- `src/components/iyern/ApplicationCTA.tsx`
- `src/components/iyern/PublicationPreview.tsx`
- `src/components/AppRouter.tsx`
- `src/pages/Index.tsx`
- `public/sitemap.xml`
- `src/test/iyern.test.tsx`
- `src/test/portfolio-link.test.ts`
- `e2e/iyern.spec.ts`
- This review record.

Pre-existing editorial changes and evidence were preserved.

## Operational versus pending

Operational in source: landing and initiative routes, homepage navigation, category selection, search, empty states, safe article templates, metadata, theme support, and publication visibility checks.

Pending: public research content, confirmed editorial appointments, final author/review policies, verified submission integrations, fellowship application form, competition registration/eligibility/timeline/rules/judges, and any YEL agreement. No manuscript upload service or automatic publication path was created.

## Release blockers

1. Complete full test, typecheck, production build, and browser validation with adequate memory. Browser coverage was added for 320/768/1440px layouts, axe accessibility, direct routes, URL filter persistence, homepage linkage, and the existing learning route.
2. Review content, editorial process, and final author guidelines with the responsible organizers.
3. Before enabling intake, verify consent and rights, confidential-data handling, moderation ownership, private storage, retention, authorization, and server-side access controls for the approved integration. The sibling IYERN app's configured link does not prove these controls.
4. Add only authorized publication records and public files. Confirm review records before marking journal articles reviewed.
5. Obtain explicit release approval before deployment or intake activation.

## Validation results

- Focused IYERN/public-content regression suite: **14/14 passed** across four files.
- Targeted TypeScript check of the new page, dependencies, and tests: **passed** under a 256 MiB heap.
- Repository lint and `git diff --check`: **passed**.
- Full `npm test`: pretest **12/12 passed**; full Vitest run produced no results and was interrupted under persistent memory pressure. It is not a passing full-suite result.
- Full app typecheck: **failed due to heap exhaustion** at the conservative 256 MiB limit. This does not establish whether unrestricted full-app checking passes.
- Production build and browser/axe/responsive checks: **not run**; final memory admission measured 111 MiB free plus speculative against the retained 512 MiB floor.
- No deployment or intake activation. See `validation.json` for the recorded commands and outcomes.
