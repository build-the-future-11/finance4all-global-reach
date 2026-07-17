# Product Spec

Canonical Pass 1 product contract. Extends `docs/FINANCEMETA_PRODUCT_SPEC.md`.

## Naming

- **Codebase / current public UI:** Finance4All
- **Pass / portfolio product name:** FinanceMeta
- **Launch requirement:** single legal public name (owner decision D-001)

## Product boundary

Membership portal for students and early-career learners: structured learning, curated Finance Debrief reading, opportunities, chapter participation, research applications. Not investment advice, not placement guarantee, not unmoderated social feed.

## Audiences

Visitor · Member · Lead researcher · Administrator (see PROJECT_MEMORY).

## Public site must communicate

Mission; programs; honest impact (no fake metrics); opportunities; community; research; competitions/chapters/workshops/fellowships as available content allows; clear CTAs; contact; legal.

## Portal lifecycle (required)

Signup → (email verify if enabled) → Google OAuth optional → login/logout → password recovery → onboarding → profile → roles → protected routes → settings → export/delete.

## Portal workflows (required)

Programs/applications/projects/teams/capstones as mapped to existing Meta Labs + Pathways; chapters; competitions (future-complete); workshops/events; resources; submissions; notifications; bookmarks; member discovery; activity; administration.

## Finance Debrief (trustworthy) — Pass 2 contract

### Goals

Manual articles and **source-bound** AI-assisted summaries for education.

### Must have

| Capability | Rule |
| --- | --- |
| Approved-source registry | Only listed sources may bind to publishable articles |
| Source date, topics, regions, importance | Stored on article |
| Draft → assign → review → schedule → publish → correct → archive | Explicit statuses |
| Author / editor attribution | Required for published |
| AI generation logs | Prompt/model/source refs; never auto-publish |
| Newsletter inclusion | Explicit flag, not implicit |
| Version history | Every meaningful edit after publish |
| Educational disclaimer | Always visible on published articles |

### Must never

- Auto-publish unsourced AI content
- Present AI text as human journalism without labeling when AI-assisted
- Hide original source links when available

### Current implementation gap

Today’s Admin “News” tab toggles `is_published` on `news_articles`. That is a **temporary** publishing control, not the trustworthy Debrief system. Pass 2 replaces/extends it.

## Navigation guidance

Prefer primary nav: Dashboard, Debriefed, Learn, Opportunities, Events & Chapters, Saved, Profile. Network/Resources remain valuable but may demote if empty. Align UI to spec in Pass 3 if needed.

## Non-goals

Brokerage, paid advice, scraping paywalled content without license, social DM product.
