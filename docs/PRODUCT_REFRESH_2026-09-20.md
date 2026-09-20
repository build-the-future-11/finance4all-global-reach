# Finance for All — landing and entry experience refresh

## Delivery boundary

This pass prioritizes the founder's request to work step by step, starting with
the landing page. It also implements related authentication, profile setup,
reading, research-discovery, and map improvements. Source changes are local;
this document is not a production deployment or live authentication certificate.

## Implemented

- A long-form landing page: mission, history, eight flagship programs,
  collaborations, research, affiliations, community locations, membership
  preview, reading room, and contact routes.
- Founder-supplied reach: **100,000+ students**, **1M+ LinkedIn impressions**,
  **six continents**. The later 1M+ figure supersedes the earlier 10M mention.
  The unnamed outreach partner is not identified on the page.
- History: Bangalore foundation in 2023, expansion across India, Finance
  Debriefed in 2025, Finance Meta in early 2026. Podcast has no invented date.
- Finance Meta Labs first, IYERN immediately after, followed by school visits,
  school clubs, industry projects, Olympiad, digital education, and university
  outreach. Flagship status does not imply an open cohort or confirmed dates.
- Nine proposed programs explicitly marked as coming soon, not launched.
- YEL, Sintika, and Locked In collaboration sections. University/employer
  affiliations are separated from program partners and explicitly do not imply
  institutional endorsement. These organizational claims are founder-supplied.
- Five finance research directions: FI-JEPA, Eigen-JEPA, EigenFinance, LGWM,
  and Finimmunity. The first three public repository routes were confirmed
  through GitHub. The latter two are private and use team-inquiry links, not
  broken public repository links. Existing lab application routes are retained.
- Natural Earth geographic outline with 30 community locations, search,
  six-region filtering, selected-city zoom, reset, and keyboard-operated pins.
  Cities represent founder-requested locations/regions, with representative
  cities chosen where the request named only a region. They are not verified
  active chapters or exact member counts.
- Consistent brand mark, favicon, light/dark styles, mobile navigation, and a
  membership preview with keyboard-accessible tabs.
- Refreshed sign-in/sign-up layout. Two-stage onboarding requests school or
  learning community, an age band (including Prefer not to say), public bio,
  interests, and collaboration preference. No date of birth is collected.
- Following the Supabase skill's trust-boundary guidance, school and age band
  stay in private Auth metadata rather than the public member directory.
  Metadata is not used for role authorization. Database roles remain the
  authorization source; the onboarding marker is a UX preference only.
- Profile writes verify a returned row before reporting success. Multi-step
  progress reflects actual profile/metadata save stages, not simulated delays.
- Time-of-day dashboard greeting and chapter/session/opportunity/submission
  actions. Email links compose an inquiry; they do not claim a submission was
  already sent or an opportunity was already created.
- Saved editorial guides persisted as a bounded personal Auth-metadata list,
  alongside existing news/project bookmarks. Account-switch and unconfirmed
  write failures are tested. Concurrent metadata writes remain last-write-wins;
  this is not an atomic multi-tab collection service.
- Four source-linked guides, each now within the requested 1,000–2,000-word
  range: IPO (1,077), interest rates (1,109), payments (1,094), and evidence
  literacy (1,059). Counts include headings and source labels. Reading times
  are calculated from the content, not manually inflated.

## Requested Inspira interaction mapping

Native React/CSS implementations preserve this React application's stack;
the supplied Inspira examples are Vue-oriented references.

| Required pattern | Where to inspect it |
| --- | --- |
| Box reveal | Hero and closing invitation headlines; authentication story |
| Encrypted text | Hero and research section labels |
| Container scroll | Membership-preview panel |
| Morphing tabs | Learn / Research / Connect membership preview |
| Multi-step loader | Actual onboarding save sequence |
| Lens | Finance Meta Labs conceptual research notebook |
| Dock | Floating section navigation |
| Media text | Geographic window in the history headline |
| Neural background | Landing hero and authentication story |

