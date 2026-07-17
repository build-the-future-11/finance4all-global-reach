# RLS Role Matrix

Source-level expectation for Finance4All / FinanceMeta. **Live proof** requires OA-1 (schema applied) then running `supabase/VERIFY_RLS_MATRIX.sql` as each role in the SQL editor or via service-role test harness.

## Actors

| Actor | How established |
| --- | --- |
| `anon` | No JWT |
| `authenticated` member | `profiles.role = member` |
| `lead_researcher` | `profiles.role = lead_researcher` |
| `admin` | `profiles.role = admin` |
| Service role | Edge Functions only — never browser |

## Matrix (expected)

| Resource | Anon | Member | Lead researcher | Admin |
| --- | --- | --- | --- | --- |
| `profiles` own row | — | R/W via RPC | R/W via RPC | R + role update |
| `member_directory` | — | R | R | R |
| `news_articles` drafts | — | — | — | R/W |
| `news_articles` published | — | R | R | R/W + publish RPC |
| `approved_sources` | — | R active | R active | R/W |
| `studio_submissions` pending | — | own only | own only | all + moderate |
| `studio_submissions` approved | — | R | R | R/W |
| `essay_submissions` | same as studios | + upvotes own | | editorial pick |
| `research_projects` non-draft | — | R | R + create | R all |
| `lab_applications` | — | own | project lead review | all |
| `opportunities` active | — | R + interest | R | R/W |
| `competitions` open/closed | — | R | R | R/W all statuses |
| `chapters` / `events` | — | R + RSVP | R | R/W |
| `chapter_leaders` | — | R | R | appoint/remove |
| `member_certificates` | — | own R + issue RPC | own | all R |
| `education_lesson_progress` | — | own | own | own (no cross-user) |
| `contact_submissions` | insert RPC | — | — | R/W status |
| `notifications` | — | own | own | own |
| Storage `avatars` | — | own path | own path | own path |

## Hard rules

1. Members cannot escalate `profiles.role` or change email via client update.
2. AI-assisted Debrief cannot publish without generation log + approved source (trigger + RPC).
3. Pending studio/essay rows are not listed to other members.
4. Service role key never appears in `VITE_*` or browser bundles.

## Validation

1. Apply `FINAL_SETUP.sql` + `VERIFY_SETUP.sql` (all `ok`).
2. Run `VERIFY_RLS_MATRIX.sql` — policy presence checks.
3. Manual: sign in as member vs admin and confirm Admin routes + publish/moderate.
4. Pass 4+ authenticated e2e with `E2E_EMAIL` / `E2E_PASSWORD` against staging.

**Status:** Documentation + policy presence script = engineering done. Live role-as sampling remains **BLOCKED** on OA-1 / staging credentials (FM-SEC-001).
