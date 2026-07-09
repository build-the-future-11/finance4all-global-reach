# Supabase Setup — Step by Step

Follow these steps to connect your Finance4All portal to Supabase.

---

## Step 1: Create a Supabase project

1. Go to [https://supabase.com](https://supabase.com) and sign in (or create an account).
2. Click **New project**.
3. Choose your organization, then set:
   - **Name:** `finance4all` (or anything you like)
   - **Database password:** save this somewhere safe
   - **Region:** pick the closest to your users
4. Click **Create new project** and wait ~2 minutes for it to provision.

---

## Step 2: Run the database migration

1. In your Supabase dashboard, open **SQL Editor** (left sidebar).
2. Click **New query**.
3. Open `supabase/migrations/001_initial_schema.sql` from this repo, copy the entire file, paste into the editor.
4. Click **Run** (or press Cmd/Ctrl + Enter).
5. You should see **Success. No rows returned**.

This creates all tables, security policies, and the auto-profile trigger.

---

## Step 3: Add seed data (optional but recommended)

1. In SQL Editor, click **New query** again.
2. Copy everything from `supabase/seed.sql`, paste, and **Run**.
3. This adds sample news, explainers, chapters, events, and opportunities so the portal isn't empty.

---

## Step 4: Configure authentication

1. Go to **Authentication** → **Providers**.
2. Make sure **Email** is enabled (on by default).
3. For local development, disable email confirmation:
   - Go to **Authentication** → **Settings** (or **Sign In / Providers** → email settings)
   - Turn off **Confirm email** so you can sign up instantly without checking inbox.

---

## Step 5: Get your API keys

1. Go to **Project Settings** (gear icon) → **API**.
2. Copy these two values:
   - **Project URL** — looks like `https://abcdefgh.supabase.co`
   - **anon public** key — long string starting with `eyJ...`

> Use the **anon** key, not the service_role key. The anon key is safe for the browser.

---

## Step 6: Create your `.env` file

In the project root (same folder as `package.json`):

```bash
cp .env.example .env
```

Open `.env` and paste your values:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=eyJYOUR_ANON_KEY_HERE
```

Save the file. **Restart** the dev server if it's already running:

```bash
npm run dev
```

---

## Step 7: Test it

1. Open [http://localhost:8080/signup](http://localhost:8080/signup)
2. Create an account with any email + password (6+ chars).
3. Complete onboarding.
4. You should land on `/portal` with stats and sample content.

If you see data on the dashboard, Supabase is connected.

---

## Step 8: Promote your role (optional)

New accounts are `member` by default. To test lead researcher features (create projects, review applications):

1. Go to **SQL Editor** in Supabase.
2. Run:

```sql
UPDATE profiles
SET role = 'lead_researcher'
WHERE email = 'your-email@example.com';
```

For full admin access:

```sql
UPDATE profiles
SET role = 'admin'
WHERE email = 'your-email@example.com';
```

Sign out and back in to see the updated role.

---

## Deploying (Vercel / Lovable / Netlify)

Add the same two env vars in your hosting dashboard:

| Variable | Value |
|----------|-------|
| `VITE_SUPABASE_URL` | Your project URL |
| `VITE_SUPABASE_ANON_KEY` | Your anon key |

Redeploy after saving. The portal won't work in production without these.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| "Supabase not connected" banner on login | `.env` missing or dev server not restarted |
| Sign up works but no data loads | Run migration + seed SQL |
| "new row violates row-level security" | Migration didn't run fully — re-run `001_initial_schema.sql` |
| Sign up but can't log in | Disable email confirmation in Auth settings, or check your inbox |
| Profile not created on signup | Re-run migration (the `handle_new_user` trigger may be missing) |

---

## Quick reference

```
Project root/
  .env                          ← your secrets (never commit)
  .env.example                  ← template
  supabase/
    migrations/001_initial_schema.sql   ← run first
    seed.sql                            ← run second
```
