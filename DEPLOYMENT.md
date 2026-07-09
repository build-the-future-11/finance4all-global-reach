# Deploy to Vercel (Production)

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
| `VITE_SUPABASE_ANON_KEY` | your `eyJ...` anon key | Production, Preview, Development |

Then click **Redeploy** (env vars are baked in at build time).

## 3. Supabase redirect URLs (REQUIRED for Google login)

In [Supabase Dashboard](https://supabase.com/dashboard/project/pnemeegkwyaicsbnbnmg) → **Authentication** → **URL Configuration**:

**Site URL** (your Vercel URL):
```
https://YOUR-PROJECT.vercel.app
```

**Redirect URLs** — add ALL of these:
```
https://YOUR-PROJECT.vercel.app/auth/callback
https://YOUR-PROJECT-*.vercel.app/auth/callback
http://localhost:8080/auth/callback
```

Replace `YOUR-PROJECT` with your actual Vercel subdomain (e.g. `finance4all-global-reach`).

## 4. Database

If not done yet, run in Supabase SQL Editor:
1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/seed.sql`
3. `supabase/migrations/002_google_oauth.sql` (if Google login)

## 5. Deploy

Push to `main` — Vercel auto-deploys. Or:

```bash
npx vercel --prod
```

## Verify

1. Open `https://YOUR-PROJECT.vercel.app/login`
2. No `placeholder.supabase.co` errors in console
3. Google sign-in works
4. Portal loads with news/events data
