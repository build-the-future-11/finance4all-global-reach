# Data Model

Pass 1 snapshot of production schema baseline (migrations 001–012).

## Roles

`user_role`: `member` | `lead_researcher` | `admin`

## Core identity

### profiles
`id` (auth.users FK), `display_name`, `email`, `role`, `bio`, `avatar_url`, `interests[]`, `open_to_collaborate`, `chapter_id`, `onboarding_completed_at`, timestamps.

Write path for members: RPCs `update_my_profile`, `complete_profile_onboarding`, `set_my_avatar` — not direct privileged updates.

### member_directory (view)
Public-safe profile projection (no email / onboarding internals).

## Finance Debrief (current)

### news_articles
`title`, `summary`, `category` (macro|markets|ipo|company), `source_url?`, `published_at`, `is_published`, `tags[]`.

### explainer_cards
`slug`, `title`, `summary`, `body`, `difficulty`, `related_terms[]`.

### news_bookmarks
`(user_id, article_id)`.

## Finance Debrief (target — Pass 2)

Proposed additions (not yet migrated):

### approved_sources
`id`, `name`, `homepage_url`, `allowed_domains[]`, `notes`, `is_active`, `created_by`, timestamps.

### news_articles extensions
`status` (draft|in_review|scheduled|published|corrected|archived), `source_id` FK, `source_published_at`, `topics[]`, `regions[]`, `importance` (1–5), `author_id`, `editor_id`, `scheduled_for`, `newsletter_include`, `ai_assisted` bool, `disclaimer_version`.

### news_article_versions
`article_id`, `version`, `snapshot jsonb`, `changed_by`, `change_note`, `created_at`.

### debrief_ai_generation_logs
`id`, `article_id?`, `model`, `prompt_hash`, `source_ids[]`, `output_excerpt`, `created_by`, `created_at`, `used_in_publish` bool default false.

Publish RPC must assert: status transition allowed ∧ source approved ∧ human actor ∧ (if ai_assisted ⇒ log exists ∧ editor confirmed).

## Learning CMS (008)

`education_modules`, `education_lessons`, `education_lesson_progress`, `resource_items`, `resource_guides`, `webinars`, `testimonials`, `weekly_goal_baselines`.

## Labs / Pathways / Events / Network

See ARCHITECTURE domain table. Notable enums: `research_project_status`, `lab_application_status`, `opportunity_type`, `event_status`, `connection_status`.

## Operations

`contact_submissions`, `notifications`, `rate_limit_events`, `product_analytics_events`, `client_error_events`, `digest_send_log`, `digest_preferences`.

## Storage

Bucket `avatars` — path scoped to user id (004 + 011).

## Seeds

`supabase/seed.sql` — **dev only**. Do not launch with unverified demo rows.
