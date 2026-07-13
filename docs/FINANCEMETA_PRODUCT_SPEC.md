# FinanceMeta Product Specification

Status: release contract for phases 2–6. This document uses **FinanceMeta** as
the requested product name. Before launch, the legal and public-facing name
must be chosen and applied consistently; the current codebase still presents
itself as Finance4All.

## Product boundary

FinanceMeta is a membership portal for students and early-career learners who
want a structured way to learn finance, read curated explainers, discover
opportunities, participate in a chapter where one exists, and take part in
research projects. It does not make performance, placement, partner, reach, or
outcome claims unless an administrator has supplied evidence for them.

The public site answers what the program is and offers a clear route to join.
The authenticated portal helps a member act on the next useful task. It is not
a social network, an investment-advice product, or a generic content library.

## Audiences and value

| Audience | Primary job | Value delivered |
| --- | --- | --- |
| Visitor | Decide whether to join | Clear explanation, current public content, and an honest membership path |
| Member | Build knowledge and participate | Dashboard, saved reading, learning progress, events, chapters, opportunities, and research applications |
| Research lead | Run an approved research project | Create and manage own projects; review applications to those projects |
| Administrator | Operate the platform safely | Publish and edit content, manage opportunities, events, chapters, research, and moderation workflows |

## Information architecture

### Public

- `/`: What FinanceMeta is, who it is for, how members participate, selected
  currently published content, membership call to action, contact, privacy,
  and terms.
- `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/auth/callback`.
- `/privacy`, `/terms`, and `/contact`: required production routes. Contact may
  remain a section on the landing page only after the privacy and terms routes
  exist.

### Member-only

- Dashboard: next actions, progress, saved items, upcoming events, and recent
  content. This is the default post-onboarding destination.
- Debriefed: curated news summaries and explainer reading. A reader can save
  an item and follow its clearly labelled original source.
- Learning: course modules, individual lessons, and server-persisted lesson
  progress.
- Opportunities: research projects and external/member opportunities. Applying
  or registering must persist an owned record and show its status.
- Events and chapters: chapter directory, chapter details, events, and RSVP
  state.
- Saved, activity, profile/settings, notifications.

### Administrative

- One admin workspace, not a separate product area. It manages publishable
  content, courses, opportunities, research projects, chapters, events, member
  submissions, and moderation. Every destructive action requires confirmation.

## Navigation decisions

The member primary navigation is Dashboard, Debriefed, Learn, Opportunities,
Events & Chapters, Saved, and Profile. Notifications and search are global
utilities. Activity is a Dashboard/Profile subview, not a primary destination.
Resources, essays, studios, and member network are retained only where they
have populated, moderated content; otherwise they are removed from primary
navigation and surfaced through Opportunities or Learning.

The public landing page order is: clear product statement; ways to participate;
what a member can use now; selected published reading/learning/opportunities;
membership; contact; legal footer. Testimonials, impact figures, partners, and
founder material are optional and publish only when verified.

## Roles and permission rules

| Action | Visitor | Member | Research lead | Admin |
| --- | --- | --- | --- | --- |
| Read public pages | Yes | Yes | Yes | Yes |
| Read member content | No | Yes | Yes | Yes |
| Update own profile/preferences | No | Own | Own | Own |
| Save content, RSVP, record course progress | No | Own | Own | Own |
| Apply to an open, unexpired project | No | Own | Own | Yes, only for test/support workflow |
| Create/edit own research projects | No | No | Own | All |
| Review applications | No | No | Own projects | All |
| Publish/manage platform content | No | No | No | Yes |
| Change roles | No | No | No | Server-side privileged operation only |

Client route guards are usability affordances only. Database RLS and server-side
validation enforce each rule. A role stored in a browser-controlled request
must never grant a capability.

## Data contract

Existing entities are: `profiles`, `chapters`, `news_articles`,
`explainer_cards`, `digest_preferences`, `research_projects`,
`lab_applications`, `opportunities`, `opportunity_interests`,
`events`, `event_rsvps`, `bookmarks`, `notifications`, education modules and
lessons, `user_lesson_progress`, resources, and CMS tables.

Required additions or changes before release:

- `profiles.onboarding_completed_at` and a one-way onboarding completion rule.
- A competition/event registration model with capacity, registration window,
  status, and unique member registration. Reuse `events` only if those fields
  and validations are added; do not pretend a generic RSVP is a competition
  registration.
- `news_articles.body` or an explicit source-only summary model. The reader
  must not imply an article can be read in-app when only a summary exists.
- Constraints for nonblank titles/descriptions, bounded text lengths, valid
  URLs, allowed status transitions, nonfuture review timestamps, and logical
  deadlines.
- Indexes matching the member views: project status/deadline, event
  status/date, article publication/category, notifications by user/read/date,
  bookmarks by user/type, and progress by user/module.
