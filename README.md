# Finance4All Global Reach

> **Canonical FinanceMeta/Finance4All portal source:** `build-the-future-11/finance4all-global-reach`  
> `build-the-future-11/FinanceMeta-Landing` and `build-the-future-11/FinanceMeta-Global` are separate sibling surfaces; do not use them as the portal deployment source unless a task explicitly targets those repositories.

Student finance learning site and **Supabase-powered member portal**.

**Live on Vercel:** set env vars (see [DEPLOYMENT.md](DEPLOYMENT.md)) then deploy.

**Runtime:** Node.js 22.12 or newer and npm 10.9.8. The release contract rejects older Node
versions, alternate package managers, and conflicting lockfiles.

## Portal modules

| Route | Feature |
|-------|---------|
| `/portal` | Dashboard |
| `/portal/debriefed` | News + digest prefs |
| `/portal/labs` | Research projects + apply |
| `/portal/pathways` | Opportunities, studios, essays |
| `/portal/events` | Chapters + events |
| `/portal/network` | Profiles + connections |
| `/portal/settings` | Profile settings, personal-data export, deletion requests |
| `/portal/admin` | Content management and account-deletion review queue (admin only) |
| `/evidence` | Public release, program, and research evidence boundary |

## Vercel deploy (required env vars)

```
VITE_SUPABASE_URL=https://pnemeegkwyaicsbnbnmg.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your-key
VITE_AUTH_REDIRECT_ORIGIN=https://finance4all-global-reach.vercel.app
```

Add redirect URL in Supabase: `https://YOUR-APP.vercel.app/auth/callback`

Full guide: **[DEPLOYMENT.md](DEPLOYMENT.md)**

## Local dev

```bash
npm ci
cp .env.example .env   # add Supabase keys
npm run validate:env
npm run dev
```

## Stack

React · Vite · Tailwind · shadcn/ui · Supabase · TanStack Query

## Production certification

The normal CI suite uses a deterministic browser-safe configuration fixture. A separate manually
triggered `Production Auth Certification` workflow signs in two non-privileged test identities
against the live portal and verifies session separation and logout protection. Configure the four
`E2E_MEMBER_A_*` and `E2E_MEMBER_B_*` repository secrets before running it; never commit test
credentials.

Database authorization is independently checked by
`supabase/tests/two_identity_rls_certification.sql` and
`supabase/tests/account_lifecycle_rls_certification.sql`. They exercise independent member
identities and an admin inside transactions ending in `ROLLBACK`, so certification does not retain
mutations. The account request does not pretend to delete an identity: an operator must perform the
privileged Supabase Auth deletion after review, which then cascades member-owned data.

The two-identity suite creates synthetic ordinary members inside a transaction,
inventories every canonical public table, exercises owner and cross-member
mutations, and ends with `ROLLBACK`. Configure the canonical project's database connection as the
`FINANCEMETA_DATABASE_URL` Actions secret and run `Production RLS Certification`; the retained log
must end in `result=PASS` before the production authorization gate is considered complete.

`npm run test:e2e` runs real Chromium interactions plus Axe against every public entry and recovery
route. These browser checks complement the component and source-contract tests; they do not replace
the credentialed production workflow.

The current evidence and remaining external blockers are tracked in
[`docs/PRODUCTION_READINESS.md`](docs/PRODUCTION_READINESS.md).
