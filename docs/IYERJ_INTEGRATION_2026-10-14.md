# IYERJ information-page integration — 14 October 2026

## Scope

Adds a lazy-loaded `/iyerj` information route to Finance4All. The page carries the owner's planned first edition of 1 December 2026, one flagship economics/finance journal, four forum categories, fellowship applications coming soon, and the research challenge in planning.

This is an information page, **not** a submission service, active forum, published journal, completed peer-review operation or production release. No reviewers, accepted articles, institutional endorsements, fees, publication rights or partner agreements are invented. The existing public editorial-question mailbox is retained as an inquiry link, not an intake form.

The copy adapts the 14 October launch preview and editorial playbook. Those documents were already prepared; this change is the React page, isolated styling, public route and regression coverage. The page deliberately does not expose forms, embeds, file uploads, new APIs, tracking or publication actions.

## Exact source boundary

- Base: `7e5bb0ca4bba61c6fa2960b3b8ee99d7cd89c41f`.
- Base tree: `4331bc71f4e764571467f89ea7d90e7032976175`.
- Original router blob: `4e634f771d65c641dadea18192508af09cad5ee5`.
- The reconstructed original router was hashed and matched that exact blob before editing.
- The router delta is exactly one lazy import and one public route. All existing routes, authorization wrappers and role guards remain unchanged.
- No dependency, lockfile, workflow, production setting, database or migration changes.
- Existing member-portal review stacks remain separate and untouched. This proposal does not authorize merging those stacks.

## Local checks actually executed

- TypeScript 5.8.3 syntactic transpilation: page, router and test source all have zero reported syntax errors. This is **not** whole-project TypeScript checking.
- Exact router preservation check: removing the two new lines reproduces the original file byte for byte.
- Static page checks: expected title argument, one h1, four inactive-posting notices and no intake controls or embedded scripts.
- CSS parse and namespace check: 52 scoped selector rules; no stylesheet parse error.
- Chromium 144.0.7559.96: source-derived static HTML was inspected at 320, 390 and 1440 px. Checked landmarks, date attribute, four categories, absent intake controls, fragment targets, no horizontal overflow, keyboard skip-link visibility/focus transfer, native FAQ expansion and no HTTP requests from this standalone preview.
- Desktop and 390 px screenshots were visually reviewed.

The browser preview is generated from the TSX's native-element tree using a minimal JSX serializer and a stub title hook. It is **not a React mount**, does not execute the router, and does not test the inherited AuthProvider, application-wide CSS or other host-page effects. Browser checks used `set_content`; file-URL navigation was blocked by the local browser policy. No browser-policy setting was changed.

## Checks not executed locally

The five added Vitest cases, whole-project typechecking, ESLint, production build and application-browser tests remain to be executed with the repository's actual locked dependencies. Local repository cloning/dependency installation was blocked by unavailable network DNS. No result is inferred from the syntactic/static checks. Existing CI must run unchanged on the proposed exact head; a pending or failed CI run must remain visible.

## Integration and release conditions

1. Review the page/copy and run the existing CI with the added Vitest coverage.
2. Check the actual React `/iyerj` route within the full app, including direct navigation, page title, keyboard use, global CSS interactions and mobile layout.
3. The existing homepage still links to the legacy IYERN destination. A deliberate homepage navigation change is not included here and remains necessary for discovery through that card.
4. Obtain ordinary review and use the existing approved deployment route; this draft neither merges nor deploys itself.
5. Keep submission and forum-posting language closed until actual intake, moderation, privacy, reviewer ownership and author-permission arrangements exist and are tested.
6. Keep Finance4All's production provenance, authentication and controlled-account/database gates separate. This information route does not close any of them.

A deployed information page must not be reported as a launched journal or operational forum.