- An auditable privileged-role assignment path. Do not expose role mutation to
  normal authenticated clients.

## Core journeys and acceptance criteria

### Authentication and onboarding

A visitor can sign up or sign in with configured email/password or Google.
Each auth user has exactly one profile, created by the authentication trigger.
Missing-profile recovery may only call an idempotent server-side function; the
client must not insert an arbitrary profile. A user without
`onboarding_completed_at` is routed to onboarding. Submitting valid profile
information completes it once and enters the dashboard. Returning users see
their existing profile, preferences, saved items, and progress.

Acceptance: duplicate sign-up/OAuth callbacks do not create duplicate profiles;
expired or absent sessions cannot read portal data; sign-out returns to public
state and a returning session restores its persisted data.

### Dashboard and saved content

The dashboard uses only records visible to the signed-in member and gives each
card a real destination or a disabled, explained unavailable state. Saving is
idempotent, immediately reflected in Saved, and remains after sign-out/sign-in.

Acceptance: loading, empty, error, and retry states exist; another user cannot
read, create, or delete the member's saved records.

### Debriefed

Administrators publish curated summaries with category, source attribution,
publication state/date, and optional in-app body. Members browse, filter, open,
and save visible items. External source links state that they leave the site.

Acceptance: unpublished content is not returned to members; content cannot be
saved twice; source-only records do not show a false “read full article” path.

### Learning

Members can enroll in available modules, open lessons, and mark/record lesson
progress. Progress is server-persisted per member and computes module progress
from available lessons. Course copy never says progress is device-only.

Acceptance: progress is restored across browsers/sessions; invalid lesson IDs
produce a useful not-found state; a member cannot write another member's
progress.

### Opportunities, research, competitions, chapters

Opportunities display only active, valid records. A research application is
permitted only once per member for an open project whose deadline has not
passed. Research leads can see and update applications only for projects they
own. Competitions use the registered event workflow, not an unpersisted CTA.
Chapter listings and updates show only administrator-published data.

Acceptance: closed/expired projects reject direct API inserts; duplicate
applications and registrations fail cleanly; capacity and registration windows
are enforced; members can see their RSVP/registration state.

### Administration

Admin create, edit, publish, and archive workflows validate on the server and
report success/failure. Publishing turns draft content into member-visible
content only when required fields are valid. Editing an item updates the member
view without stale optimistic state. Deleting requires confirmation and uses a
safe dependency policy.

Acceptance: direct client calls from non-admin roles are rejected by RLS; a
research lead cannot administer unrelated content; an audit/logging hook
captures privileged mutations.

## Responsive, accessible, and content standards

The public site and portal work from 320px to wide desktop without clipped text,
horizontal scroll, hover-only controls, or hidden essential navigation. Touch
targets are at least 44 by 44 CSS pixels. Dialogs trap focus and return it on
close. Every control has a programmatic label; status changes are announced;
error text identifies the field and recovery action; colour is never the only
signal. Keyboard navigation and visible focus work throughout. Text and UI
contrast meet WCAG 2.2 AA.

Public copy is concrete, direct, and conditional where information is not yet
available. It avoids unverified scale, partnerships, outcome promises, and
stock claims. Empty states explain the present condition and the available next
action, rather than manufacturing activity.

## Analytics and operations

Event collection is privacy-respecting and documented: page view, sign-up
started/completed, onboarding completed, content opened/saved, course started/
lesson completed, opportunity opened/applied, event registration, search used,
and error shown. Do not send email, free-form application text, profile bio,
or authentication details as event properties. Production requires consent and
retention decisions before nonessential analytics are enabled.

Production also requires environment validation, error reporting, server-side
rate limits for public/high-cost actions, CSP/headers, canonical URLs and social
preview image, 404 handling, privacy/terms/contact routes, backup/migration
plan, operational ownership, and monitoring hooks.

## Existing versus proposed

| Status | Scope |
| --- | --- |
| Existing | Auth, OAuth integration points, protected portal routes, profile editing, bookmarks, notifications, education progress, research applications, event RSVPs, admin area, RLS baseline, avatar storage, error boundary, basic metadata, unit tests |
| Must complete for release | Name and claim reconciliation; canonical navigation; database-enforced lifecycle rules; competition registration; reliable onboarding state; privacy/legal routes; production metadata; public mutation protection; critical-flow and authorization E2E coverage |
| Deferred | Open social-network features, unmoderated messaging, investment tools/advice, automatic partner logos/impact counters, public member profiles by default, and any AI-generated editorial content without human review |

## Release gate

The release candidate passes only when all core acceptance criteria above are
automated where feasible, manually verified across desktop and mobile, and all
public claims have a verified owner/source. Remaining launch tasks must be
external operational tasks only, not known product, security, accessibility, or
data-integrity defects.
