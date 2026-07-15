# User Flow Map

Status: implemented flows and release acceptance map.

## Visitor Discovery

1. Visitor lands on `/`.
2. Header, hero, participation sections, Finance Debrief/Learning/Opportunity
   explanations, contact, privacy, and terms explain the organization without
   inflated claims.
3. Visitor chooses sign up, log in, or a public legal/contact path.

Acceptance:
- Navigation works on desktop and mobile.
- No public claim depends on unverifiable partner, reach, placement, or outcome
  data.
- Mobile has no horizontal overflow and all important actions are reachable by
  keyboard and touch.

## Authentication And Onboarding

1. Visitor opens `/signup` or `/login`.
2. Auth form validates input and presents safe loading, success, error, and
   unavailable states.
3. OAuth/email callback returns through `/auth/callback`.
4. The database ensures exactly one profile for the authenticated user.
5. New users complete onboarding once.
6. Completed users enter `/portal` or the requested protected deep link.

Acceptance:
- Missing sessions cannot access member routes.
- Duplicate callbacks do not create duplicate profiles.
- Auth failures do not expose local configuration or provider internals.
- Returning users preserve profile, saved items, progress, and preferences.

## Member Dashboard

1. Member enters the dashboard after onboarding.
2. Dashboard loads current next actions, saved content, lesson progress,
   notifications, events, opportunities, and recent Debrief content.
3. Empty and error states explain the current condition and provide a next step.

Acceptance:
- Dashboard reads only the signed-in member's permitted records.
- Loading and retry states are visible.
- Every call to action has a real destination or a disabled state with a reason.

## Finance Debrief

1. Member opens Debrief content.
2. Published items can be read, filtered, opened, and saved.
3. Source-only records clearly send the reader to the original source.
4. Saved items appear in Saved and remain after sign-out/sign-in.

Acceptance:
- Draft content is administrator-only.
- Save operations are idempotent.
- External links are labelled honestly.

## Learning

1. Member opens courses/modules.
2. Member starts or continues lessons.
3. Lesson progress is stored per user and reflected in module progress.

Acceptance:
- Progress persists across sessions.
- Invalid lesson/module IDs produce not-found or unavailable states.
- Members cannot write another member's progress.

## Opportunities, Research, Events, And Chapters

1. Member browses active opportunities, research projects, chapters, and events.
2. Member registers or applies where the item is open and eligible.
3. Member sees current status after submission.
4. Research leads/admins review records they are authorized to manage.

Acceptance:
- Closed, expired, draft, or full items reject direct writes.
- Duplicate registrations/applications fail cleanly.
- Capacity, deadline, and ownership checks are enforced by the database.

## Notifications, Profile, Settings

1. Member sees notifications and can update notification preferences.
2. Member updates profile fields and avatar subject to validation.
3. Member exports data or requests account deletion.
4. Member signs out and returns to public state.

Acceptance:
- Profile updates cannot change role, email, or onboarding lifecycle fields from
  browser-controlled writes.
- Uploads are restricted by type, size, and ownership.
- Account deletion is JWT-protected and prevents deleting the sole admin.

## Administration

1. Admin opens the admin workspace.
2. Admin creates, edits, publishes, archives, or reviews content.
3. Admin sees contact/moderation queues, member management, analytics, error
   reports, and digest logs.
4. Privileged actions report success or failure and require confirmation where
   destructive.

Acceptance:
- Non-admin direct writes are rejected by RLS.
- Privileged mutations are validated server-side.
- Operational views are read-only unless a real admin action is available.
