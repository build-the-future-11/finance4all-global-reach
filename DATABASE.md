# Database Guide

Finance4All uses Supabase Postgres with Row Level Security (RLS), RPC write boundaries, and incremental SQL migrations.

## Fastest production setup

1. Open Supabase **SQL Editor**.
2. Paste and run `supabase/FINAL_SETUP.sql` once.
3. Paste and run `supabase/VERIFY_SETUP.sql`.
4. Every row must return `ok = true`.

CLI alternative:

```bash
supabase link --project-ref <project-ref>
supabase db push
```

## Migration order

| # | File | Purpose |
| --- | --- | --- |
| 001 | `001_initial_schema.sql` | Core enums, profiles, chapters, Debriefed, labs, pathways, events, network, RLS |
| 002 | `002_google_oauth.sql` | OAuth-aware profile creation |
| 003 | `003_bookmarks_notifications.sql` | Bookmarks and notifications |
| 004 | `004_avatar_storage.sql` | Avatar storage bucket + policies |
| 005 | `005_security_hardening.sql` | Role escalation blocks, chapter counts |
| 006 | `006_education_progress.sql` | Cross-device lesson progress |
| 007 | `007_contact_submissions.sql` | Public contact form + admin inbox |
| 008 | `008_platform_cms.sql` | Education/resources CMS, testimonials, weekly goals, rate limits, search RPC |
| 009 | `009_membership_integrity.sql` | Onboarding completion, `ensure_my_profile` |
| 010 | `010_directory_privacy.sql` | `member_directory` view, profile privacy |
| 011 | `011_profile_write_boundary.sql` | `update_my_profile`, `set_my_avatar` RPCs |
| 012 | `012_operational_integrity.sql` | Analytics, client errors, digest log, write boundaries |

## Seeds

- `supabase/seed.sql` — demo chapters, articles, opportunities, events, sample projects.
- Use for development only. Review or remove demo content before public launch.

After migration 008, admins can seed CMS curriculum from **Portal → Admin → System → Seed CMS content**.

## Key tables by feature

| Feature | Tables |
| --- | --- |
| Auth / profiles | `profiles`, `digest_preferences` |
| Debriefed | `news_articles`, `explainer_cards`, `news_bookmarks` |
| Labs | `research_projects`, `lab_applications`, `project_bookmarks` |
| Pathways | `opportunities`, `opportunity_interests`, `studio_submissions`, `essay_submissions`, `essay_upvotes` |
| Events | `chapters`, `events`, `event_registrations` |
| Network | `member_directory` (view), `connection_requests`, `introduction_posts` |
| Education | `education_modules`, `education_lessons`, `education_lesson_progress` |
| Resources | `resource_items`, `resource_guides`, `webinars` |
| Landing | `testimonials` |
| Ops | `contact_submissions`, `rate_limit_events`, `product_analytics_events`, `client_error_events`, `digest_send_log` |

## Types

Application types live in `src/types/database.ts`. Regenerate or extend this file when migrations add tables or RPCs.

## RLS verification

After setup, verify with real accounts:

1. **Anonymous** — cannot read portal tables.
2. **Member** — can read/write only own private rows (progress, bookmarks, applications).
3. **Lead researcher** — can manage own lab projects and review assigned applications.
4. **Admin** — can publish content, read inbox, change roles, view operational logs.

Use `supabase/VERIFY_SETUP.sql` for automated schema/policy checks.

## Promote an administrator

```sql
UPDATE profiles SET role = 'admin' WHERE email = 'your@email.com';
```