Affiliation marquee includes a pause control. Reduced-motion preferences
disable scrambling, continuous canvas movement, marquee motion, and scroll
transforms. Content remains readable without animation. Canvas work pauses
when offscreen or when the document is hidden.

## Still unfinished — do not advertise as complete

1. **Twenty-article library:** four long-form guides are complete; sixteen
   additional substantive articles remain. Daily publication needs an editorial
   workflow and real updates; no fake daily news or unattended scheduler was
   added.
2. **Ryan-only administration:** no new owner-only production restriction was
   applied. Confirm the owner Auth user ID, audit existing privileged accounts,
   enforce that boundary in database authorization, and run credentialed RLS
   tests. Hiding navigation or checking a client email is not sufficient.
3. **Live onboarding and saved-item verification:** source tests cover success,
   failure, and account-change behavior, but Supabase management reads returned
   permission denied. No live profile, role, or metadata write was attempted.
4. **Large external opportunity catalog:** existing six application/intake
   routes are retained. A broad verified internship/job catalog, deadlines,
   eligibility, moderation, and expiry workflow are not complete. No fictional
   employers or internships were introduced.
5. **Operational program content:** confirmed dates, episode library, partner
   briefs, Olympiad schedule, and active chapter records require real source
   data. Newly proposed programs remain coming soon.

## Founder inputs still needed

- Exact official Finance for All LinkedIn page URL. No guessed organization
  page was linked.
- Month/year and official source for the Locked In summit on the 19th/26th.
- IIT campus, dates, and description of the collaboration/history.
- Any additional approved partner names, public biographies, and chapter leads.

## Local checks and preview

- Browser-test preview: `http://127.0.0.1:4187/` by default from this nested application directory. Set `FINANCEMETA_E2E_PORT` to use another isolated port.
- Browser checks covered desktop/mobile layouts, both themes, mobile menu,
  city selection/search/zoom, membership tabs and keyboard navigation, and
  the lens toggle. DOM width checks found no horizontal overflow at 390px
  and 1440px. This is not a full accessibility or performance certification.
- TypeScript, ESLint, and development bundle checks passed during this pass.
- Local runtime was Node 26.8.2. Release workflows pin Node 22.23.2; rerun the
  production release gates in that pinned environment before deployment.
- Final Vitest run with one worker passed **119/119 tests across 30 files**.
  The intentionally broken-module error-boundary fixture prints expected
  errors; its assertions passed.
- The separate Node release/security-contract suite passed 27 tests.
- Earlier unconstrained parallel tests hit three five-second timeouts. A
  later two-worker run overlapping the build passed 118/119 with one existing
  validator test reaching its 15-second timeout. The isolated final one-worker
  run passed without increasing timeouts or weakening tests.
- Development bundle validation used a placeholder public key, not a live
  credential. The final dev server instead explicitly clears connection
  variables: auth pages disclose that member access is disconnected and
  disable sign-in/sign-up actions. User-owned environment files were not
  overwritten. Restore canonical project credentials before credentialed tests.
- Canonical Supabase project remains `pnemeegkwyaicsbnbnmg`.
- No commit, push, deployment, production data change, or generated research
  performance claim is part of this delivery.

## Source references

- Founder brief in this task for mission, reach, chronology, locations,
  affiliations, and collaborations.
- [Finance Meta Research](https://github.com/Finance-Meta-Research) repository
  metadata; existing public repository/application catalog retained.
- [Natural Earth land data](https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_110m_land.geojson),
  public domain; local simplified geometry avoids a runtime map dependency.
- [Inspira UI](https://inspira-ui.com/) interaction references supplied by the
  founder; mandatory patterns listed above.
- Primary reading is linked inside each editorial guide, including SEC,
  NPCI/RBI, Bank of England, and World Bank resources. Worked numeric examples
  are explicitly hypothetical, not claims about actual investments or studies.
