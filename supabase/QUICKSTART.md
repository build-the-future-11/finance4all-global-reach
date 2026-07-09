# Finance4All — Quick Setup (test in 5 minutes)

Your `.env` is already configured locally. Follow these steps in order.

---

## Step 1: Add redirect URL in Supabase (required for Google login)

1. Open [Supabase Dashboard](https://supabase.com/dashboard/project/pnemeegkwyaicsbnbnmg)
2. Go to **Authentication** → **URL Configuration**
3. Set **Site URL** to: `http://localhost:8080`
4. Under **Redirect URLs**, add:
   ```
   http://localhost:8080/auth/callback
   ```
5. Click **Save**

> When you deploy, also add `https://your-domain.com/auth/callback`

---

## Step 2: Run database setup (one paste)

1. Go to **SQL Editor** → **New query**
2. Open `supabase/migrations/001_initial_schema.sql` from this repo
3. Copy **all** of it → paste → **Run**
4. New query → open `supabase/seed.sql` → copy → paste → **Run**

If you already ran step 2 before, just run `supabase/migrations/002_google_oauth.sql` instead.

---

## Step 3: Start the app

```bash
npm install
npm run dev
```

Open: **http://localhost:8080/login**

---

## Step 4: Sign in

Click **Continue with Google** — or use email/password on `/signup`.

After login you'll land on `/portal` with news, events, opportunities, and more.

---

## Google OAuth checklist

| Setting | Value |
|---------|-------|
| Provider enabled | Authentication → Providers → Google ✅ |
| Site URL | `http://localhost:8080` |
| Redirect URL | `http://localhost:8080/auth/callback` |
| Google Cloud redirect | `https://pnemeegkwyaicsbnbnmg.supabase.co/auth/v1/callback` (set in Google Console) |

---

## Promote your account (optional)

```sql
UPDATE profiles SET role = 'lead_researcher' WHERE email = 'you@gmail.com';
```

---

## Troubleshooting

| Error | Fix |
|-------|-----|
| Google redirects but login fails | Add `http://localhost:8080/auth/callback` to Redirect URLs |
| Blank portal / no data | Run `001_initial_schema.sql` + `seed.sql` |
| "relation does not exist" | Migration not run yet |
| Profile not created | Run `002_google_oauth.sql` |
