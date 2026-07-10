# Deploy to Vercel (Production)

This is a **Vite** app. All client env vars must use the `VITE_` prefix so they are exposed at build time. Do **not** use `NEXT_PUBLIC_`.

## 1. Connect repo to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import `build-the-future-11/finance4all-global-reach`
3. Framework: **Vite** (auto-detected)
4. **Do not deploy yet** — add env vars first

## 2. Environment variables (REQUIRED)

In Vercel → Project → **Settings** → **Environment Variables**, add:

| Name | Value | Environments |
|------|-------|--------------|
| `VITE_SUPABASE_URL` | `https://pnemeegkwyaicsbnbnmg.supabase.co` | Production, Preview, Development |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase **anon** JWT (`eyJ...`) | Production, Preview, Development |
| `VITE_APP_URL` | `https://YOUR-PROJECT.vercel.app` (recommended) | Production |

Optional (only if you omit `VITE_SUPABASE_ANON_KEY`):

| Name | Value |
|------|-------|
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_...` from Supabase dashboard |

**Never** add `SUPABASE_SERVICE_ROLE_KEY`, `sb_secret_...`, or any secret key to Vercel env vars that ship to the browser. Those are server-only.

Then click **Redeploy** — Vite bakes env vars in at **build** time, so changing them requires a new deploy.

### Local development

```bash
cp .env.example .env
# Edit .env with your anon JWT, then:
npm run dev
```

Dev server runs at **http://localhost:8080** (see `vite.config.ts`).

## 3. Supabase redirect URLs (REQUIRED for Google login)

In [Supabase Dashboard](https://supabase.com/dashboard/project/pnemeegkwyaicsbnbnmg) → **Authentication** → **URL Configuration**:

**Site URL** (production) — must be your **live Vercel URL**, NOT localhost:

```
https://YOUR-PROJECT.vercel.app
```

If Site URL is `http://localhost:8080`, Google sign-in on production will redirect to localhost and fail with `ERR_CONNECTION_REFUSED`.

**Redirect URLs** — add ALL of these:

```
http://localhost:8080/auth/callback
http://localhost:8080/reset-password
https://YOUR-PROJECT.vercel.app/auth/callback
https://YOUR-PROJECT.vercel.app/reset-password
https://YOUR-PROJECT-*.vercel.app/auth/callback
https://YOUR-PROJECT-*.vercel.app/reset-password
```

Replace `YOUR-PROJECT` with your Vercel subdomain (e.g. `finance4all-global-reach`).

The app callback route is `/auth/callback` (`src/lib/supabase.ts` → `getAuthRedirectUrl()`).

**Google Cloud Console** (if using Google OAuth): authorized redirect URI must be:

```
https://pnemeegkwyaicsbnbnmg.supabase.co/auth/v1/callback
```

## 4. Database

If not done yet, run in Supabase SQL Editor (in order):

1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/seed.sql`
3. `supabase/migrations/002_google_oauth.sql` (Google login)
4. `supabase/migrations/003_bookmarks_notifications.sql` (bookmarks + notifications)
5. `supabase/migrations/004_avatar_storage.sql` (profile avatars)

## 5. Deploy

Push to `main` from **your** GitHub account — Vercel Hobby only deploys commits authored by the repo owner on private repos.

```bash
# Use your GitHub noreply email (Settings → Emails on github.com)
git config user.email "271452460+build-the-future-11@users.noreply.github.com"
git push origin main
```

If a deploy is blocked for “commit author did not have contributing access”, the push was made with the wrong email (e.g. `youremail@example.com`). Amend or recommit with your GitHub-linked email, then push again.

Or deploy manually:

```bash
npx vercel --prod
```

## Verify

1. Open `https://YOUR-PROJECT.vercel.app/login`
2. No `placeholder.supabase.co` or missing-env errors in console
3. Google sign-in completes and lands on `/portal`
4. Portal loads news/events data
5. Promote your account to admin (Supabase SQL Editor):

```sql
UPDATE profiles SET role = 'admin' WHERE email = 'your@email.com';
```

Then open `/portal/admin` to publish content.

### Quick API check (local or CI)

```bash
curl -s -o /dev/null -w "%{http_code}\n" \
  -H "apikey: YOUR_ANON_JWT" \
  -H "Authorization: Bearer YOUR_ANON_JWT" \
  "https://pnemeegkwyaicsbnbnmg.supabase.co/rest/v1/"
```

Expect `200` — confirms URL and anon key are valid.
