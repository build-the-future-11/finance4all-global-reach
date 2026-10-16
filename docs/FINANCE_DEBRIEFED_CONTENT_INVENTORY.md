# Finance Debriefed content inventory

Reconciled 16 October 2026. This is an inventory of inspected source records, not a claim of external publication, independent editorial certification, or production deployment.

## Scope and counts

| State | Verified local count | Treatment |
| --- | ---: | --- |
| Existing public repository guides | 4 | Full text remains open access; provenance gaps are disclosed. |
| Reviewed and approved but not yet published | 0 found | No approval inferred from source access or file completeness. |
| Complete, awaiting editorial/repository approval | 6 | Original files preserved; excluded from public imports, reader selectors, saved-content lookup and browser bundles. |
| Editorial draft | 1 | Issue 001 staged in a restricted local review package outside the repository. |
| Planned | Not reconciled | An earlier 20-target plan does not establish 20 completed or currently scheduled articles. |
| Archived/withdrawn | 0 found locally | External archive completeness remains unknown. |

Eleven identifiable content records: ten complete repository manuscripts and one Google Docs draft. **No new article was approved or externally published by this implementation.** No paid access gate was added.

## Existing public guides

These four source-reviewed educational assets entered the repository in commit `0604470b6275973038e46151d1103e128da83652` on 20 September 2026. The repository publication policy explicitly treats static learning guides as repository-reviewed assets. This establishes the source inclusion boundary, not a historical Substack publication date, named author, or independent approval receipt.

| Title | Canonical public route | Recorded source review |
| --- | --- | --- |
| The complete guide to an IPO | `/debriefed/ipo-from-private-company-to-public-market` | 2026-09-20 |
| How interest rates move through the economy | `/debriefed/how-interest-rates-move-through-the-economy` | 2026-09-20 |
| UPI and the economics of a payment network | `/debriefed/upi-payments-and-the-economics-of-a-network` | 2026-09-20 |
| How to read an economic claim without getting fooled | `/debriefed/reading-an-economic-claim-without-getting-fooled` | 2026-09-20 |

The UI explicitly records original publication date and individual author attribution as unavailable. Text is attributed to the existing Finance4All editorial library, with no invented individual author. Rights provenance is the original repository text; no separate reuse licence is asserted. External references remain their owners' work. The version/corrections record identifies the original repository edition and this interface/source-link maintenance, without claiming a fresh factual review. A dedicated corrections intake and editorial response SLA remain unverified.

## Complete manuscripts awaiting approval

The following were **preexisting untracked work** in `src/content/editorial-series.ts`, with evidence in `evidence/financedebriefed-2026-10-11/`. Their original files and evidence were preserved. The manifest describes local source integration, hypothetical examples, and no external editorial certification. The previous working-copy import would have included them in public assets; it is now removed from the public module until approval is recorded.

1. Why lower inflation does not mean lower prices
2. Why bond prices fall when yields rise
3. How a profitable company can run short of cash
4. What a weaker currency changes
5. A stock split does not make a company cheaper
6. Why a rising stock index is not the whole economy

Repository reviewers must record attribution/rights, original publication or first-release date, source checks, corrections ownership, and authorization before including these bodies in the public asset export. Completing code review alone must not fabricate independent editorial approval.

## Issue 001: restricted review only

Connected Google Drive reads succeeded for both supplied documents:

