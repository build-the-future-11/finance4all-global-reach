# Data Model

Snapshot through migrations **001–019**.

## Pass 3 additions (014)

### submission moderation
`studio_submissions` / `essay_submissions`: `status` (pending|approved|rejected|archived), `moderated_at`, `moderated_by`, `moderation_note`.  
Public SELECT: approved OR author OR admin. RPCs: `moderate_studio_submission`, `moderate_essay_submission`.

### member_certificates
`user_id`, `curriculum_key`, `title`, `verification_code`, `lesson_ids[]`, `issued_at`.  
RPC: `issue_my_curriculum_certificate` (requires all listed lessons in `education_lesson_progress`).

### chapter_leaders
`(chapter_id, user_id)`, `role` (lead|co_lead|coordinator). RPCs: `appoint_chapter_leader`, `remove_chapter_leader`.

### competitions
`title`, `description`, `status` (draft|open|closed|archived), optional `chapter_id` / `opportunity_id`, dates, `registration_url`. Members read open/closed.

## Safety / chapter tools (015–016)

### content_reports
`reporter_id`, `target_type`, `target_id`, `reason`, `details`, `status`.  
**Inserts only via** `submit_content_report` (rate-limited SECURITY DEFINER). No authenticated INSERT policy (016). Resolve via `resolve_content_report` (admin).

### my_chapter_leader_snapshot
RPC returning chapter membership/registration snapshot for appointed leaders.

---

## Roles

`user_role`: `member` | `lead_researcher` | `admin`

## Core identity

### profiles
`id` (auth.users FK), `display_name`, `email`, `role`, `bio`, `avatar_url`, `interests[]`, `open_to_collaborate`, `chapter_id`, `onboarding_completed_at`, timestamps.

Write path for members: RPCs `update_my_profile`, `complete_profile_onboarding`, `set_my_avatar` — not direct privileged updates.

### member_directory (view)
Public-safe profile projection (no email / onboarding internals).

## Finance Debrief (013)

### approved_sources
`id`, `name`, `homepage_url`, `allowed_domains[]`, `notes`, `is_active`, `created_by`, timestamps. RLS: admin write; authenticated read active.

### news_articles
Legacy: `title`, `summary`, `category`, `source_url?`, `published_at`, `is_published`, `tags[]`.  
Editorial (013): `status` (draft|in_review|scheduled|published|corrected|archived), `source_id` FK, `source_published_at`, `topics[]`, `regions[]`, `importance`, `author_id`, `editor_id`, `scheduled_for`, `newsletter_include`, `ai_assisted`, `disclaimer_version`, `body`.

Publish path: `publish_news_article` / `transition_news_article_status` + trigger `enforce_news_article_publish_rules` (approved source required; AI-assisted requires generation log).

### news_article_versions
`article_id`, `version`, `snapshot jsonb`, `changed_by`, `change_note`, `created_at`. RPC: `record_news_article_version`.

### debrief_ai_generation_logs
`id`, `article_id?`, `model`, `prompt_hash`, `source_ids[]`, `output_excerpt`, `status`, `created_by`, `created_at`, `used_in_publish`. RPC: `queue_debrief_ai_generation`.

### explainer_cards / news_bookmarks
Unchanged from prior migrations.

## Learning CMS (008)

`education_modules`, `education_lessons`, `education_lesson_progress`, `resource_items`, `resource_guides`, `webinars`, `testimonials`, `weekly_goal_baselines`.

## Labs / Pathways / Events / Network

See ARCHITECTURE domain table. Notable enums: `research_project_status`, `lab_application_status`, `opportunity_type`, `event_status`, `connection_status`.

## Operations

`contact_submissions`, `notifications`, `rate_limit_events`, `product_analytics_events`, `client_error_events`, `digest_send_log`, `digest_preferences`.

Digest selects Debrief rows with `newsletter_include` and status published/corrected.

## Storage

Bucket `avatars` — path scoped to user id (004 + 011).

## Seeds

`supabase/seed.sql` — **dev only**. Do not launch with unverified demo rows. Legacy published articles backfilled to a “Legacy editorial archive” approved source in 013.
