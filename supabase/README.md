# Supabase setup for Finance4All Portal

## 1. Create a Supabase project

Go to [supabase.com](https://supabase.com) and create a new project.

## 2. Run the database migration

In the Supabase dashboard → **SQL Editor**, run these files in order:

1. `supabase/migrations/001_initial_schema.sql` — tables, RLS, triggers
2. `supabase/seed.sql` — sample news, explainers, chapters, events, opportunities

## 3. Configure auth

In **Authentication → Providers**, enable Email. For local dev you may disable email confirmation under **Authentication → Settings**.

## 4. Environment variables

Copy `.env.example` to `.env` and fill in your project credentials from **Settings → API**:

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

## 5. Promote roles (optional)

New users default to `member`. To test lead researcher or admin features:

```sql
UPDATE profiles SET role = 'lead_researcher' WHERE email = 'you@example.com';
-- or
UPDATE profiles SET role = 'admin' WHERE email = 'you@example.com';
```

## 6. Run the app

```bash
npm run dev
```

Visit `/signup` to create an account, complete onboarding, then access `/portal`.

## Portal modules

| Route | Feature |
|-------|---------|
| `/portal` | Dashboard with stats |
| `/portal/debriefed` | News feed + digest prefs |
| `/portal/debriefed/explainers` | Beginner explainers |
| `/portal/labs` | Research projects + apply |
| `/portal/labs/review` | Review applications (lead/admin) |
| `/portal/pathways` | Opportunity board |
| `/portal/pathways/studios` | Project submissions |
| `/portal/pathways/essays` | Essay challenge + upvotes |
| `/portal/events` | Chapters + event registration |
| `/portal/network` | Profiles, connections, introductions |
