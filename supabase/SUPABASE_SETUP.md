# Supabase — complete setup guide

Follow these steps **in order** for a working production portal.

## 1. Project credentials

In [Supabase Dashboard](https://supabase.com/dashboard/project/pnemeegkwyaicsbnbnmg) → **Settings → API**:

| Use in app | Value |
|------------|-------|
| `VITE_SUPABASE_URL` | `https://pnemeegkwyaicsbnbnmg.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Your **anon** JWT (`eyJ...`) |

**Never** put `service_role` / `sb_secret_...` in the frontend or Vercel client env vars.

The app includes safe project defaults if Vercel env vars are missing, but you should still set them for production.

## 2. Run SQL migrations (in order)

Open **SQL Editor** and run each file:

1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/seed.sql`
3. `supabase/migrations/002_google_oauth.sql`
4. `supabase/migrations/003_bookmarks_notifications.sql`
5. `supabase/migrations/004_avatar_storage.sql`

## 3. Auth redirect URLs

**Authentication → URL Configuration**

**Site URL:**
```
https://YOUR-APP.vercel.app
```

**Redirect URLs:**
```
http://localhost:8080/auth/callback
http://localhost:8080/reset-password
https://YOUR-APP.vercel.app/auth/callback
https://YOUR-APP.vercel.app/reset-password
https://YOUR-APP-*.vercel.app/auth/callback
https://YOUR-APP-*.vercel.app/reset-password
```

**Google OAuth** (if enabled): add in Google Cloud Console:
```
https://pnemeegkwyaicsbnbnmg.supabase.co/auth/v1/callback
```

## 4. Enable Google login (optional)

1. Supabase → **Authentication → Providers → Google** → Enable
2. Add Client ID + Secret from Google Cloud Console

## 5. Promote yourself to admin

```sql
UPDATE profiles SET role = 'admin' WHERE email = 'your@email.com';
```

Then open `/portal/admin` to publish content.

## 6. Vercel environment variables

| Variable | Required |
|----------|----------|
| `VITE_SUPABASE_URL` | Yes |
| `VITE_SUPABASE_ANON_KEY` | Yes |
| `VITE_NEWSAPI_KEY` | Optional — enables live headlines on Debriefed |

Redeploy after changing env vars (Vite bakes them at build time).

## 7. Verify connection

```bash
curl -s -o /dev/null -w "%{http_code}\n" \
  -H "apikey: YOUR_ANON_JWT" \
  -H "Authorization: Bearer YOUR_ANON_JWT" \
  "https://pnemeegkwyaicsbnbnmg.supabase.co/rest/v1/chapters?select=id&limit=1"
```

Expect `200`.

## 8. Troubleshooting

| Error | Fix |
|-------|-----|
| `Missing Supabase env vars` | Set `VITE_*` in `.env` locally or Vercel; restart dev server |
| `localhost:0` / `ERR_UNSAFE_PORT` | Pull latest code — fixed with project URL defaults |
| `Failed to fetch` on signup | Check redirect URLs; confirm anon key is JWT not publishable key |
| Bookmarks/notifications fail | Run migration `003` |
| Avatar upload fails | Run migration `004`; check Storage → avatars bucket exists |
| Google login loops | Add exact callback URL to Supabase + Google Console |

## 9. Security checklist

- [ ] Rotate secret key if it was ever pasted in chat
- [ ] RLS enabled on all tables (migrations handle this)
- [ ] Only anon key in client env vars
- [ ] Admin role assigned only to trusted emails