- [Draft v0.1](https://docs.google.com/document/d/1ZKB3zzA-ZO2W_9vLWirEup8QtdDkLC9QT60Qo7i9J7c/edit), modified 2026-09-19T10:28:23.651Z: *Before the Backtest: What Makes Historical Market Data Point-in-Time Safe?* Explicitly **DRAFT — NOT PUBLISHED**.
- [Source and claim pack](https://docs.google.com/document/d/15OaRu2UqqfRLzxts6OfILarYEKyDoJ6pf3XEM5SkORs/edit), modified 2026-09-19T10:28:11.681Z. Requires managing editor, accepted source pack, research reviewer, fact-checker, corrections policy, and recorded release gates.

An exact source snapshot plus a draft-only import envelope is staged at `/private/tmp/finance4all-editorial-review-2026-10-16/issue-001-draft.json`. This folder is outside the repository and Vite root, mode 0700; the file is mode 0600. It was moved out of the initially ignored `.local` staging directory to keep it outside the development server file surface. **It must never be committed, copied into public assets, or included in a deployment artifact.** Its presence is verified locally, not promised on another checkout. Source URLs in this inventory are pointers, not public document-sharing authorization.

Admin → Publication review now provides a restricted JSON import view. It validates a strict `finance-debriefed-draft-v1` envelope, allows full local draft/claim-pack inspection, and imports only allowlisted explainer content fields on an explicit administrator action. Publication metadata is rejected from files. The existing database supplies `draft`/revision 0; the UI checks that receipt and pins the checked administrator's JWT. The private claim pack is not appended to article text. Duplicate slugs fail normally instead of overwriting existing content. Publication remains a separate, revision-checked existing review RPC.

**No live database import occurred.** This preparation cannot be described as a completed live editorial review. The existing live schema/RLS/account certification gates remain applicable before an operator uses it against production.

## External archive and source verification

The supplied [Finance Debriefed Substack archive](https://financedebriefed.substack.com) could not be fetched by the web tool, and a site-restricted search produced no usable article inventory. Therefore no archive article count, title, publication date, author, licensing claim, or syndicated full body was invented. The official external archive link remains available. Bulk Substack import is blocked on authenticated/accessible source inventory and republication rights.

Source-link checks on 16 October:

- Replaced the old SEC registration URL with the verified [current SEC page](https://www.sec.gov/resources-small-businesses/going-public/what-registration-statement).
- Resolved SEC EDGAR's redirect to [Search Filings](https://www.sec.gov/search-filings).
- Replaced a 404 Investor.gov IPO URL with its [official investor bulletin](https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins-17).
- Replaced a 404 BIS monetary-policy topic URL with the [Markets Committee compendium](https://www.bis.org/committees/mc/compendium/overview).
- Replaced the inaccessible IMF topic URL with the verified [monetary-policy factsheet](https://www.imf.org/en/about/factsheets/sheets/2023/monetary-policy-and-central-banking).
- Bank of England transmission article and World Bank evaluation book page were readable.
- RBI monetary-policy/payment pages were inaccessible through the tool; NPCI overview returned limited text and NPCI FAQ returned a request-rejected page. These are **unverified access checks**, not evidence that the underlying source is false or that a human browser cannot open it.

Explanatory prose and worked examples were retained. Source-link repair is not a current legal, monetary-policy or investment fact-check. No live market reporting or synthetic chart was created.

## Implemented reader and account behavior

- `/debriefed` and `/debriefed/:slug`, retaining `/learn/debriefs` aliases; shared member reader under `/portal/debriefed/explainers/:slug`.
- Featured guide, nine-topic taxonomy, title/tag/full-text search, topic filter, reviewed-date/title/read-time sorting, clear empty results, and direct article navigation.
- Full article typography, deterministic table-of-contents anchors, original source list, read time, related guides, learning/research links, version record and explicit educational boundary.
- Existing saved-guide Auth metadata is reused. Authenticated reading history uses a separate `debriefed_reading_history` key; it is never a profile-directory field, public page payload or authorization claim.
- Bookmark writes now pin the submitting account's checked JWT and confirm both identity and saved-list receipt. The saved-guide cache is account-scoped. Both metadata readers treat the locally stored Auth snapshot as stale on mount so refreshing after a save retrieves server state despite the app's one-minute cache default. Pending initial reads are canceled before mutations to prevent stale results from replacing confirmed saves.
- Explicit save-position/mark-read actions only. No scroll telemetry. Reading history keeps at most 100 valid approved-guide entries and checks account identity, pins the write JWT and verifies its receipt. A query cache is keyed by account. Concurrent same-account tab edits remain last-write-wins, consistent with the existing metadata-based saved-guide model; no transactional history is claimed.
- Digest topics and preference controls retain the existing user-scoped RLS table; writes check/pin the account and verify the receipt. UI does not claim active email delivery or create a Substack subscription.
- Existing database articles remain under publication-state RLS and authenticated member access. Static open-access articles never expose bookmarks, progress, member data or the private draft. Failed member-addition queries do not block the static library.
- No public discussion system was added without moderation infrastructure.

## Validation

Focused tests cover source/publication boundaries, unavailable draft slugs, aliases, full-text/topic search, public reading and TOC anchors, metadata honesty, unsafe links, strict draft-import rejection, reading-position persistence, confirmation failures and account-switch behavior. Existing saved-guide and publication-review tests are included. Focused run under Node 22 / npm 10.9.8: `npx vitest run --maxWorkers=1 src/test/debriefed-library.test.tsx src/test/reading-history.test.tsx src/test/editorial-draft-import.test.tsx src/test/saved-guides.test.tsx src/test/publication-review.test.tsx` — **5 files, 31 tests passed**. Targeted ESLint for all Debriefed source/components/hooks/tests also passed. An earlier parallel run hit a reader DOM-query timeout; reducing query cost and rerunning serial workers resolved it. An unrelated chapter-map label assertion was handed to its owning slice. Final integrated commands/results belong in `docs/RELEASE_EVIDENCE.md`; live editorial/RLS/account checks remain separate.


The new `e2e/debriefed-library.spec.ts` adds anonymous search/full reading/TOC navigation, legacy aliases, held manuscript rejection, 375/1440px overflow checks and member progress/refresh/resume checks using the existing browser-only member fixture. The slice prepared these tests without executing the browser suite; integrated browser receipts belong to the release report.

`node scripts/verify-editorial-bundle.mjs` passed against the locally available build output. It fails on runtime imports of the held series, known held titles in emitted assets, and private editorial import filenames. Re-run it against every final build. This guard contains only user-provided/inventoried titles, never private draft prose. It supplements keeping the source snapshot outside the repository; it does not confer publication approval.

The integrated build initially revealed that the unused inventory's module-level maps kept held title metadata in emitted JavaScript. Review inventory data was moved entirely to `src/test/fixtures/editorial-inventory.ts`; this document remains the canonical inventory. The guard passed on the rebuilt output. No held manuscript body was imported or published.

Review regressions were added for dashboard completion deduplication across learning notes and reader history, saved-section links, public search while member results are loading or failing, the search input's accessible name, token-bound bookmark races and wrong-account receipts, server hydration under the app cache default, and preserving an edited section when history arrives later. The follow-up focused run passed **5 files / 28 tests** in 12.03 seconds: `portal-search-ui`, `dashboard-reading`, `saved-guides`, `debriefed-library`, and `reading-history`. The browser refresh failure was traced to the Auth snapshot's freshness, not a lost server write. `e2e/portal-navigation.spec.ts` adds 375px search and 1023/1024px navigation checks for integrated execution. No live account/session certification is implied by mocked tests.
