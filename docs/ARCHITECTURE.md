# Architecture

Status: Pass 1 source-of-truth architecture for FinanceMeta / Finance4All.

## Stack

| Layer | Technology |
| --- | --- |
| UI | React 18, TypeScript, Vite 5, React Router 6 |
| Data client | TanStack Query + `@supabase/supabase-js` |
| Styling | Tailwind CSS, shadcn/Radix |
| Backend | Supabase Auth, Postgres, RLS, Storage, RPCs, Edge Functions |
| Hosting | Vercel static SPA |
| CI | GitHub Actions: audit, lint, typecheck, unit, build, release:static, e2e |

## Trust boundary

The browser renders UI only. Permission decisions live in:

- RLS policies
- SECURITY DEFINER RPCs (`update_my_profile`, `complete_profile_onboarding`, `ensure_my_profile`, rate limits, analytics)
- Triggers (role escalation blocks, notification inserts, registration windows)
- JWT-protected Edge Functions (`delete-account`, `weekly-digest` with cron secret)

## Application shells

1. **Public** — landing, legal, contact section
2. **Auth** — login/signup/forgot/reset/callback
3. **Portal** — `PortalLayout` + lazy feature routes under `/portal`
4. **Admin** — `/portal/admin` with `RoleGuard`

## Route map

See `src/components/AppRouter.tsx` and `src/routes/portal.ts`.

```
/ → Index (landing)
/login|/signup|/forgot-password|/reset-password|/auth/callback
/privacy|/terms
/onboarding (auth)
/portal (auth)
  ├ debriefed, debriefed/explainers/:slug?
  ├ labs, labs/:id, labs/review (lead|admin)
  ├ pathways, pathways/opportunities|studios|essays
  ├ events, network, network/profile/:id
  ├ education, education/:lessonId
  ├ resources, resources/:id
  ├ saved, activity, settings
  └ admin (admin)
```

## Data domains

| Domain | Primary tables |
| --- | --- |
| Identity | `profiles`, `digest_preferences` |
| Debrief | `approved_sources`, `news_articles`, `news_article_versions`, `debrief_ai_generation_logs`, `explainer_cards`, `news_bookmarks` |
| Labs | `research_projects`, `lab_applications`, `project_bookmarks` |
| Pathways | `opportunities`, `opportunity_interests`, `studio_submissions`, `essay_submissions`, `essay_upvotes` |
| Chapters/events | `chapters`, `events`, `event_registrations` |
| Network | `member_directory` view, `connection_requests`, `introduction_posts` |
| Learning | `education_modules`, `education_lessons`, `education_lesson_progress` |
| Resources | `resource_items`, `resource_guides`, `webinars`, `testimonials` |
| Ops | `contact_submissions`, `notifications`, `rate_limit_events`, `product_analytics_events`, `client_error_events`, `digest_send_log`, `weekly_goal_baselines` |

## Migrations

Ordered `001`…`013`. Consolidated: `supabase/FINAL_SETUP.sql`. Verify: `supabase/VERIFY_SETUP.sql`.

## Edge Functions

| Function | Auth | Purpose |
| --- | --- | --- |
| `weekly-digest` | Cron secret header | Email digest via Resend |
| `delete-account` | User JWT | Account deletion; blocks sole admin |

## Frontend module layout

- `src/pages/` — routes
- `src/hooks/portal/` — React Query data access
- `src/components/portal/` — portal chrome + guards
- `src/components/landing/` — public sections
- `src/lib/` — security, mappers, analytics
- `src/data/` — static CMS fallbacks
- `src/types/database.ts` — typed schema

## Finance Debrief architecture (Pass 2 Wave 1 — source)

```
approved_sources ──┐
                   ├── news_articles (editorial status machine)
debrief_ai_logs ───┘         │
                             ├── news_article_versions
                             └── newsletter inclusion flags
```

Publish path: `publish_news_article` / `transition_news_article_status` + trigger `enforce_news_article_publish_rules`. Requires approved source; AI-assisted requires generation log. Client adapter queues only — never auto-publishes. Member UI shows educational disclaimer + source attribution. Live DB activation: OA-1.

## Production dependencies (non-code)

Supabase migrations, Auth URLs, Vercel `VITE_*`, Edge secrets, email sender, real content, legal approval, monitoring.
