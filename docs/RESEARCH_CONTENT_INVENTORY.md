# Research inventory — 16 October 2026

## Implementation and source boundary

The canonical portal now owns `/research` and `/research/projects/:slug`. `src/content/research.ts` extends the 12 records in `catalog.ts` with four operating research lanes. The legacy portfolio now links to local detail pages; IYERN retains its integrated `/iyern` destination. No private member project or manuscript is copied into this public catalog.

The directory supports URL-preserved search, ten topic filters, evidence-status filters, title/evidence-date sorting, topic tags, featured records and empty-state recovery. Every detail has a question/objective, method, design, data provenance, baseline, measures, controls, findings/limitations, publication boundary, source date and participation route. Proposed methods and measures are explicitly prospective. The catalog review date does not replace the date of underlying evidence.

| State | Count | Records |
| --- | ---: | --- |
| Engineering baseline | 1 | FI-JEPA |
| Repository available | 1 | Eigen-JEPA |
| Repository record; current remote read unavailable | 1 | EigenFinance |
| Research infrastructure | 3 | FinanceMeta Global, IYERN, member platform |
| Proposed study | 6 | LGWM, market memory/Finimmunity, student cost of living, digital payments, youth expectations, company/sector research |
| On hold | 4 | Backtest falsification, Open Markets, quantitative markets/forecasting, financial systems/access/policy |
| Authorized journal articles / preprints | 0 / 0 | Existing authorization filter and empty archive retained |

The ten discovery topics map to the existing four IDs in `src/content/iyern.ts`. This does not change stored manuscript categories or claim that one discovery-topic mapping is the only valid editorial classification.

## Sources checked

- Existing `src/content/catalog.ts`, `src/content/iyern.ts`, IYERN page and tests.
- Sibling `../FinanceMeta-Global/registry/projects.json` (underlying verification 2026-09-01), `FI-JEPA/README.md`, `registry/programs.json` (2026-08-29), and `../FinanceMeta-Landing/src/content/programs.ts`, read only.
- [Public FI-JEPA repository](https://github.com/Finance-Meta-Research/FI-JEPA) and [Eigen-JEPA repository](https://github.com/Finance-Meta-Research/Eigen-JEPA) were reachable in the web read on 2026-10-16. The pages establish public code/package descriptions, not independent reproduction.
- [EigenFinance](https://github.com/Finance-Meta-Research/EigenFinance) remote page/raw reads failed in this environment; the existing 2026-09-20 verification is preserved as historical. No new result or current availability claim is made.
- Connected Drive read of [canonical operating plan](https://docs.google.com/document/d/1BTYxWzEp-hwP4Gtlqi7sCi5fFx4hV2VK-cV6w_0hiJc/edit), modified 2026-10-03, and [October launch kit](https://docs.google.com/document/d/1K1q9R0KbJL2vXAtpRIUbTzD_zpxGvF0scoTBVGJsz6E/edit), prepared 2026-10-14. These internal source records informed bounded status summaries; their full contents were not republished.
- Connected Tally metadata and form ledgers for the consolidated intake `kbayyj`, journal `b5BBko`, preprint `RGXXLJ`, programs `obWxvN`, and editorial `zxlL5Z`. No submissions or personal responses were read.

## Discrepancies preserved

1. FI-JEPA's local registry records a bounded NumPy synthetic baseline; the separate public repository describes a broader PyTorch package. The project page names both scopes and does not merge their receipts or infer real-market evidence.
2. Existing IYERN copy advertised universal mentorship, DOI setup and December 1 as an issue date. The newer consolidated intake promises neither mentorship nor DOI; the launch kit explicitly flags December 1 as an unresolved issue-date/submission-cutoff conflict. Copy now presents both dates as unconfirmed. The old journal form still contains stronger claims, so the journal CTA uses the newer consolidated screening intake.
3. The prior NetworkStory described 500+ researchers, 30 countries, 250+ summer participants, named chapter partnerships, member affiliations and Synthica/YEL summer activity. No supporting membership/permission/delivery receipt was available in this reconciliation. The launch kit describes YEL discussions as exploratory for the upcoming challenge. These claims were removed from the public narrative without declaring that the historical activities did not occur. They require separate evidence before reintroduction.
4. The launch-kit preprint labels differ from the portal's established four category labels. Existing canonical IDs and authorization rules are retained; discovery mapping is separate from an editorial migration.

## Publication and participation controls

`isPublicPublication` still requires author consent, rights, confidentiality clearance, moderation and publication authorization. Journal classification additionally requires completed review. No manuscript, paper PDF or author roster is newly released. Existing public manuscript previews remain the only publication renderer.

General interest links do not create project membership. Private applications, invited collaborators, tasks and deliverables remain in authenticated, RLS-bound workflows. No Supabase migration, privileged role, release setting or production data was changed by this slice.

## Verification

Regression coverage is in `src/test/research-programs.test.tsx`, with existing IYERN and content-depth tests updated for conservative timeline/intake language and local detail routes. It checks taxonomy mapping, combined filters, unavailable routes, project-to-program references, detail evidence sections, draft-form exclusion and lifecycle-safe CTAs. Integrated command results and browser evidence belong in `RELEASE_EVIDENCE.md`.

Open gates: current EigenFinance source verification; exact result receipts and independent reproduction for scientific claims; author/publication permissions; editorial/reviewer capacity; December 1 clarification; authenticated production journey and hosted RLS certification. A website build closes none of these research or production gates.
