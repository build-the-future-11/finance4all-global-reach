# Event and program registry — 16 October 2026

## Programs

The public registry is `src/content/programs.ts`, rendered at `/programs` and `/programs/:slug`. It also supports an embedded member directory through `<Programs embedded />`. Public content is shared; account applications, accepted participation and saved records are not inferred from it. Query parameters preserve search, family, lifecycle and sort selections.

There are **23 consolidated program records**: 2 Active, 10 Interest open, 3 Applications open, 6 On hold, 2 Planned; none are claimed Completed or Archived. “Applications open” is qualified as initial manuscript/editorial screening for these three records, not an operational cohort. Active means open learning resources or the bounded Labs division; neither means unrestricted onboarding is certified.

| Slug | Program | Lifecycle | Public action |
| --- | --- | --- | --- |
| financial-foundations | Financial Foundations / curriculum / digital resources | Active | Open learning |
| finance4-impact | Finance4 Impact / workshops / school and community pilots | Interest open | Interest only |
| chapters | International Chapters / Affiliate Clubs | Interest open | Proposal interest |
| finance-meta-labs | FinanceMeta Labs | Active | Interest and matching only |
| quantitative-markets | Quantitative Markets & Microstructure | On hold | Interest only |
| financial-systems-policy | Financial Systems, Access & Policy | On hold | Interest only |
| open-markets | Open Markets Lab / Challenge 001 | On hold | Launch updates only |
| methods-reproducibility | Methods / replications / negative results | Interest open | Interest only |
| student-research | Student / member research participation | Interest open | Matching interest |
| iyer-journal | IYER Journal / IYERJ | Applications open | Initial editorial screening |
| preprint-forum | IYERN Preprint Forum | Applications open | Preprint screening |
| research-fellowship | IYERN Research Fellowship | Interest open | Future cohort interest |
| global-research-challenge | IYERN Global Research Challenge | Interest open | Challenge updates |
| editorial-reviewers | Founding Editors / Reviewer Pool | Interest open | Expertise / capacity interest |
| investment-model-challenge | Global Investment Model Challenge 2026 | On hold | Rules and launch updates |
| backtest-falsification | Backtest Falsification Challenge | On hold | Launch updates |
| fintech-studio | FinTech Studio / Point-in-Time Market Data Integrity Toolkit | On hold | Contributor interest |
| axiom-pathways | Axiom Pathways | Planned | Member opportunity board |
| debriefed-contributors | Finance Debriefed contributors | Applications open | Editorial proposal screening |
| regional-research-networks | European & Gulf Finance Research Networks | Interest open | Contributor and project matching interest |
| union-collaborations | The Union / scoped industry collaborations | Interest open | Collaboration proposal |
| mentors-and-leadership | Mentors / speakers / program contributors | Interest open | Bounded contribution interest |
| queued-directions | SISTER, Zenipath, podcast, additional competitions, venture directions | Planned | No advertised intake |

The aliases deliberately consolidate activities rather than invent separate cohorts. FinTech toolkit/data infrastructure/research engineering share Studio 01; workshops/pilots share Finance4 Impact; affiliate clubs share the chapter pathway. Quant Arena and Buildathon are explicitly unconfirmed event concepts within existing families. Earlier program concepts are grouped into one future-directions record with no implied operating status. No unrelated Bu1LD or school event is presented as a FinanceMeta program.

Each detail includes purpose, deliverable, organization, audience, eligibility, commitment, format, explicit dates-or-not-announced, readiness, selection boundary, FAQ, related research/resources/events, official source and verification date. Individual owners are not named without appointment/permission evidence.

## Intake evidence and reconciliation

Connected Tally `list_forms` on 2026-10-16 returned metadata for the available workspace; no submissions were fetched. `list_blocks` verified purpose and permission language. Reads did not publish or edit any form.

| Form | Observed state | Handling |
| --- | --- | --- |
| kbayyj | Published, open; created 2026-10-15 | New consolidated research/publications/program interest and initial-screening intake. Preferred shared action because it explicitly separates provisional programs, no guarantees, privacy and guardian permissions. |
| b5BBko | Published, open | Journal form still makes stronger mentorship/scale/DOI setup claims. Historical route retained in this audit; the website journal action now uses kbayyj screening with conservative language. |
| RGXXLJ | Published, open | Verified preprint identity, coauthor permission, rights, confidentiality and screening boundary. Linked as preprint screening only. |
| obWxvN | Published, open | Research/programs/leadership/partnership intake; used for scoped Union collaboration proposals. |
| zxlL5Z | Published, open | Editorial submission identity verified. Issue publication still gated; new contributor action uses consolidated editorial screening. |
| xXOMYo | Published, open | Open Markets registration exists, but operational hold persists; direct registration is not advertised. |
| e5ZZNO, Qo22xp, bZVV2o, WJ99ea, 6DJJ1B | Draft | Not linked. Future interest is covered by the verified consolidated form. |
| GxN8Vz, Ek4aR4 | Draft | Not linked; rules/review holds retained. |
| XxaB1j | Published, open | Historical chapter form. Consolidated chapter interest is the current directory route. |
| Me4d6p | Published, closed | Historical Studio form; not used. |

`getProgramAction` rejects unavailable/unverified actions, unsafe URLs and application/screening actions unless lifecycle is Applications open. On-hold programs permit only qualified interest/update actions. Program source links and user actions are distinct; a source is not automatically registration authority.

Sources: existing portal catalog, sibling FinanceMeta-Global program registry, sibling FinanceMeta-Landing program architecture, [canonical operating plan](https://docs.google.com/document/d/1BTYxWzEp-hwP4Gtlqi7sCi5fFx4hV2VK-cV6w_0hiJc/edit), [October launch kit](https://docs.google.com/document/d/1K1q9R0KbJL2vXAtpRIUbTzD_zpxGvF0scoTBVGJsz6E/edit), and the live Tally metadata/ledgers above. Later current form state supersedes draft-list assumptions only for availability, never for staffing or operating readiness.

The inaugural journal edition targets December 1, 2026. Author permissions, reviewer capacity, editorial readiness, the final publication date, exact competition dates and production member certification remain explicit gates. This registry makes no prize, DOI, ISSN, acceptance, faculty placement, partner or return guarantee.

## Events

Event source reconciliation, candidate classifications, scheduling/registration rules and verified event totals are documented separately in [EVENT_SOURCE_RECONCILIATION.md](EVENT_SOURCE_RECONCILIATION.md). Program detail pages link to `/events?program=<slug>`; events and programs remain different records. An event candidate does not make a program active, and an open interest form does not make an event scheduled.

## Maintenance and regression coverage

This is an approved-code-content registry, not a duplicate operational database. Changes should carry a new source/verification date and pass normal repository review. Program edits do not insert production records or bypass existing authenticated intake and publication controls.

`src/test/research-programs.test.tsx` verifies aliases, reference integrity, filters, safe URL handling, blocked draft forms, held CTA semantics, dates and public/member rendering. Exact integrated test results are tracked in `RELEASE_EVIDENCE.md`.
